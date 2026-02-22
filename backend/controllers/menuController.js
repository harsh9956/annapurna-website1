const db = require('../config/db');

exports.getMenu = (req, res) => {
    db.all("SELECT * FROM menu_items", [], (err, rows) => {
        if (err) {
            console.error('Error fetching menu:', err);
            return res.status(500).json({ success: false, message: 'Server error fetching menu.' });
        }
        res.status(200).json({ success: true, data: rows });
    });
};
