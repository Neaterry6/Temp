const express = require('express')
const fetch = require('node-fetch')
const path = require('path')
const app = express()

// Serve static files (like your index.html, css, images)
app.use(express.static(path.join(__dirname)))

// API to generate temp email
app.get('/api/generate', async (req, res) => {
  const login = Math.random().toString(36).substring(2, 10)
  const domain = '1secmail.com'
  const email = `${login}@${domain}`
  res.json({ login, domain, email })
})

// API to fetch inbox messages
app.get('/api/inbox', async (req, res) => {
  const { login, domain } = req.query
  if (!login || !domain) {
    return res.status(400).json({ error: 'Missing login or domain' })
  }
  const url = `https://www.1secmail.com/api/v1/?action=getMessages&login=${login}&domain=${domain}`
  try {
    const response = await fetch(url)
    const data = await response.json()
    res.json(data)
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch inbox' })
  }
})

// Start server
const PORT = process.env.PORT || 3000
app.listen(PORT, () => console.log(`TempMail Mini Server running on port ${PORT}`))