import jwt from "jsonwebtoken"
import User from "../models/User.js";

export const authMiddleware = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (token == null) return res.sendStatus(401);

    jwt.verify(token, process.env.ACCESS_KEY, (err, user) => {
        if (err) {
            // Check if token is expired
            if (err.name === 'TokenExpiredError') {
                return res.status(401).json({
                    code: 'TOKEN_EXPIRED',
                    message: 'Token has expired'
                });
            }
            // Other token errors (invalid, malformed, etc.)
            return res.status(403).json({
                code: 'INVALID_TOKEN',
                message: 'Invalid token'
            });
        }

        req.user = user;
        next();
    });
}

export const adminMiddleware = async (req, res, next) => {

    const { id } = req.user
    const user = await User.findById(id)

    if (user.role === 'admin') {
        return next()
    }
    return res.status(403).json('Only Admin can access')
}

export const sellerMiddleware = async (req, res, next) => {

    const { id } = req.user
    const user = await User.findById(id)
    if (user.role === 'seller') {
        return next()
    }
    return res.status(403).json('Only Seller can access')
}