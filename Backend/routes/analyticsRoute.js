import express from "express";
import { getOrderStatusSummary, getTopCustomers, getTopSellers, getTopSellingProduct, getTopSellingProductSeller, getTotalRevenue, getTotalRevenueSeller } from "../controllers/analyticsController.js";
import { adminMiddleware, authMiddleware, sellerMiddleware } from "../middlewares/authMiddleware.js";

const router = express.Router()


router.get('/topselling', authMiddleware, adminMiddleware, getTopSellingProduct)
router.get('/seller/topselling', authMiddleware, sellerMiddleware, getTopSellingProductSeller)
router.get('/totalrevenue', authMiddleware, adminMiddleware, getTotalRevenue)
router.get('/seller/totalrevenue', authMiddleware, sellerMiddleware, getTotalRevenueSeller)
router.get('/topcustomers', authMiddleware, adminMiddleware, getTopCustomers)
router.get('/topsellers', authMiddleware, adminMiddleware, getTopSellers)
router.get('/orderStatus', authMiddleware, adminMiddleware, getOrderStatusSummary)

export default router