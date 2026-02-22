const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');

// Optional: Auth middleware if orders must be logged in. 
// For now, accepting guest checkouts based on existing logic.
// const authMiddleware = require('../middleware/authMiddleware');

router.post('/create', paymentController.createOrder);
router.post('/verify', paymentController.verifyPayment);

module.exports = router;
