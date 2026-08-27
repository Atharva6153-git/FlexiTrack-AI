require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const sessionRoutes = require('./routes/sessionRoutes');
const patientRoutes = require('./routes/patientRoutes');

// Initialize express app
const app = express();

// Connect to MongoDB
connectDB();

// Middleware
const configuredClientOrigins = (process.env.CLIENT_URL || 'http://localhost:5173')
  .split(',')
  .map((url) => url.trim())
  .filter(Boolean);
const allowedClientOrigins = [...new Set([...configuredClientOrigins, 'https://flexi-track-ai.vercel.app'])];
app.use(cors({
  origin: (origin, callback) => {
    const isLocalDevelopmentOrigin = /^http:\/\/localhost:\d+$/.test(origin || '');
    if (!origin || allowedClientOrigins.includes(origin) || isLocalDevelopmentOrigin) {
      return callback(null, true);
    }
    return callback(new Error('Origin not allowed by CORS'));
  },
}));
app.use(express.json());

// Routes
app.use('/api/sessions', sessionRoutes);
app.use('/api/patients', patientRoutes);

// Health check endpoint
app.get('/', (req, res) => {
  res.status(200).json({ status: 'FlexiTrack API Running' });
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
