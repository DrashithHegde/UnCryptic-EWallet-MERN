const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const app = express();
const PORT = parseInt(process.env.PORT) || 5001;

console.log('Environment variables:', {
  PORT: process.env.PORT,
  MONGO_URI: process.env.MONGO_URI
});

// Middleware
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3001'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept']
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Connect to MongoDB
const MONGO_URI = process.env.MONGO_URI;
console.log('Attempting to connect with URI:', MONGO_URI ? MONGO_URI.split('@')[1] : 'undefined'); // Only log the host part
if (!MONGO_URI) {
  console.error('MONGO_URI is not defined in environment variables');
  process.exit(1);
}

console.log('Attempting to connect to MongoDB...');

mongoose.set('strictQuery', false);
mongoose.set('debug', true); // Enable debug mode to see MongoDB queries

// Connect with retry mechanism
const connectWithRetry = async () => {
  try {
    await mongoose.connect(MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      retryWrites: true,
      w: 'majority'
    });

    console.log('MongoDB connected successfully');

    // Test database write access
    const TestModel = mongoose.model('Test', new mongoose.Schema({ test: String }));
    const testDoc = await TestModel.create({ test: 'test' });
    console.log('Database write test successful');
    await TestModel.deleteOne({ _id: testDoc._id });
  } catch (err) {
    console.error('MongoDB connection error:', err);
    console.error('Full error details:', JSON.stringify(err, null, 2));
    console.log('Retrying connection in 5 seconds...');
    setTimeout(connectWithRetry, 5000);
  }
};

connectWithRetry();

// Test route
app.get('/', (req, res) => {
  res.send('API is running...');
});

// Routes
const authRoutes = require('./routes/auth');
const transactionRoutes = require('./routes/transactions');
const requestRoutes = require('./routes/requests');
const adminRoutes = require('./routes/admin');

app.use('/api/auth', authRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/requests', requestRoutes);
app.use('/api/admin', adminRoutes);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
