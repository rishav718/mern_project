require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Import Routes
const queueRoutes = require('./routes/queueRoutes');
const adminRoutes = require('./routes/adminRoutes');

// Mount Routes
app.use('/api/queues', queueRoutes);
app.use('/api/admin', adminRoutes);

// Base route for sanity check
app.get('/', (req, res) => {
  res.send('QueueIt Backend is running!');
});

// Port and DB Connection
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/queueit';

// Start Express Server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

const seedDatabase = require('./seeder');

// Connect to MongoDB
mongoose
  .connect(MONGO_URI)
  .then(async () => {
    console.log('Successfully connected to MongoDB.');
    await seedDatabase();
  })
  .catch((err) => {
    console.error('Database connection error:', err.message);
    console.log('Server is running in offline mode (no database connection).');
  });
