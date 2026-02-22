const db = require('../config/db');

// @desc    Submit a review for an order's items
// @route   POST /api/reviews
// @access  Private
exports.submitReview = (req, res) => {
    const userId = req.user.id;
    const { order_id, reviews } = req.body;

    if (!order_id || !reviews || !Array.isArray(reviews) || reviews.length === 0) {
        return res.status(400).json({ success: false, message: 'Invalid review data provided.' });
    }

    // First verify the order belongs to this user
    db.get(`SELECT id FROM orders WHERE id = ? AND user_id = ?`, [order_id, userId], (err, order) => {
        if (err) {
            console.error('Error verifying order:', err);
            return res.status(500).json({ success: false, message: 'Server error verifying order.' });
        }

        if (!order) {
            return res.status(404).json({ success: false, message: 'Order not found or does not belong to user.' });
        }

        // Use a transaction since we are inserting reviews and updating menu_items
        db.serialize(() => {
            db.run('BEGIN TRANSACTION');

            const insertReviewStmt = db.prepare(`INSERT INTO dish_reviews (order_id, menu_item_id, user_id, rating) VALUES (?, ?, ?, ?)`);
            const updateMenuStmt = db.prepare(`UPDATE menu_items SET rating_sum = rating_sum + ?, rating_count = rating_count + 1 WHERE id = ?`);

            let hasError = false;

            for (const review of reviews) {
                const { dish_id, rating } = review;

                // Validate rating is between 1 and 5
                const numRating = parseInt(rating);
                if (numRating < 1 || numRating > 5 || isNaN(numRating)) {
                    hasError = true;
                    break;
                }

                insertReviewStmt.run([order_id, dish_id, userId, numRating], (err) => {
                    if (err) hasError = true;
                });

                updateMenuStmt.run([numRating, dish_id], (err) => {
                    if (err) hasError = true;
                });
            }

            insertReviewStmt.finalize();
            updateMenuStmt.finalize();

            if (hasError) {
                db.run('ROLLBACK');
                return res.status(500).json({ success: false, message: 'Error saving reviews.' });
            } else {
                db.run('COMMIT', (err) => {
                    if (err) {
                        console.error('Commit error:', err);
                        return res.status(500).json({ success: false, message: 'Error finalizing reviews.' });
                    }
                    res.status(201).json({ success: true, message: 'Reviews submitted successfully.' });
                });
            }
        });
    });
};
