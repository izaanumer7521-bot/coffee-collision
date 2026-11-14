require('dotenv').config();
// Fixes 'querySrv ECONNREFUSED' on networks whose DNS can't resolve MongoDB Atlas (mongodb+srv) addresses
require('dns').setServers(['8.8.8.8', '1.1.1.1']);
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

const app = express();

// CLIENT_URL can hold several origins separated by commas.
const origins = (process.env.CLIENT_URL || 'http://localhost:5173').split(',').map((s) => s.trim().replace(/\/$/, ''));
// Allowed browser origins: the same address the API is served from (single Vercel project),
// plus anything listed in CLIENT_URL (comma separated), e.g. http://localhost:5173 in development.
app.use((req, res, next) =>
  cors({
    origin: (origin, cb) => {
      if (!origin) return cb(null, true);
      try { if (new URL(origin).host === req.headers.host) return cb(null, true); } catch {}
      cb(null, origins.includes(origin.replace(/\/$/, '')));
    },
  })(req, res, next)
);
app.use(express.json());

// connect to MongoDB before handling any request (works locally and on Vercel)
app.use(async (req, res, next) => {
  try { await connectDB(); next(); }
  catch (e) { res.status(500).json({ message: `Database error: ${e.message}` }); }
});

app.get('/', (req, res) => res.json({ ok: true, name: 'Evara API' }));
app.get('/api/health', (req, res) => res.json({ ok: true }));
app.use('/api/auth', require('./routes/auth'));
app.use('/api/products', require('./routes/products'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api/contact', require('./routes/contact'));
app.use((req, res) => res.status(404).json({ message: 'Route not found.' }));

module.exports = app;

// Local run: `npm run dev`. On Vercel the exported app is used instead.
if (require.main === module) {
  const port = process.env.PORT || 5000;
  app.listen(port, () => console.log(`API running on http://localhost:${port}`));
}
