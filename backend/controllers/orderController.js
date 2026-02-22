const db = require('../config/db');

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
exports.createOrder = (req, res) => {
    const { items, paymentType } = req.body;
    const userId = req.user.id;

    if (!items || items.length === 0) {
        return res.status(400).json({ success: false, message: 'No order items' });
    }

    // Securely calculate total by querying DB prices (prevent client-side manipulation)
    const itemIds = items.map(item => item.id);
    const placeholders = itemIds.map(() => '?').join(',');

    db.all(`SELECT id, price FROM menu_items WHERE id IN (${placeholders})`, itemIds, (err, menuItems) => {
        if (err) {
            console.error('Error fetching menu items for order calculation:', err);
            return res.status(500).json({ success: false, message: 'Server error processing order.' });
        }

        // Create a map of secure prices
        const securePrices = {};
        menuItems.forEach(mi => { securePrices[mi.id] = mi.price; });

        let subtotal = 0;
        let secureItemsDetails = [];

        // Verify items and calculate secure subtotal
        for (const item of items) {
            if (!securePrices[item.id]) {
                return res.status(400).json({ success: false, message: `Invalid item ID: ${item.id}` });
            }
            subtotal += securePrices[item.id] * item.quantity;
            secureItemsDetails.push({
                ...item,
                price: securePrices[item.id] // Use secure DB price overriding client payload
            });
        }

        const tax = subtotal * 0.08;
        const totalAmount = subtotal + tax;

        const orderId = 'ANP-' + Math.floor(1000 + Math.random() * 9000);
        const statusPayment = (paymentType === 'online' || paymentType === 'upi') ? 'Paid' : 'Pending';
        const statusDelivery = 'Processing';

        const insertQuery = `
            INSERT INTO orders (id, user_id, items_json, total_amount, payment_type, status_payment, status_delivery)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `;

        db.run(insertQuery, [
            orderId,
            userId,
            JSON.stringify(secureItemsDetails),
            totalAmount,
            paymentType,
            statusPayment,
            statusDelivery
        ], function (err) {
            if (err) {
                console.error('Error creating order:', err);
                return res.status(500).json({ success: false, message: 'Error saving order.' });
            }

            res.status(201).json({
                success: true,
                message: 'Order placed successfully',
                data: { orderId, totalAmount, statusPayment }
            });
        });
    });
};

// @desc    Get logged in user orders
// @route   GET /api/orders
// @access  Private
exports.getMyOrders = (req, res) => {
    const userId = req.user.id;

    db.all(`SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC`, [userId], (err, rows) => {
        if (err) {
            console.error('Error fetching user orders:', err);
            return res.status(500).json({ success: false, message: 'Server error fetching orders.' });
        }

        // Format the database rows into the expected frontend JSON structure
        const formattedOrders = rows.map(row => ({
            id: row.id,
            date: new Date(row.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' }),
            items: JSON.parse(row.items_json),
            total: row.total_amount.toFixed(2),
            paymentType: row.payment_type,
            status_payment: row.status_payment,
            status_delivery: row.status_delivery
        }));

        res.status(200).json({ success: true, data: formattedOrders });
    });
}
