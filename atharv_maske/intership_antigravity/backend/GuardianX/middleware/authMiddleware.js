const jwt = require("jsonwebtoken");

const extractToken = (req) => {
    // 1. Standard Authorization header: "Bearer <token>"
    const authHeader = req.headers && (req.headers.authorization || req.headers.Authorization);
    if (authHeader && typeof authHeader === 'string') {
        if (authHeader.toLowerCase().startsWith('bearer ')) {
            return authHeader.split(' ')[1];
        }
        return authHeader;
    }

    // 2. x-access-token header
    if (req.headers && req.headers['x-access-token']) return req.headers['x-access-token'];

    // 3. Query string ?token=...
    if (req.query && req.query.token) return req.query.token;

    // 4. Body token (for form requests)
    if (req.body && req.body.token) return req.body.token;

    return null;
};

const authenticate = (req, res, next) => {
    const token = extractToken(req);
    if (!token) {
        return res.status(401).json({ success: false, message: 'Authorization token missing.' });
    }

    const jwtSecret = process.env.JWT_SECRET || "default_jwt_secret";

    try {
        const decoded = jwt.verify(token, jwtSecret);
        if (!decoded || !decoded.id) {
            return res.status(401).json({ success: false, message: 'Invalid token payload.' });
        }

        req.user = { id: decoded.id };
        return next();
    } catch (err) {
        return res.status(401).json({ success: false, message: 'Invalid or expired token.' });
    }
};

module.exports = { authenticate };
