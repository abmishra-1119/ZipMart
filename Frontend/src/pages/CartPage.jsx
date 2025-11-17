// pages/CartPage.jsx
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
    message,
    Modal,
} from "antd";
import {
    ShoppingCartOutlined,
    ArrowLeftOutlined,
    ShoppingOutlined,
    DeleteOutlined,
} from "@ant-design/icons";
import { getCart, emptyCart } from "../features/auth/authSlice";
import { getProductById } from "../features/product/productSlice";
import CartItem from "../components/CartItem";
import { toast } from "react-toastify";

const CartPage = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const { cart, isLoading, user, isAuthenticated } = useSelector(
        (state) => state.auth
    );

    // Use a more specific selector to avoid unnecessary re-renders
    const cartItems = useSelector((state) => state.auth.cart);
    const authLoading = useSelector((state) => state.auth.isLoading);

    const [cartProducts, setCartProducts] = useState([]);
    const [loadingProducts, setLoadingProducts] = useState(false);
    const [productCache, setProductCache] = useState(new Map());

    // Load cart when component mounts and user is authenticated
    useEffect(() => {
        if (isAuthenticated) {
            dispatch(getCart());
        }
    }, [dispatch, isAuthenticated]);

    // Memoized function to fetch product details
    const fetchProductDetails = useCallback(async (productId) => {
        // Check cache first
        if (productCache.has(productId)) {
            return productCache.get(productId);
        }

        try {
            const result = await dispatch(getProductById(productId)).unwrap();
            if (result.data) {
                // Update cache
                setProductCache(prev => new Map(prev).set(productId, result.data));
                return result.data;
            }
        } catch (error) {
            console.error(`Failed to fetch product ${productId}:`, error);
            return null;
        }
    }, [dispatch, productCache]);

    // Optimized product fetching with batching
    useEffect(() => {
        const fetchCartProducts = async () => {
            if (!cartItems || cartItems.length === 0) {
                setCartProducts([]);
                return;
            }

            setLoadingProducts(true);
            try {
                const productPromises = cartItems.map(async (item) => {
                    const product = await fetchProductDetails(item.productId);
                    return product ? { item, product } : null;
                });

                const results = await Promise.all(productPromises);
                const validProducts = results.filter(Boolean);

                setCartProducts(validProducts);
            } catch (error) {
                console.error("Error fetching cart products:", error);
                toast.error("Failed to load cart products. Please try again.");
            } finally {
                setLoadingProducts(false);
            }
        };

        // Add a small delay to prevent rapid re-fetches
        const timeoutId = setTimeout(fetchCartProducts, 100);
        return () => clearTimeout(timeoutId);
    }, [cartItems, fetchProductDetails]);

    const handleEmptyCart = () => {
        Modal.confirm({
            title: "Empty Cart",
            content: "Are you sure you want to remove all items from your cart?",
            okText: "Yes, Empty Cart",
            okType: "danger",
            cancelText: "Cancel",
            onOk: async () => {
                try {
                    await dispatch(emptyCart()).unwrap();
                    setCartProducts([]); // Clear local state immediately
                    setProductCache(new Map()); // Clear cache
                    toast.success("Cart emptied successfully");
                } catch (error) {
                    toast.error(error || "Failed to empty cart");
                }
            },
        });
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
                        className="mb-4"
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
                                onClick={handleEmptyCart}
                                loading={authLoading}
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
                                        key={`${item.productId}-${item.count}`}
                                        item={item}
                                        product={product}
                                    />
                                ))}
                            </div>
                        ) : (
                            <Card className="text-center py-12 shadow-sm">
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
                                                onClick={() => navigate("/products")}
                                            >
                                                Start Shopping
                                            </Button>
                                        </div>
                                    }
                                />
                            </Card>
                        )}
                    </Col>

                    {/* Order Summary - Only show when cart has items */}
                    {cartProducts.length > 0 && (
                        <Col xs={24} lg={8}>
                            <Card
                                title="Order Summary"
                                className="sticky top-4 shadow-sm"
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
                                        className="w-full h-12 text-lg bg-green-600 hover:bg-green-700 border-none shadow-md"
                                    >
                                        Proceed to Checkout
                                    </Button>

                                    {/* Continue Shopping */}
                                    <Button
                                        type="default"
                                        size="large"
                                        onClick={() => navigate("/")}
                                        className="w-full border-gray-300 hover:border-blue-500"
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
                        </Col>
                    )}
                </Row>
            </div>
        </div>
    );
};

export default CartPage;