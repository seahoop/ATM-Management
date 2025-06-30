// This express server used AWS Cognito for authentication using the OpenbID Connect Protocal.
// It supports login, logout, callback handling, user session management, and provides user 
// info to the frontend. 
require('dotenv').config();
const express = require('express');
const session = require('express-session');
const cors = require('cors');
const { Issuer, generators } = require('openid-client');

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware setup
app.use(cors({ origin: 'http://localhost:3000', credentials: true }));
app.use(express.json());
app.use(session({
  secret: process.env.SESSION_SECRET || 'some_secret',
  resave: false,
  saveUninitialized: false,
  cookie: { sameSite: 'lax', secure: false }
}));

// State for the OAuth flow
const codeVerifier = generators.codeVerifier();
const codeChallenge = generators.codeChallenge(codeVerifier);

// Initialize AWS Cognito OpenID Connect client
async function initializeClient() {
  const issuer = await Issuer.discover('https://cognito-idp.us-east-2.amazonaws.com/us-east-2_Lylzuyppl');
  client = new issuer.Client({
    client_id: '4ecd14vqq0niscmt2lhv7cqac7',
    client_secret: process.env.COGNITO_CLIENT_SECRET,
    redirect_uris: ['http://localhost:5001/auth/callback'],
    response_types: ['code']
  });
  console.log('Cognito OIDC client initialized successfully');
}

initializeClient().catch(console.error);

// Auth routes
app.get('/auth/login', (req, res) => {
  if (!client) {
    return res.status(500).send('OIDC client not initialized');
  }
  
  const nonce = generators.nonce();
  const state = generators.state();

  req.session.nonce = nonce;
  req.session.state = state;

  const authUrl = client.authorizationUrl({
    scope: 'email openid phone',
    state: state,
    nonce: nonce,
  });

  res.redirect(authUrl);
});

app.get('/auth/callback', async (req, res) => {
  try {
    const params = client.callbackParams(req);
    const tokenSet = await client.callback(
      'http://localhost:5001/auth/callback',
      params,
      {
        nonce: req.session.nonce,
        state: req.session.state
      }
    );

    const userInfo = await client.userinfo(tokenSet.access_token);
    req.session.userInfo = userInfo;

    res.redirect('http://localhost:3000/callback');
  } catch (err) {
    console.error('Callback error:', err);
    res.status(500).send('Authentication failed: ' + err.message);
  }
});

app.get('/api/user', (req, res) => {
  if (!req.session.userInfo) {
    return res.status(401).json({ error: 'Not authenticated' });
  }
  res.json(req.session.userInfo);
});

app.get('/auth/logout', (req, res) => {
  req.session.destroy();
  const logoutUrl = `https://us-east-2lylzuyppl.auth.us-east-2.amazoncognito.com/logout?client_id=4ecd14vqq0niscmt2lhv7cqac7&logout_uri=http://localhost:3000/`;
  res.redirect(logoutUrl);
});

// DeepSeek ChatBot API endpoint
app.post('/api/chat', async (req, res) => {
  try {
    // Check if user is authenticated
    if (!req.session.userInfo) {
      return res.status(401).json({ error: 'Not authenticated' });
    }
    
    const { message } = req.body;
    console.log('Received message:', message);
    
    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }
    
    console.log('Calling DeepSeek API with key available:', !!process.env.DEEPSEEK_API_KEY);
    
    // Call DeepSeek API
    const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.DEEPSEEK_API_KEY}`
      },
      body: JSON.stringify({
        model: "deepseek-chat",
        messages: [
          { 
            role: "system", 
            content: "You are a helpful banking assistant for Habo Berlin Bank. Provide concise, accurate information about banking services. The current user's name is " + req.session.userInfo.name 
          },
          { role: "user", content: message }
        ],
        temperature: 0.7,
        max_tokens: 800
      })
    });
    
    if (!response.ok) {
      const error = await response.json();
      console.error('DeepSeek API error:', error);
      return res.status(500).json({ error: 'Failed to get response from AI', details: error });
    }
    
    const data = await response.json();
    console.log('Response received from DeepSeek API');
    return res.json({ 
      message: data.choices[0].message.content
    });
  } catch (error) {
    console.error('Chat API error:', error);
    return res.status(500).json({ error: 'An error occurred while processing your request', details: error.message });
  }
});

// Banking API endpoints remain the same
// ...existing code for deposit, withdraw, and balance endpoints...

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});