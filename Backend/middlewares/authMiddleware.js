import jwt from "jsonwebtoken"
import User from "../models/User.js";

export const authMiddleware = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (token == null) return res.sendStatus(401);

    jwt.verify(token, process.env.ACCESS_KEY, (err, user) => {
        if (err) return res.sendStatus(403);

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