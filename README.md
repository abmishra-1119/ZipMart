# ZipMart - E-Commerce Platform

A full-stack e-commerce application built with the MERN stack, featuring multi-vendor support, admin dashboard, and modern UI components.

## 🚀 Live Demo

- **Frontend**: [https://zip-mart.vercel.app](https://zip-mart.vercel.app)
- **Backend API**: [https://zipmart-production.up.railway.app](https://zipmart-production.up.railway.app)
- **GitHub Repository**: [https://github.com/abmishra-1119/ZipMart](https://github.com/abmishra-1119/ZipMart)

## ✨ Features

### 🛍️ Customer Features
- **Product Browsing** - Search, filter, and view product details
- **Shopping Cart** - Add/remove items with persistent cart data
- **Secure Checkout** - Complete order process with payment integration
- **Order Management** - Track orders and view order history
- **User Profiles** - Manage personal information and preferences

### 👨‍💼 Seller Features
- **Seller Dashboard** - Comprehensive management interface
- **Product Management** - Create, edit, and delete products
- **Order Management** - Process and fulfill customer orders
- **Analytics** - Sales performance and business insights
- **Inventory Control** - Stock management and updates

### 👑 Admin Features
- **User Management** - Manage customers and sellers
- **Product Oversight** - Monitor all platform products
- **Order Administration** - View and manage all orders
- **Seller Management** - Approve/disable seller accounts
- **Platform Analytics** - Comprehensive business intelligence

## 🛠️ Technology Stack

### Frontend
- **React 19** - Modern UI library
- **Vite** - Fast build tool and dev server
- **Redux Toolkit** - State management
- **React Router DOM** - Client-side routing
- **Ant Design** - UI component library
- **Tailwind CSS** - Utility-first CSS framework
- **Axios** - HTTP client for API calls

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web application framework
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB object modeling
- **JWT** - Authentication tokens
- **Cloudinary** - Image storage and CDN
- **CORS** - Cross-origin resource sharing

### Deployment
- **Vercel** - Frontend hosting
- **Railway** - Backend hosting
- **MongoDB Atlas** - Cloud database

## 📦 Installation & Setup

### Prerequisites
- Node.js (v18 or higher)
- MongoDB (local or Atlas)
- Git

### Backend Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/abmishra-1119/ZipMart.git
   cd ZipMart/backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Configuration**
   Create a `.env` file in the backend directory:
   ```env
   PORT=3000
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret_key
   CLOUDINARY_CLOUD_NAME=your_cloudinary_name
   CLOUDINARY_API_KEY=your_cloudinary_api_key
   CLOUDINARY_API_SECRET=your_cloudinary_api_secret
   EMAIL_USER=your_email
   EMAIL_PASS=your_email_password
   ```

4. **Start the backend server**
   ```bash
   npm start
   # or for development
   npm run dev
   ```

### Frontend Setup

1. **Navigate to frontend directory**
   ```bash
   cd ../frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Configuration**
   Create a `.env` file in the frontend directory:
   ```env
   VITE_API_BASE_URL=http://localhost:3000
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

## 🗂️ Project Structure

```
ZipMart/
├── backend/
│   ├── config/          # Database and cloud configuration
│   ├── controllers/     # Route controllers
│   ├── middlewares/     # Custom middleware functions
│   ├── models/          # MongoDB models
│   ├── routes/          # API routes
│   ├── utils/           # Utility functions
│   └── index.js         # Main server file
├── frontend/
│   ├── src/
│   │   ├── components/  # Reusable React components
│   │   ├── pages/       # Page components
│   │   ├── store/       # Redux store configuration
│   │   └── App.js       # Main App component
│   └── package.json
└── README.md
```

## 🚀 Deployment

### Backend Deployment (Railway)
1. Push code to GitHub repository
2. Connect repository to Railway
3. Configure environment variables in Railway dashboard
4. Deploy automatically on git push

### Frontend Deployment (Vercel)
1. Push code to GitHub repository
2. Connect repository to Vercel
3. Configure build settings and environment variables
4. Deploy automatically on git push

## 📚 API Documentation

The backend API includes Swagger documentation available at:
```
https://zipmart-production.up.railway.app/api-docs
```

## 🔧 Key Features Implementation

### Authentication & Authorization
- JWT-based authentication
- Role-based access control (Customer, Seller, Admin)
- Secure password hashing with bcryptjs

### Product Management
- Multi-image support with Cloudinary
- Category and tag-based organization
- Inventory tracking and stock management

### Order System
- Complete order lifecycle management
- Email notifications for order updates
- Order status tracking

### Admin Controls
- Comprehensive user management
- Seller approval system
- Platform-wide analytics

## 👨‍💻 Author

**Abhishek Mishra**
- GitHub: [@abmishra-1119](https://github.com/abmishra-1119)

## 🙏 Acknowledgments

- Ant Design for the comprehensive UI components
- Vercel and Railway for seamless deployment
- MongoDB Atlas for reliable database hosting
- Cloudinary for image management services

---
