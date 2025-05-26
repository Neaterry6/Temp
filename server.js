import express from 'express';
import fetch from 'node-fetch';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static(__dirname));  // serve index.html and assets

// Generate random temp email using 1secmail API
app.get('/api/generate', async (req, res) => {
  try {
    // 1secmail domains
    const domains = ['1secmail.com', '1secmail.org', '1secmail.net'];
    const login = Math.random().toString(36).substring(2, 10);
    const domain = domains[Math.floor(Math.random() * domains.length)];
    const email = `${login}@${domain}`;
    res.json({ login, domain, email });
  } catch (error) {
    res.status(500).json({ error: 'Failed to generate email' });
  }
});

// Fetch inbox messages for given login and domain
app.get('/api/inbox', async (req, res) => {
  const { login, domain } = req.query;

  if (!login || !domain) {
    return res.status(400).json({ error: 'Missing login or domain parameter' });
  }

  try {
    // Get list of message IDs
    const listRes = await fetch(`https://www.1secmail.com/api/v1/?action=getMessages&login=${login}&domain=${domain}`);
    const messages = await listRes.json();

    if (!Array.isArray(messages)) {
      return res.json([]);
    }

    // Fetch full details for each message in parallel
    const fullMessages = await Promise.all(
      messages.map(async (msg) => {
        const msgRes = await fetch(`https://www.1secmail.com/api/v1/?action=readMessage&login=${login}&domain=${domain}&id=${msg.id}`);
        const msgDetails = await msgRes.json();
        return {
          id: msgDetails.id,
          from: msgDetails.from,
          subject: msgDetails.subject,
          date: msgDetails.date,
          body: msgDetails.textBody || msgDetails.htmlBody || '',
        };
      })
    );

    res.json(fullMessages);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch inbox' });
  }
});

// Serve index.html on root
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});