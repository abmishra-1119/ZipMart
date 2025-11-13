import express from 'express'
import {
    addToCart,
    changePassword,
    createUser,
    deleteFromCart,
    deleteUser,
    emptyCart,
    forgotPassword,
    getAllSeller,
    getCart,
    getUser,
    getUserById,
    login,
    logoutUser,
    profile,
    refreshToken,
    resetPassword,
    sendOtp,
    updateCart,
    updateUser,
    uploadAvatar,
    verifyOtpAndRegister
} from '../controllers/userController.js'
import { adminMiddleware, authMiddleware } from '../middlewares/authMiddleware.js'
import { validateRequest } from '../middlewares/validateRoute.js'
import { getUserSchema, loginSchema, registerSchema, updateUserSchema } from '../validations/userValidation.js'
import { upload } from '../middlewares/multer.js'

const router = express.Router()

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: User management and authentication endpoints
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       required:
 *         - name
 *         - email
 *         - password
 *       properties:
 *         _id:
 *           type: string
 *           description: User ID
 *         name:
 *           type: string
 *           minLength: 3
 *           maxLength: 30
 *           description: User full name
 *         email:
 *           type: string
 *           format: email
 *           description: User email address
 *         phone:
 *           type: string
 *           description: User phone number
 *         password:
 *           type: string
 *           format: password
 *           description: Hashed password
 *         age:
 *           type: number
 *           minimum: 18
 *           maximum: 99
 *           description: User age
 *         role:
 *           type: string
 *           enum: [admin, user, seller]
 *           default: user
 *           description: User role
 *         cart:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               productId:
 *                 type: string
 *                 description: Product ID reference
 *               count:
 *                 type: number
 *                 description: Product quantity
 *         avatar:
 *           type: object
 *           properties:
 *             url:
 *               type: string
 *             public_id:
 *               type: string
 *         addresses:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               fullName:
 *                 type: string
 *               street:
 *                 type: string
 *               city:
 *                 type: string
 *               state:
 *                 type: string
 *               country:
 *                 type: string
 *               zipCode:
 *                 type: string
 *               phone:
 *                 type: string
 *               isDefault:
 *                 type: boolean
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *     LoginResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *         message:
 *           type: string
 *         data:
 *           type: object
 *           properties:
 *             token:
 *               type: string
 *               description: JWT access token
 *             user:
 *               type: object
 *               properties:
 *                 name:
 *                   type: string
 *                 email:
 *                   type: string
 *                 role:
 *                   type: string
 *     CartItem:
 *       type: object
 *       required:
 *         - productId
 *         - count
 *       properties:
 *         productId:
 *           type: string
 *           description: Product ID
 *         count:
 *           type: number
 *           minimum: 1
 *           description: Item quantity
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 */

/**
 * @swagger
 * /users:
 *   post:
 *     summary: Create new user (Admin only)
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - password
 *             properties:
 *               name:
 *                 type: string
 *                 example: "John Doe"
 *               email:
 *                 type: string
 *                 example: "john@example.com"
 *               password:
 *                 type: string
 *                 example: "password123"
 *               role:
 *                 type: string
 *                 enum: [admin, user, seller]
 *                 example: "user"
 *     responses:
 *       201:
 *         description: User created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     name:
 *                       type: string
 *                     email:
 *                       type: string
 *                     role:
 *                       type: string
 *       400:
 *         description: Missing fields or email already registered
 *       401:
 *         description: Unauthorized
 */
router.post('/', validateRequest(registerSchema), createUser)

/**
 * @swagger
 * /users/login:
 *   post:
 *     summary: User login
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 example: "john@example.com"
 *               password:
 *                 type: string
 *                 example: "password123"
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/LoginResponse'
 *         headers:
 *           Set-Cookie:
 *             schema:
 *               type: string
 *               example: refreshToken=abc123; HttpOnly; Secure; SameSite=Strict; Max-Age=604800
 *       401:
 *         description: Invalid credentials
 *       404:
 *         description: User not found
 */
