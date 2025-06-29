require('dotenv').config();
const express = require('express');
const session = require('express-session');
const cors = require('cors');
const { Issuer, generators } = require('openid-client');

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(cors({ origin: 'http://localhost:3000', credentials: true }));
app.use(express.json());
app.use(session({
  secret: process.env.SESSION_SECRET || 'some_secret',
  resave: false,
  saveUninitialized: false,
  cookie: { sameSite: 'lax', secure: false }
}));

// OIDC State
let client;
const codeVerifier = generators.codeVerifier();
const codeChallenge = generators.codeChallenge(codeVerifier);

// Initialize OpenID Client
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

// Add a middleware component that checks if a user is authenticated
const checkAuth = (req, res, next) => {
  if (!req.session.userInfo) {
    req.isAuthenticated = false;
  } else {
    req.isAuthenticated = true;
  }
  next();
};

// Configure a home route at the root of your application
app.get('/', checkAuth, (req, res) => {
  res.json({
    isAuthenticated: req.isAuthenticated,
    userInfo: req.session.userInfo || null
  });
});

// Configure a login route
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

// Helper function to get the path from the URL
function getPathFromURL(urlString) {
  try {
    const url = new URL(urlString);
    return url.pathname;
  } catch (error) {
    console.error('Invalid URL:', error);
    return null;
  }
}

// Configure the callback route
app.get(getPathFromURL('http://localhost:5001/auth/callback'), async (req, res) => {
  if (!client) {
    return res.status(500).send('OIDC client not initialized');
  }
  
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

// User info endpoint
app.get('/api/user', (req, res) => {
  if (!req.session.userInfo) {
    return res.status(401).json({ error: 'Not authenticated' });
  }
  res.json(req.session.userInfo);
});

// Logout route
app.get('/auth/logout', (req, res) => {
  req.session.destroy();
  const logoutUrl = `https://us-east-2lylzuyppl.auth.us-east-2.amazoncognito.com/logout?client_id=4ecd14vqq0niscmt2lhv7cqac7&logout_uri=http://localhost:3000/`;
  res.redirect(logoutUrl);
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});