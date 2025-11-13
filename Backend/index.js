import express from 'express';
import { connection } from './config/db.js';
import dotenv from 'dotenv';
import userRoute from './routes/userRoute.js';
import productRoute from './routes/productRoute.js';
import orderRoute from './routes/orderRoute.js';
import couponRoute from './routes/couponRoutes.js';
import analyticsRoute from './routes/analyticsRoute.js';
import logCheck from './middlewares/logger.js';
import { requestLogger, errorLogger } from './middlewares/winstonLogger.js';
import logger from './utils/logger.js';
import { rateLimit } from 'express-rate-limit'
import { swaggerDocs } from './swagger.js';
import { errorHandler } from './middlewares/errorHandler.js';
import cookieParser from 'cookie-parser';
import { cloudinaryConfig } from './config/cloudinary.js';
import cors from 'cors'

dotenv.config();
const PORT = process.env.PORT || 3000;

const app = express();

app.use(express.json());

app.use('/uploads', express.static('uploads'));

// app.use(logCheck); // This is custom logger 

const limiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minute
    limit: 15, // max 5 requests per window per IP
    standardHeaders: 'draft-8',
    legacyHeaders: false,
    ipv6Subnet: 56,
})

app.use(limiter)
app.use(
    cors({
        origin: "http://localhost:5173", // your frontend URL
        credentials: true, // allow cookies and auth headers
        methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        allowedHeaders: ["Content-Type", "Authorization"],
    })
);
app.use(cookieParser())

app.use(requestLogger);

swaggerDocs(app)

// Routes
app.use('/users', userRoute);
app.use('/products', productRoute);
app.use('/orders', orderRoute);
app.use('/coupons', couponRoute);
app.use('/analytics', analyticsRoute);

app.use(errorLogger);

app.use((req, res) => {
    logger.warn(`404 Not Found - ${req.method} ${req.originalUrl}`);
    res.status(404).json({ message: 'Route not found' });
});

app.use(errorHandler)

connection();
cloudinaryConfig();

app.listen(PORT, () => {
    logger.info(`Server running on port ${PORT}`);
});