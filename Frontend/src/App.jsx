import { BrowserRouter, Route, Routes, useLocation } from "react-router-dom";
import "./App.css";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Login from "./pages/Login";
import { ToastContainer } from "react-toastify";
import Signup from "./pages/SignUp";
import ForgotPassword from "./pages/ForgotPassword";
import ProductDetails from "./pages/ProductDetails";
import SearchPage from "./pages/SearchPage";
import CartPage from "./pages/CartPage";
import CheckoutPage from "./pages/CheckoutPage";
import OrderConfirmation from "./pages/OrderConfirmation";
import OrderDetailsPage from "./pages/Users/OrderDetials";
import OrdersPage from "./pages/Users/Orders";
import ProfilePage from "./pages/Users/Profile";
import SellerDashboardLayout from "./pages/Sellers/SellerDashboardLayout";
import DashboardOverview from "./pages/Sellers/DashboardOverview";
import ProductsManagement from "./pages/Sellers/ProductsManagement";
import CreateProductPage from "./pages/Sellers/CreateProductPage";
import EditProductPage from "./pages/Sellers/EditProductPage";
import OrdersManagementPage from "./pages/Sellers/OrdersManagementPage";
import AnalyticsPage from "./pages/Sellers/AnalyticsPage";
import OrderViewPage from "./pages/Sellers/OrderViewPage";
import AdminDashboardLayout from "./pages/Admin/AdminDashboardLayout";
import AdminDashboardOverview from "./pages/Admin/DashboardOverview";
import UsersManagement from "./pages/Admin/UsersManagement";
import UserDetail from "./pages/Admin/UserDetail";
import AdminProductsManagement from "./pages/Admin/ProductsManagement";
import OrdersManagement from "./pages/Admin/OrdersManagement";
import AnalyticsDashboard from "./pages/Admin/AnalyticsDashboard";
import ProductEdit from "./pages/Admin/ProductEdit";
import SellersManagement from "./pages/Admin/SellersManagement";
import CreateSeller from "./pages/Admin/CreateSeller";
import OrderDetail from "./pages/Admin/OrderDetail";
import SellerDetail from "./pages/Admin/SellerDetail";
import CouponManagement from "./pages/Admin/CouponManagement";

function AppWrapper() {
  const location = useLocation();

  // Hide navbar if route starts with /seller or /admin
  const hiddenNavbarPaths = ["/seller", "/admin"];
  const hideNavbar = hiddenNavbarPaths.some((path) =>
    location.pathname.startsWith(path)
  );
  return (
    <>
      {!hideNavbar && <Navbar />}

      <ToastContainer position="top-right" autoClose={2000} theme="dark" />

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/products/:id" element={<ProductDetails />} />
        <Route path="/search" element={<SearchPage />} />
        <Route path="/cart" element={<CartPage />} />
        <Route path="/checkout" element={<CheckoutPage />} />
        <Route
          path="/order-confirmation/:orderId"
          element={<OrderConfirmation />}
        />
        <Route path="/orders" element={<OrdersPage />} />
        <Route path="/orders/:orderId" element={<OrderDetailsPage />} />
        <Route path="/profile" element={<ProfilePage />} />

        {/* Seller Dashboard Routes */}
        <Route path="/seller" element={<SellerDashboardLayout />}>
          <Route path="dashboard" element={<DashboardOverview />} />
          <Route path="products" element={<ProductsManagement />} />
          <Route path="products/all" element={<ProductsManagement />} />
          <Route path="products/create" element={<CreateProductPage />} />
          <Route path="products/edit/:id" element={<EditProductPage />} />
          <Route path="orders" element={<OrdersManagementPage />} />
          <Route path="analytics" element={<AnalyticsPage />} />
          <Route path="orders/:orderId" element={<OrderViewPage />} />
        </Route>

        <Route path="/admin/dashboard" element={<AdminDashboardLayout />}>
          <Route index element={<AdminDashboardOverview />} />
          <Route path="users" element={<UsersManagement />} />
          <Route path="users/:userId" element={<UserDetail />} />
          <Route path="products" element={<AdminProductsManagement />} />
          <Route path="products/edit/:productId" element={<ProductEdit />} />
          <Route path="orders" element={<OrdersManagement />} />
          <Route path="analytics" element={<AnalyticsDashboard />} />
          <Route path="sellers" element={<SellersManagement />} />
          <Route path="sellers/create" element={<CreateSeller />} />
          <Route path="sellers/:sellerId" element={<SellerDetail />} />
          <Route path="orders/:orderId" element={<OrderDetail />} />
          <Route path="coupons" element={<CouponManagement />} />
        </Route>
      </Routes>
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppWrapper />
    </BrowserRouter>
  );
}
