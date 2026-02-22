const jwt = require('jsonwebtoken');

const protect = (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1];

            let decoded;
            try {
                // First try standard local verification
                decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret123');
            } catch (err) {
                // If verification fails, it might be a Firebase token.
                // For this prototype, we decode it to extract the user details without strict signature validation
                decoded = jwt.decode(token);
                if (!decoded) throw new Error("Invalid token format");
            }

            // Attach user to request object
            req.user = decoded;

            // Ensure req.user.id exists (Firebase uses user_id, sub, or uid)
            if (!req.user.id) {
                req.user.id = req.user.uid || req.user.user_id || req.user.sub;
            }

            // Auto-elevate admin based on Firebase email
            if (req.user && req.user.email === 'harshpratapsingh826@gmail.com') {
                req.user.is_admin = 1;
            }

            next();
        } catch (error) {
            console.error(error);
            return res.status(401).json({ success: false, message: 'Not authorized, token failed' });
        }
    }

    if (!token) {
        return res.status(401).json({ success: false, message: 'Not authorized, no token' });
    }
};

const admin = (req, res, next) => {
    if (req.user && req.user.is_admin === 1) {
        next();
    } else {
        res.status(403).json({ success: false, message: 'Not authorized as an admin' });
    }
};

module.exports = { protect, admin };
