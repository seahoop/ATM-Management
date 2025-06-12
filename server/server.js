// ======== server/server.js (Node.js Backend) ========
const express = require('express');
const session = require('express-session');
const cors = require('cors');
const { Issuer, generators } = require('openid-client');

const app = express();
const PORT = 5000;

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

let client;

async function initializeClient() {
  const issuer = await Issuer.discover('https://cognito-idp.us-east-2.amazonaws.com/us-east-2_Lylzuyppl');
  client = new issuer.Client({
    client_id: '4ecd14vqq0niscmt2lhv7cqac7',
    client_secret: '1kl3puo82jdr85efmufstsiiltcnl66otb56bog301spj7j8dvt8',
    redirect_uris: ['http://localhost:5000/auth/callback'],
    response_types: ['code']
  });
}
initializeClient().catch(console.error);

app.get('/auth/login', (req, res) => {
  const nonce = generators.nonce();
  const state = generators.state();
  req.session.nonce = nonce;
  req.session.state = state;

  const authUrl = client.authorizationUrl({
    scope: 'openid ',
    state,
    nonce
  });
  res.redirect(authUrl);
});

app.get('/auth/callback', async (req, res) => {
  try {
    const params = client.callbackParams(req);
    const tokenSet = await client.callback('http://localhost:5000/auth/callback', params, {
      nonce: req.session.nonce,
      state: req.session.state,
    });

    const userInfo = await client.userinfo(tokenSet.access_token);
    req.session.userInfo = userInfo;

    console.log('✅ Session saved:', req.session.userInfo);

    res.redirect('http://localhost:3000/callback');
  } catch (err) {
    console.error('Callback error:', err);
    res.redirect('/');
  }
});

app.get('/auth/user', (req, res) => {
  if (!req.session.userInfo) {
    return res.status(401).json({ error: 'Not logged in' });
  }
  res.json(req.session.userInfo);
});

app.get('/auth/logout', (req, res) => {
  req.session.destroy(() => {
    const logoutUrl = 'https://us-east-2lylzuyppl.auth.us-east-2.amazoncognito.com/logout?client_id=4ecd14vqq0niscmt2lhv7cqac7&logout_uri=http://localhost:3000/';
    res.redirect(logoutUrl);
  });
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
