import express from 'express';
import fetch from 'node-fetch';
import cors from 'cors';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static('public')); // serve static frontend

let account = null; // { email, password }
let token = null;
let tokenExpiry = null;

// Helper: Authenticate and get new token
async function authenticate() {
  if (!account) throw new Error('No account registered');
  const authRes = await fetch('https://api.mail.tm/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ address: account.email, password: account.password }),
  });
  if (!authRes.ok) {
    const err = await authRes.json();
    throw new Error(`Auth failed: ${JSON.stringify(err)}`);
  }
  const authData = await authRes.json();
  token = authData.token;

  // mail.tm tokens usually expire in 1 hour - store expiry timestamp
  // Here we just set expiry 55 minutes from now to be safe
  tokenExpiry = Date.now() + 55 * 60 * 1000;
}

// Helper: Ensure token is valid, else re-authenticate
async function ensureToken() {
  if (!token || !tokenExpiry || Date.now() >= tokenExpiry) {
    await authenticate();
  }
}

// Register new temp email account
app.post('/api/register', async (req, res) => {
  try {
    // Get available domains
    const domainsRes = await fetch('https://api.mail.tm/domains');
    const domainsData = await domainsRes.json();
    if (!domainsData['hydra:member'] || domainsData['hydra:member'].length === 0) {
      return res.status(500).json({ error: 'No domains available' });
    }
    const domain = domainsData['hydra:member'][0].domain;

    // Generate random user and password
    const user = Math.random().toString(36).substring(2, 10);
    const password = Math.random().toString(36).substring(2, 10);
    const email = `${user}@${domain}`;

    // Register account
    const registerRes = await fetch('https://api.mail.tm/accounts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ address: email, password }),
    });

    if (!registerRes.ok) {
      const err = await registerRes.json();
      return res.status(500).json({ error: 'Failed to register account', details: err });
    }

    account = { email, password };

    // Authenticate and get token
    await authenticate();

    res.json({ email, password });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Get inbox messages
app.get('/api/inbox', async (req, res) => {
  try {
    await ensureToken();
    const messagesRes = await fetch('https://api.mail.tm/messages', {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!messagesRes.ok) {
      const err = await messagesRes.json();
      return res.status(500).json({ error: 'Failed to fetch messages', details: err });
    }
    const messagesData = await messagesRes.json();
    const msgs = messagesData['hydra:member'].map(m => ({
      id: m.id,
      from: m.from.address,
      subject: m.subject,
      intro: m.intro,
      date: m.createdAt,
    }));
    res.json(msgs);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Get full message content by id
app.get('/api/message/:id', async (req, res) => {
  try {
    await ensureToken();
    const { id } = req.params;
    const messageRes = await fetch(`https://api.mail.tm/messages/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!messageRes.ok) {
      const err = await messageRes.json();
      return res.status(500).json({ error: 'Failed to fetch message', details: err });
    }
    const messageData = await messageRes.json();
    res.json(messageData);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Logout - clear cached token & account
app.post('/api/logout', (req, res) => {
  account = null;
  token = null;
  tokenExpiry = null;
  res.json({ message: 'Logged out' });
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));