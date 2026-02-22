const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../config/db');

// Registration Handler
exports.registerUser = async (req, res) => {
    try {
        const { name, email, phone, password } = req.body;

        // Validation
        if (!name || !email || !password) {
            return res.status(400).json({ message: 'Name, email, and password are required.' });
        }

        if (password.length < 6) {
            return res.status(400).json({ message: 'Password must be at least 6 characters.' });
        }

        // Hash Password Securely (Salt rounds = 10)
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Insert into DB
        const query = `INSERT INTO users (name, email, phone, password) VALUES (?, ?, ?, ?)`;

        db.run(query, [name, email, phone || null, hashedPassword], function (err) {
            if (err) {
                // SQLite constraint error for UNIQUE email
                if (err.message.includes('UNIQUE constraint failed')) {
                    return res.status(409).json({ message: 'An account with this email already exists.' });
                }
                console.error(err);
                return res.status(500).json({ message: 'Database error entirely on our side.' });
            }

            // Successfully inserted
            res.status(201).json({
                message: 'User registered successfully!',
                user: { id: this.lastID, name, email }
            });
        });
    } catch (error) {
        console.error('Registration Error:', error);
        res.status(500).json({ message: 'Server error during registration.' });
    }
};

// Login Handler
exports.loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: 'Please provide both email and password.' });
        }

        const query = `SELECT * FROM users WHERE email = ?`;

        db.get(query, [email], async (err, row) => {
            if (err) {
                console.error(err);
                return res.status(500).json({ message: 'Database query error.' });
            }

            // User Not Found
            if (!row) {
                // We use ambiguous messages to prevent email enumeration attacks
                return res.status(401).json({ message: 'Invalid email or password.' });
            }

            // Check Password Match
            const isMatch = await bcrypt.compare(password, row.password);

            if (!isMatch) {
                return res.status(401).json({ message: 'Invalid email or password.' });
            }

            // Generate JWT Token
            const jwtSecret = process.env.JWT_SECRET || 'fallback_secret_for_local_dev_only_replace_in_prod';

            // Sign token with user ID; expires in 1 day
            const token = jwt.sign({ id: row.id, email: row.email, name: row.name }, jwtSecret, { expiresIn: '1d' });

            res.status(200).json({
                message: 'Login successful.',
                token: token,
                user: {
                    id: row.id,
                    name: row.name,
                    email: row.email
                }
            });
        });
    } catch (error) {
        console.error('Login Error:', error);
        res.status(500).json({ message: 'Server error during login.' });
    }
};
