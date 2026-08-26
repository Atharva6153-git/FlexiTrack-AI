require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const sessionRoutes = require('./routes/sessionRoutes');

// Initialize express app
const app = express();

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors({
  origin: 'http://localhost:5173', // Allow requests from the frontend
}));
app.use(express.json());

// Routes
app.use('/api/sessions', sessionRoutes);

// Health check endpoint
app.get('/', (req, res) => {
  res.status(200).json({ status: 'success', message: 'FlexiTrack AI API is running' });
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
