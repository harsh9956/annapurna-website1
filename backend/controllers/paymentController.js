const Razorpay = require('razorpay');
const crypto = require('crypto');
const db = require('../config/db');

// Initialize Razorpay instance
const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_YourTestKeyHere',
    key_secret: process.env.RAZORPAY_KEY_SECRET || 'YourTestSecretHere',
});

exports.createOrder = async (req, res) => {
    try {
        const { amount } = req.body;

        if (!amount) {
            return res.status(400).json({ success: false, message: 'Amount is required' });
        }

        const options = {
            amount: amount * 100, // Razorpay works in paise (amount * 100)
            currency: 'INR',
            receipt: 'receipt_' + Math.random().toString(36).substring(7),
        };

        const order = await razorpay.orders.create(options);

        res.status(200).json({
            success: true,
            orderId: order.id,
            amount: order.amount,
            currency: order.currency
        });

    } catch (error) {
        console.error('Razorpay Create Order Error:', error);
        res.status(500).json({ success: false, message: 'Could not create Razorpay order', error: error.message });
    }
};

exports.verifyPayment = async (req, res) => {
    try {
        const {
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature,
            orderData // Custom data from frontend to save the actual food order
        } = req.body;

        const body = razorpay_order_id + "|" + razorpay_payment_id;

        const expectedSignature = crypto
            .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET || 'YourTestSecretHere')
            .update(body.toString())
            .digest('hex');

        const isAuthentic = expectedSignature === razorpay_signature;

        if (isAuthentic) {
            // Ensure auth user id is extracted if available
            const userId = req.user ? req.user.id : null;

            // Save order to SQLite Database
            const insertQuery = `
                INSERT INTO orders (id, user_id, items_json, total_amount, payment_type, status_payment, status_delivery)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            `;

            const orderId = 'ANP_' + Math.floor(1000 + Math.random() * 9000);

            db.run(insertQuery, [
                orderId,
                userId,
                JSON.stringify(orderData.items),
                orderData.total,
                orderData.paymentType,
                'Paid',
                'Processing'
            ], function (err) {
                if (err) {
                    console.error('Error saving Razorpay order to DB:', err);
                    return res.status(500).json({ success: false, message: 'Payment successful, but failed to save order to database.' });
                }

                res.status(200).json({
                    success: true,
                    message: 'Payment verified successfully and order saved.',
                    data: { orderId: orderId }
                });
            });

        } else {
            res.status(400).json({ success: false, message: 'Invalid payment signature.' });
        }
    } catch (error) {
        console.error('Razorpay Verify Error:', error);
        res.status(500).json({ success: false, message: 'Internal Server Error during verification' });
    }
};
