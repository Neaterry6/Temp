// backend.js
import express from 'express';
import cors from 'cors';

const app = express();
app.use(cors());
app.use(express.json());

const PORT = 3000;

// Supported domains
const domains = ['titanmail.com', 'temp.titan', 'mailtitan.xyz'];

// In-memory store for generated emails and inboxes
const inboxStore = new Map();

// Utility to generate random string
function randomString(len = 8) {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let s = '';
  for (let i = 0; i < len; i++) {
    s += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return s;
}

// Generate temp email
app.get('/api/generate', (req, res) => {
  const login = randomString(10);
  const domain = domains[Math.floor(Math.random() * domains.length)];
  const email = `${login}@${domain}`;

  // Initialize inbox empty array
  inboxStore.set(`${login}@${domain}`, []);

  res.json({ login, domain, email });
});

// Simulate inbox messages for a temp email
app.get('/api/inbox', (req, res) => {
  const { login, domain } = req.query;
  if (!login || !domain) {
    return res.status(400).json({ error: 'Missing login or domain' });
  }
  const email = `${login}@${domain}`;
  if (!inboxStore.has(email)) {
    return res.status(404).json({ error: 'Email not found' });
  }

  // For demo: if inbox empty, create a sample message once
  if (inboxStore.get(email).length === 0) {
    inboxStore.set(email, [
      {
        from: 'welcome@titanmail.com',
        subject: 'Welcome to Titan TempMail',
        body: 'Thanks for using Titan TempMail service!'
      }
    ]);
  }

  res.json(inboxStore.get(email));
});

// Start server
app.listen(PORT, () => {
  console.log(`Titan TempMail backend listening at http://localhost:${PORT}`);
});