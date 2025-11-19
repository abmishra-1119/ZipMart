import React, { useEffect, useState, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  Row,
  Col,
  Card,
  Button,
  Empty,
  Spin,
  Alert,
  Divider,
  Modal,
} from "antd";
import {
  ShoppingCartOutlined,
  ArrowLeftOutlined,
  ShoppingOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
import { getCart, emptyCart } from "../features/auth/authSlice";
import CartItem from "../components/CartItem";
import { toast } from "react-toastify";

const CartPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const {
    cart: cartItems,
    isLoading: authLoading,
    isAuthenticated,
  } = useSelector((state) => state.auth);

  const [cartProducts, setCartProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [emptyCartModal, setEmptyCartModal] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      dispatch(getCart());
    }
  }, [dispatch, isAuthenticated]);

  useEffect(() => {
    const processCartItems = () => {
      if (!cartItems || cartItems.length === 0) {
        setCartProducts([]);
        return;
      }

      setLoadingProducts(true);
      try {
        const processedProducts = cartItems.map((item) => ({
          item: {
            ...item,
          },
          product: item.productId,
        }));

        setCartProducts(processedProducts);
      } catch (error) {
        console.error("Error processing cart items:", error);
        toast.error("Failed to load cart items. Please try again.");
      } finally {
        setLoadingProducts(false);
      }
    };

    // Add a small delay to prevent rapid re-processing
    const timeoutId = setTimeout(processCartItems, 100);
    return () => clearTimeout(timeoutId);
  }, [cartItems]);

  const openEmptyCartModal = () => setEmptyCartModal(true);

  const confirmEmptyCart = async () => {
    try {
      await dispatch(emptyCart()).unwrap();
      setCartProducts([]);
      toast.success("Cart emptied successfully");
    } catch (err) {
      console.error(err);
      toast.error("Failed to empty cart");
    }
    setEmptyCartModal(false);
  };

  const handleCheckout = () => {
    if (!isAuthenticated) {
      toast.warning("Please login to proceed with checkout");
      navigate("/login");
      return;
    }

    if (cartProducts.length === 0) {
      toast.warning("Your cart is empty");
      return;
    }

    // Check if any products are out of stock
    const outOfStockItems = cartProducts.filter(
      ({ product }) => product.stock === 0
    );
    if (outOfStockItems.length > 0) {
      toast.error(
        "Some items in your cart are out of stock. Please remove them before checkout."
      );
      return;
    }

    // Check if any items exceed available stock
    const exceededStockItems = cartProducts.filter(
      ({ item, product }) => item.count > product.stock
    );
    if (exceededStockItems.length > 0) {
      toast.error(
        "Some items in your cart exceed available stock. Please adjust quantities before checkout."
      );
      return;
    }

    // Navigate to checkout page with cart data
    navigate("/checkout", {
      state: {
        cartProducts,
        orderSummary: calculateTotals(),
      },
    });
  };

  const calculateTotals = useCallback(() => {
    if (cartProducts.length === 0)
      return { subtotal: 0, total: 0, itemsCount: 0 };

    const itemsCount = cartProducts.reduce(
      (count, { item }) => count + item.count,
      0
    );
    const subtotal = cartProducts.reduce((total, { item, product }) => {
      return total + (product?.price || 0) * item.count;
    }, 0);

    const shipping = subtotal > 50 ? 0 : 10;
    const tax = subtotal * 0.1;
    const total = subtotal + shipping + tax;

    return { subtotal, shipping, tax, total, itemsCount };
  }, [cartProducts]);

  const { subtotal, shipping, tax, total, itemsCount } = calculateTotals();

  // Show loading state
  if (authLoading || loadingProducts) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          <div className="flex justify-center items-center h-64">
            <Spin size="large" tip="Loading your cart..." />
          </div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto">
            <Alert
              message="Authentication Required"
              description="Please log in to view your cart and manage your shopping items."
              type="warning"
              showIcon
              action={
                <Button
                  type="primary"
                  onClick={() =>
                    navigate("/login", { state: { from: "/cart" } })
                  }
                >
                  Login Now
                </Button>
              }
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <Button
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate(-1)}
            className="!mb-4"
          >
            Back
          </Button>

          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">
                Shopping Cart
              </h1>
              <p className="text-gray-600">
                {cartProducts.length} item(s) • {itemsCount} units
              </p>
            </div>

            {cartProducts.length > 0 && (
              <Button
                danger
                icon={<DeleteOutlined />}
                onClick={openEmptyCartModal}
              >
                Empty Cart
              </Button>
            )}
          </div>
        </div>

        <Row gutter={[32, 32]}>
          {/* Cart Items */}
          <Col xs={24} lg={16}>
            {cartProducts.length > 0 ? (
              <div>
                {cartProducts.map(({ item, product }) => (
                  <CartItem
                    key={`${product._id}-${item.count}`}
                    item={item}
                    product={product}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12 shadow-sm">
                <Card>
                  <Empty
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                    description={
                      <div className="space-y-4">
                        <p className="text-lg text-gray-600">
                          Your cart is empty
                        </p>
                        <p className="text-gray-500 max-w-md mx-auto">
                          Looks like you haven't added any products to your cart
                          yet. Start shopping to discover amazing deals!
                        </p>
                        <Button
                          type="primary"
                          size="large"
                          icon={<ShoppingOutlined />}
                          onClick={() => navigate("/")}
                        >
                          Start Shopping
                        </Button>
                      </div>
                    }
                  />
                </Card>
              </div>
            )}
          </Col>

          {/* Order Summary - Only show when cart has items */}
          {cartProducts.length > 0 && (
            <Col xs={24} lg={8}>
              <div className="sticky top-20 shadow-sm">
                <Card
                  title="Order Summary"
                  extra={
                    <span className="text-green-600 font-semibold">
                      {itemsCount} items
                    </span>
                  }
                >
                  <div className="space-y-4">
                    {/* Summary Items */}
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-600">
                          Subtotal ({itemsCount} items):
                        </span>
                        <span className="font-medium">
                          ₹{subtotal.toFixed(2)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Shipping:</span>
                        <span className="font-medium">
                          {shipping === 0 ? (
                            <span className="text-green-600">FREE</span>
                          ) : (
                            `₹${shipping.toFixed(2)}`
                          )}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Tax (10%):</span>
                        <span className="font-medium">₹{tax.toFixed(2)}</span>
                      </div>
                      {shipping > 0 && (
                        <div className="text-xs text-gray-500 text-center">
                          Free shipping on orders over ₹500
                        </div>
                      )}
                      <Divider className="my-2" />
                      <div className="flex justify-between text-lg font-bold">
                        <span>Total:</span>
                        <span className="text-green-600">
                          ₹{total.toFixed(2)}
                        </span>
                      </div>
                    </div>

                    {/* Checkout Button */}
                    <Button
                      type="primary"
                      size="large"
                      icon={<ShoppingCartOutlined />}
                      onClick={handleCheckout}
                      className="!w-full !h-12 !text-lg !bg-green-600 hover:!bg-green-700 !border-none !shadow-md"
                    >
                      Proceed to Checkout
                    </Button>

                    {/* Continue Shopping */}
                    <Button
                      type="default"
                      size="large"
                      onClick={() => navigate("/")}
                      className="!w-full !border-gray-300 hover:!border-blue-500"
                    >
                      Continue Shopping
                    </Button>

                    {/* Security Notice */}
                    <div className="text-center text-xs text-gray-500 mt-4 p-3 bg-gray-50 rounded-lg">
                      <p className="font-medium mb-1">🔒 Secure Checkout</p>
                      <p>Your payment information is encrypted and secure</p>
                    </div>
                  </div>
                </Card>
              </div>
            </Col>
          )}
        </Row>
      </div>
      <Modal
        title="Empty Cart"
        open={emptyCartModal}
        onOk={confirmEmptyCart}
        onCancel={() => setEmptyCartModal(false)}
        okText="Yes, Empty Cart"
        okType="danger"
        cancelText="Cancel"
      >
        <p>Are you sure you want to remove all items from your cart?</p>
        <p className="text-red-500 font-medium mt-2">
          This action cannot be undone.
        </p>
      </Modal>
    </div>
  );
};

export default CartPage;
