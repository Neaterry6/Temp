
const express = require('express');
const axios = require('axios');
const cors = require('cors');
const cheerio = require('cheerio');
const bodyParser = require('body-parser');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());
app.use(bodyParser.json());
app.use(express.static('.')); 

// Simulated user database
const users = [];

// === User Authentication Handlers ===
app.post('/api/signup', (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password required!' });
  }
  const existingUser = users.find(user => user.username === username);
  if (existingUser) {
    return res.status(400).json({ error: 'Username already exists!' });
  }
  users.push({ username, password });
  res.json({ success: 'Signup successful! You can now log in.' });
});

app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  const user = users.find(user => user.username === username && user.password === password);
  if (!user) {
    return res.status(401).json({ error: 'Invalid username or password!' });
  }
  res.json({ success: 'Login successful!' });
});

// === TempMail API Handlers ===
app.get('/api/generate-email', (req, res) => {
  const domains = ['1secmail.com', '1secmail.org', '1secmail.net', 'wwjmp.com', 'esiix.com', 'xojxe.com', 'yoggm.com'];
  const randomUser = Math.random().toString(36).substring(2, 10);
  const domain = domains[Math.floor(Math.random() * domains.length)];
  res.json({ email: `${randomUser}@${domain}` });
});

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

// === TempNumber Web Scraper ===
app.get('/api/getsms/available-numbers', async (req, res) => {
  try {
    const response = await axios.get(`https://getsms.cc/`);
    const $ = cheerio.load(response.data);
    const numbers = [];

    $('.number-boxes-item').each((i, el) => {
      const number = $(el).find('.number-boxes-item-number').text().trim();
      const link = $(el).find('a').attr('href');
      if (number && link) {
        numbers.push({ number, link });
      }
    });

    res.json(numbers);
  } catch (e) {
    res.status(500).json({ error: 'Failed fetching numbers' });
  }
});

app.get('/api/getsms/inbox', async (req, res) => {
  const pageUrl = req.query.page;
  if (!pageUrl) return res.status(400).json({ error: 'Missing number page URL' });

  try {
    const response = await axios.get(`https://getsms.cc${pageUrl}`);
    const $ = cheerio.load(response.data);
    const messages = [];

    $('.sms-text').each((i, el) => {
      const time = $(el).find('.sms-time').text().trim();
      const text = $(el).find('p').text().trim();
      if (text) {
        messages.push({ time, text });
      }
    });

    res.json(messages);
  } catch (e) {
    res.status(500).json({ error: 'Failed fetching inbox' });
  }
});

app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});