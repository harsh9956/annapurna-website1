// Initializing Database and Seeding initial Menu Items
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, '../database.sqlite');
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error connecting to SQLite Database:', err.message);
    } else {
        console.log('Connected to the SQLite Database successfully.');
        initDb();
    }
});

function initDb() {
    // 1. Users Table
    const usersTableQuery = `
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            email TEXT NOT NULL UNIQUE,
            phone TEXT,
            password TEXT NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `;

    // 2. Menu Items Table
    const menuTableQuery = `
        CREATE TABLE IF NOT EXISTS menu_items (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            description TEXT,
            price REAL NOT NULL,
            category TEXT NOT NULL,
            image_url TEXT
        )
    `;

    // 3. Orders Table
    const ordersTableQuery = `
        CREATE TABLE IF NOT EXISTS orders (
            id TEXT PRIMARY KEY,
            user_id INTEGER,
            items_json TEXT NOT NULL,
            total_amount REAL NOT NULL,
            payment_type TEXT NOT NULL,
            status_payment TEXT NOT NULL,
            status_delivery TEXT NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY(user_id) REFERENCES users(id)
        )
    `;

    db.serialize(() => {
        db.run(usersTableQuery, (err) => {
            if (err) console.error('Error creating users table:', err.message);
        });

        db.run(menuTableQuery, (err) => {
            if (err) {
                console.error('Error creating menu table:', err.message);
            } else {
                seedMenu(); // Seed initial data if empty
            }
        });

        db.run(ordersTableQuery, (err) => {
            if (err) console.error('Error creating orders table:', err.message);
            else console.log('Database tables initialized successfully.');
        });
    });
}

function seedMenu() {
    db.get("SELECT COUNT(*) as count FROM menu_items", [], (err, row) => {
        if (err) return console.error(err.message);

        if (row.count === 0) {
            console.log("Seeding Menu Items to Database...");
            const insert = `INSERT INTO menu_items (id, name, description, price, category, image_url) VALUES (?, ?, ?, ?, ?, ?)`;

            const seedData = [
                ['m_001', 'Punjabi Samosa', 'Crispy pastry filled with spiced potatoes and peas, served with mint chutney.', 6.99, 'starter', 'https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&q=80&w=600'],
                ['m_002', 'Chicken Tikka', 'Tender chicken pieces marinated in yogurt and spices, grilled in a tandoor.', 10.99, 'starter', 'https://images.unsplash.com/photo-1617692855027-33b14f061079?auto=format&fit=crop&q=80&w=600'],
                ['m_003', 'Murgh Makhani', 'Classic butter chicken in a rich, creamy tomato gravy with traditional spices.', 16.99, 'main', 'https://images.unsplash.com/photo-1588166524941-3bf61a9c41db?auto=format&fit=crop&q=80&w=600'],
                ['m_004', 'Palak Paneer', 'Fresh cottage cheese cubes simmered in a smooth, spiced spinach purée.', 14.99, 'main', 'https://images.unsplash.com/photo-1606491956689-2ea866880c84?auto=format&fit=crop&q=80&w=600'],
                ['m_005', 'Gulab Jamun', 'Warm, deep-fried milk dumplings soaked in a fragrant rose and cardamom syrup.', 5.99, 'dessert', 'https://images.unsplash.com/photo-1511690078903-71dc5a49f5e3?auto=format&fit=crop&q=80&w=600'],
                ['m_006', 'Mango Lassi', 'A refreshing, creamy yogurt drink blended with sweet Alphonso mangoes.', 4.99, 'beverage', 'https://images.unsplash.com/photo-1514326640560-7d063ef2aed5?auto=format&fit=crop&q=80&w=600']
            ];

            db.serialize(() => {
                db.run('BEGIN TRANSACTION');
                const stmt = db.prepare(insert);
                for (const item of seedData) {
                    stmt.run(item, (err) => {
                        if (err) console.error("Error inserting seed item:", err);
                    });
                }
                stmt.finalize();
                db.run('COMMIT', () => console.log('Seed Menu data initialized.'));
            });
        }
    });
}

module.exports = db;
