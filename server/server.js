require('dotenv').config();
const express = require('express');
const session = require('express-session');
const cors = require('cors');
const { Issuer, generators } = require('openid-client');
const fetch = require('node-fetch');
const bodyParser = require('body-parser');

const app = express();
const PORT = 5000;

// Middleware setup
app.use(cors({ origin: 'http://localhost:3000', credentials: true }));
app.use(session({
  secret: 'some secret',
  resave: false,
  saveUninitialized: false,
  cookie: {
    sameSite: 'lax',
    secure: false
  }
}));
app.use(bodyParser.json());

// State for the OAuth flow
const codeVerifier = generators.codeVerifier();
const codeChallenge = generators.codeChallenge(codeVerifier);
let client;

// Initialize AWS Cognito OpenID Connect client
async function initializeClient() {
  try {
   const issuer = await Issuer.discover('https://us-east-2lylzuyppl.auth.us-east-2.amazoncognito.com/oauth2/.well-known/openid-configuration');. b
    client = new issuer.Client({
      client_id: '4ecd14vqq0niscmt2lhv7cqac7',
      // Don't include client_secret if this is a public client
      redirect_uris: ['http://localhost:5000/auth/callback'],
      response_types: ['code'],
    });
    console.log('AWS Cognito client initialized successfully');
  } catch (error) {
    console.error('Failed to initialize AWS Cognito client:', error);
  }
}

initializeClient().catch(console.error);

// Auth routes
app.get('/auth/login', (req, res) => {
  const nonce = generators.nonce();
  const state = generators.state();

  req.session.nonce = nonce;
  req.session.state = state;

  const authUrl = client.authorizationUrl({
    scope: 'email openid phone',
    state: state,
    nonce: nonce,
    code_challenge: codeChallenge,
    code_challenge_method: 'S256',
  });

  res.redirect(authUrl);
});

app.get('/auth/callback', async (req, res) => {
  try {
    const params = client.callbackParams(req);
    const tokenSet = await client.callback(
      'http://localhost:5000/auth/callback', 
      params, 
      {
        nonce: req.session.nonce,
        state: req.session.state,
        code_verifier: codeVerifier,
      }
    );

    const userInfo = await client.userinfo(tokenSet.access_token);
    
    // Store user info in session
    req.session.userInfo = {
      id: userInfo.sub,
      name: userInfo.name || userInfo.email,
      email: userInfo.email,
      picture: userInfo.picture,
      // Mock account data
      Balance: Math.floor(Math.random() * 100000) + 50000,
      AccountNumber: '123456789',
    };

    res.redirect('http://localhost:3000/callback');
  } catch (error) {
    console.error('Authentication error:', error);
    res.status(500).send('Authentication failed');
  }
});

app.get('/api/user', (req, res) => {
  if (req.session.userInfo) {
    res.json(req.session.userInfo);
  } else {
    res.status(401).json({ error: 'Not authenticated' });
  }
});

app.get('/auth/logout', (req, res) => {
  req.session.destroy();
  
  // Redirect to Cognito logout endpoint
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
  console.log(`Server is running on port ${PORT}`);
  console.log(`DeepSeek API key available: ${!!process.env.DEEPSEEK_API_KEY}`);
});