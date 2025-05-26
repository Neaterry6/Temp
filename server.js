import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Serve index.html at root
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// In-memory storage for emails and inbox messages
const inboxes = {}; 
// Structure example:
// inboxes = {
//   "abc123@tempmail.com": [
//      { from: "someone@example.com", subject: "Hello", body: "Hi there!" },
//      ...
//   ]
// }

// Generate a temp email address
app.get('/api/generate', (req, res) => {
  const login = Math.random().toString(36).substring(2, 10);
  const domain = 'tempmail.com';
  const email = `${login}@${domain}`;

  // Create empty inbox if none
  if (!inboxes[email]) {
    inboxes[email] = [];
  }

  res.json({ login, domain, email });
});

// Retrieve inbox messages for a temp email
app.get('/api/inbox', (req, res) => {
  const { login, domain } = req.query;
  if (!login || !domain) {
    return res.status(400).json({ error: 'Missing login or domain' });
  }

  const email = `${login}@${domain}`;
  if (!inboxes[email]) {
    return res.status(404).json([]);
  }

  res.json(inboxes[email]);
});

// Simulate sending an email to a temp mailbox
// POST payload: { to: string, from: string, subject: string, body: string }
app.post('/api/send', (req, res) => {
  const { to, from, subject, body } = req.body;

  if (!to || !from || !subject || !body) {
    return res.status(400).json({ error: 'Missing to, from, subject, or body' });
  }

  if (!inboxes[to]) {
    return res.status(404).json({ error: 'Recipient inbox not found' });
  }

  // Add message to inbox
  inboxes[to].push({ from, subject, body, date: new Date().toISOString() });

  res.json({ success: true, message: 'Email sent to temp mailbox' });
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});