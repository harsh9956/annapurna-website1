const db = require('../config/db');

exports.getMenu = (req, res) => {
    db.all("SELECT * FROM menu_items", [], (err, rows) => {
        if (err) {
            console.error('Error fetching menu:', err);
            return res.status(500).json({ success: false, message: 'Server error fetching menu.' });
        }

        // Calculate average rating for each item before sending to frontend
        const menuWithRatings = rows.map(item => {
            const avgRating = item.rating_count > 0 ? (item.rating_sum / item.rating_count).toFixed(1) : 0;
            return {
                ...item,
                average_rating: parseFloat(avgRating)
            };
        });

        res.status(200).json({ success: true, data: menuWithRatings });
    });
};
