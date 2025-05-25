const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());
app.use(express.static('.')); // serve index.html, style.css from root

// === 1secmail API handlers ===

// Generate random email (just generate random username and domain from 1secmail's list)
app.get('/api/generate-email', (req, res) => {
  const domains = ['1secmail.com', '1secmail.org', '1secmail.net', 'wwjmp.com', 'esiix.com', 'xojxe.com', 'yoggm.com'];
  const randomUser = Math.random().toString(36).substring(2, 10);
  const domain = domains[Math.floor(Math.random() * domains.length)];
  res.json({ email: `${randomUser}@${domain}` });
});

// Get inbox messages for email
// query params: login=username, domain=domain.com
app.get('/api/mailbox', async (req, res) => {
  const { login, domain } = req.query;
  if (!login || !domain) return res.status(400).json({ error: 'Missing login or domain' });

  try {
    const messagesRes = await axios.get(`https://www.1secmail.com/api/v1/?action=getMessages&login=${login}&domain=${domain}`);
    res.json(messagesRes.data);
  } catch (e) {
    res.status(500).json({ error: 'Failed fetching mailbox' });
  }
});

// Get email message by id
app.get('/api/mailbox/message', async (req, res) => {
  const { login, domain, id } = req.query;
  if (!login || !domain || !id) return res.status(400).json({ error: 'Missing login, domain or id' });

  try {
    const messageRes = await axios.get(`https://www.1secmail.com/api/v1/?action=readMessage&login=${login}&domain=${domain}&id=${id}`);
    res.json(messageRes.data);
  } catch (e) {
    res.status(500).json({ error: 'Failed fetching message' });
  }
});

// === getsms.cc API handlers ===
// NOTE: This example uses public free API endpoints. You will need to replace with your own API key or scraping logic.

// Example: Get available numbers for a country (default 'us')
app.get('/api/getsms/available-numbers', async (req, res) => {
  const country = req.query.country || 'us';
  try {
    // This is a placeholder endpoint - replace with your real getsms.cc API call or scraping logic
    // e.g. `https://getsms.cc/api/...?country=${country}&apikey=YOUR_API_KEY`
    res.json({ message: 'Replace with getsms.cc API call or scraping logic' });
  } catch (e) {
    res.status(500).json({ error: 'Failed fetching available numbers' });
  }
});

// Example: Get inbox SMS messages for a rented number id
app.get('/api/getsms/inbox', async (req, res) => {
  const numberId = req.query.id;
  if (!numberId) return res.status(400).json({ error: 'Missing number ID' });

  try {
    // Placeholder - replace with real getsms.cc API inbox call or scraping
    res.json({ message: 'Replace with getsms.cc inbox fetching logic' });
  } catch (e) {
    res.status(500).json({ error: 'Failed fetching inbox' });
  }
});

app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});
