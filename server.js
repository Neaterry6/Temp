const express = require('express');
const axios = require('axios');
const cors = require('cors');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.static(__dirname));

const PORT = 3000;

// TempNumber API (example using getsms.cc as placeholder)
app.get('/api/number', async (req, res) => {
  try {
    const { data } = await axios.get('https://getsms.cc/all');
    res.send(data);
  } catch (e) {
    res.status(500).json({ error: 'Failed to fetch numbers' });
  }
});

// TempMail API (1secmail)
app.get('/api/tempmail', async (req, res) => {
  try {
    const { data } = await axios.get('https://www.1secmail.com/api/v1/?action=genRandomMailbox&count=1');
    res.json({ email: data[0] });
  } catch (err) {
    res.status(500).json({ error: 'Failed to get temp email' });
  }
});

app.get('/api/inbox-tempmail', async (req, res) => {
  try {
    const email = req.query.email;
    const [login, domain] = email.split('@');
    const { data } = await axios.get(`https://www.1secmail.com/api/v1/?action=getMessages&login=${login}&domain=${domain}`);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch inbox' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
})
