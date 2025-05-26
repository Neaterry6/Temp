import express from 'express';
import fetch from 'node-fetch';
import cors from 'cors';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static('public')); // serve index.html from /public

// Cache token & account per session (simple in-memory, no DB)
let account = null;
let token = null;

// Create temp mail account
app.post('/api/register', async (req, res) => {
  try {
    // Get domain list to pick a domain for the email
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

    // Authenticate to get token
    const authRes = await fetch('https://api.mail.tm/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ address: email, password }),
    });

    if (!authRes.ok) {
      const err = await authRes.json();
      return res.status(500).json({ error: 'Failed to authenticate', details: err });
    }

    const authData = await authRes.json();
    token = authData.token;

    res.json({ email, password });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Get inbox messages
app.get('/api/inbox', async (req, res) => {
  if (!token) return res.status(400).json({ error: 'Not authenticated' });
  try {
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
  if (!token) return res.status(400).json({ error: 'Not authenticated' });
  try {
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
  res.json({ message: 'Logged out' });
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));