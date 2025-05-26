# Titan TempMail

A simple temporary email generator web app with a sleek dark/light theme, login/signup functionality, and inbox checking feature.

---

## Features

- User login and signup (client-side only, using localStorage)
- Dark/Light mode toggle
- Generate temporary email addresses
- View inbox messages for generated emails
- Logout functionality

---

## Frontend

- Pure HTML, CSS, and JavaScript
- Responsive and modern design using Google Fonts and simple CSS effects
- Connects to backend API endpoints `/api/generate` and `/api/inbox`

---

## Backend

- Node.js with Express.js
- Provides two main endpoints:
  - `GET /api/generate` - Generates a new temporary email
  - `GET /api/inbox?login=xxx&domain=yyy` - Returns inbox messages for the email
- Uses in-memory storage to simulate inbox messages

---

## Getting Started

### Prerequisites

- Node.js v18 or higher
- npm

### Installation

1. Clone this repository or download the source files.

2. Install backend dependencies:

```bash
npm install express cors