router.post('/login', validateRequest(loginSchema), login)

/**
 * @swagger
 * /users/logout:
 *   post:
 *     summary: User logout
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Logged out successfully
 *         headers:
 *           Set-Cookie:
 *             schema:
 *               type: string
 *               example: refreshToken=; HttpOnly; Secure; SameSite=Strict; Max-Age=0
 *       400:
 *         description: Invalid token
 */
router.post('/logout', authMiddleware, logoutUser)

/**
 * @swagger
 * /users/refresh:
 *   post:
 *     summary: Refresh access token
 *     tags: [Users]
 *     responses:
 *       200:
 *         description: Token refreshed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     accessToken:
 *                       type: string
 *         headers:
 *           Set-Cookie:
 *             schema:
 *               type: string
 *       401:
 *         description: No token provided
 *       403:
 *         description: Invalid token
 *       404:
 *         description: User not found
 */
router.post('/refresh', refreshToken)

/**
 * @swagger
 * /users:
 *   get:
 *     summary: Get paginated users list (Admin only)
 *     tags: [Users]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Users per page
 *     responses:
 *       200:
 *         description: Users list retrieved
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     page:
 *                       type: integer
 *                     limit:
 *                       type: integer
 *                     totalUsers:
 *                       type: integer
 *                     totalPages:
 *                       type: integer
 *                     users:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           _id:
 *                             type: string
 *                           name:
 *                             type: string
 *                           email:
 *                             type: string
 *                           age:
 *                             type: number
 *                           role:
 *                             type: string
 *                           createdAt:
 *                             type: string
 *                             format: date-time
 */
router.get('/', getUser)

/**
 * @swagger
 * /users/seller:
 *   get:
 *     summary: Get all sellers (Admin only)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Sellers list retrieved
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                       name:
 *                         type: string
 *                       email:
 *                         type: string
 *                       role:
 *                         type: string
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 */
router.get('/seller', authMiddleware, adminMiddleware, getAllSeller)

/**
 * @swagger
 * /users/profile:
 *   get:
 *     summary: Get current user profile
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Profile retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                     name:
 *                       type: string
 *                     email:
 *                       type: string
 *                     age:
 *                       type: number
 *                     role:
 *                       type: string
 *                     cart:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/CartItem'
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 */
router.get('/profile', authMiddleware, profile)

/**
 * @swagger
 * /users/upload-avatar:
 *   post:
 *     summary: Upload user avatar
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               avatar:
 *                 type: string
 *                 format: binary
 *                 description: Image file (JPG, PNG, etc.)
 *     responses:
 *       200:
 *         description: Avatar uploaded successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     url:
 *                       type: string
 *                     asset_id:
 *                       type: string
 *                     public_id:
 *                       type: string
 *       400:
 *         description: No file uploaded
 *       404:
 *         description: User not found
 */
router.post('/upload-avatar', authMiddleware, upload.single('avatar'), uploadAvatar)

/**
 * @swagger
 * /users/cart:
 *   get:
 *     summary: Get user cart
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Cart retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/CartItem'
 */
router.get('/cart', authMiddleware, getCart)

/**
 * @swagger
 * /users/cart:
 *   put:
 *     summary: Add item to cart
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - productId
 *             properties:
 *               productId:
 *                 type: string
 *                 example: "64a8e2b2e35fca82dfb72d1b"
 *               count:
 *                 type: number
 *                 default: 1
 *                 minimum: 1
 *                 example: 2
 *     responses:
 *       200:
 *         description: Item added to cart
 *       404:
 *         description: User not found
 */
router.put('/cart', authMiddleware, addToCart)

/**
 * @swagger
 * /users/cart/update:
 *   put:
 *     summary: Update cart item quantity
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - productId
 *               - count
 *             properties:
 *               productId:
 *                 type: string
 *                 example: "64a8e2b2e35fca82dfb72d1b"
 *               count:
 *                 type: number
 *                 minimum: 1
 *                 example: 3
 *     responses:
 *       200:
 *         description: Cart updated successfully
 *       400:
 *         description: productId and count are required
 *       404:
 *         description: User or product not found
 */
