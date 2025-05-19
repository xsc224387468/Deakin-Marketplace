const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

// Load env variables
dotenv.config();

const app = express();

// CORS configuration
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files 
app.use('/uploads', express.static(path.join(__dirname, './uploads')));

// Routes
const itemRoutes = require('./routes/items');
const userRoutes = require('./routes/users');
const messageRoutes = require('./routes/messages');

app.use('/api/items', itemRoutes);
app.use('/api/users', userRoutes);
app.use('/api/messages', messageRoutes);

// Testing Routes
app.get('/api/test', (req, res) => {
  res.json({ message: 'Server is working with MongoDB!' });
});

app.get('/', (req, res) => {
  res.json({ message: 'Welcome to Deakin Marketplace API' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

// MongoDB connects and starts the service
const connectWithRetry = async () => {
  try {
    const MONGODB_URI = process.env.MONGODB_URI;
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('MongoDB connected successfully');
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (err) {
    console.error('MongoDB connection error:', err.message);
    console.log('Retrying connection in 5 seconds...');
    setTimeout(connectWithRetry, 5000);
  }
};

connectWithRetry();
