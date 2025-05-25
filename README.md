
# SMS-Mail-Hub

A sleek, neon-themed web app combining temporary email and temporary phone number services in one place.

---

## Features

- **Temporary Email Generator**  
  Generates disposable email addresses via the [1secmail](https://www.1secmail.com/api/) API.

- **Temporary Phone Number Generator**  
  Provides temporary phone numbers (integration planned with [getsms.cc](https://getsms.cc/) API).

- **Inbox Pages**  
  View incoming emails and SMS messages (depending on API availability).

- **Single Page Frontend**  
  Beautiful neon-black UI with smooth section-based routing.

- **Single Backend Script**  
  One Express.js server (`server.js`) handles API calls and proxies.

---

## Repo Structure

/sms-mail-hub/ ├── server.js        # Backend Express server handling API requests ├── index.html       # Single-page frontend UI ├── style.css        # Neon/black theme styling ├── package.json     # Dependencies and scripts

---

## Setup & Run

1. Clone the repo:

   ```bash
   git clone https://github.com/yourusername/sms-mail-hub.git
   cd sms-mail-hub

2. Install dependencies:

npm install


3. Start the server:

npm start


4. Open your browser at http://localhost:3000




---

APIs Used

1secmail: For generating and retrieving temporary emails.

getsms.cc: For temporary phone numbers (inbox scraping/scraping or API integration pending).



---

Notes

This is a proof-of-concept with plans to expand functionality.

APIs used are free and may have rate limits or usage policies.

Inbox support for temporary phone numbers depends on the available APIs.



---

License

MIT ©broken titan


---

Feel free to contribute or open issues for feature requests and bug reports.