router.put('/cart/update', authMiddleware, updateCart)

/**
 * @swagger
 * /users/cart/empty:
 *   put:
 *     summary: Empty user cart
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Cart emptied successfully
 */
router.put('/cart/empty', authMiddleware, emptyCart)

/**
 * @swagger
 * /users/cart/{id}:
 *   put:
 *     summary: Remove item from cart
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Product ID to remove
 *     responses:
 *       200:
 *         description: Item removed from cart
 */
router.put('/cart/:id', authMiddleware, deleteFromCart)

/**
 * @swagger
 * /users/forgot:
 *   post:
 *     summary: Request password reset OTP
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 example: "john@example.com"
 *     responses:
 *       200:
 *         description: OTP sent to email
 *       404:
 *         description: Email not found
 */
router.post('/forgot', forgotPassword)

/**
 * @swagger
 * /users/reset:
 *   put:
 *     summary: Reset password with OTP
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *               - otp
 *             properties:
 *               email:
 *                 type: string
 *                 example: "john@example.com"
 *               password:
 *                 type: string
 *                 example: "newpassword123"
 *               otp:
 *                 type: string
 *                 example: "123456"
 *     responses:
 *       200:
 *         description: Password reset successfully
 *       400:
 *         description: Invalid or expired OTP
 */
router.put('/reset', resetPassword)

/**
 * @swagger
 * /users/change-password:
 *   put:
 *     summary: Change password
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - oldPassword
 *               - newPassword
 *             properties:
 *               oldPassword:
 *                 type: string
 *                 example: "oldpassword123"
 *               newPassword:
 *                 type: string
 *                 example: "newpassword123"
 *     responses:
 *       200:
 *         description: Password changed successfully
 *       401:
 *         description: Incorrect old password
 *       404:
 *         description: User not found
 */
router.put('/change-password', authMiddleware, changePassword)

/**
 * @swagger
 * /users/send-otp:
 *   post:
 *     summary: Send OTP for email verification
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 example: "john@example.com"
 *     responses:
 *       200:
 *         description: OTP sent successfully
 */
router.post('/send-otp', sendOtp)

/**
 * @swagger
 * /users/verify-otp:
 *   post:
 *     summary: Verify OTP and register
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - password
 *               - otp
 *             properties:
 *               name:
 *                 type: string
 *                 example: "John Doe"
 *               email:
 *                 type: string
 *                 example: "john@example.com"
 *               password:
 *                 type: string
 *                 example: "password123"
 *               otp:
 *                 type: string
 *                 example: "123456"
 *     responses:
 *       201:
 *         description: User registered successfully
 *       400:
 *         description: Invalid OTP or user already exists
 */
router.post('/verify-otp', verifyOtpAndRegister)

/**
 * @swagger
 * /users/{id}:
 *   get:
 *     summary: Get user by ID
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     responses:
 *       200:
 *         description: User details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                     name:
 *                       type: string
 *                     email:
 *                       type: string
 *                     age:
 *                       type: number
 *                     role:
 *                       type: string
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *       404:
 *         description: User not found
 */
router.get('/:id', validateRequest(getUserSchema, 'params'), getUserById)

/**
 * @swagger
 * /users/{id}:
 *   put:
 *     summary: Update user by ID
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: "John Smith"
 *               email:
 *                 type: string
 *                 example: "johnsmith@example.com"
 *               age:
 *                 type: number
 *                 example: 26
 *               role:
 *                 type: string
 *                 enum: [admin, user, seller]
 *                 example: "user"
 *     responses:
 *       200:
 *         description: User updated successfully
 *       404:
 *         description: User not found
 */
router.put('/:id', validateRequest(updateUserSchema), updateUser)

/**
 * @swagger
 * /users/{id}:
 *   delete:
 *     summary: Delete user by ID
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     responses:
 *       200:
 *         description: User deleted successfully
 */
router.delete('/:id', deleteUser)

export default router