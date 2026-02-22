const express = require('express');
const router = express.Router();
const { protect, admin } = require('../middleware/authMiddleware');
const orderController = require('../controllers/orderController');

router.post('/', protect, orderController.createOrder);
router.get('/', protect, orderController.getMyOrders);

// Admin Routes
router.get('/all', protect, admin, orderController.getAllOrders);
router.put('/:id/status', protect, admin, orderController.updateOrderStatus);

module.exports = router;
