const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const authRoutes = require('./routes/authRoutes');
const menuRoutes = require('./routes/menuRoutes');
const orderRoutes = require('./routes/orderRoutes');
const db = require('./config/db'); // Initialize DB

// Load env vars (e.g., JWT_SECRET)
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
    origin: '*', // For development, allow all origins. In production, specify the frontend domain.
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json()); // Parses incoming JSON requests

// Basic Health Check Route
app.get('/api/health', (req, res) => {
    res.status(200).json({ status: 'OK', message: 'Annapurna Backend is running smoothly.' });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/menu', menuRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/payment', require('./routes/paymentRoutes'));
app.use('/api/reviews', require('./routes/reviewRoutes'));

// Global Error Handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        success: false,
        message: 'An unexpected internal server error occurred.',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

// Start Server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
