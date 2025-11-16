// pages/CheckoutPage.jsx
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';
import {
    Row,
    Col,
    Card,
    Button,
    Form,
    Input,
    Select,
    Radio,
    Divider,
    Spin,
    Alert,
    Modal,
    Tag,
    Empty,
    Descriptions
} from 'antd';
import {
    ArrowLeftOutlined,
    ShoppingOutlined,
    PlusOutlined,
    CheckOutlined,
    ShoppingCartOutlined
} from '@ant-design/icons';
import { createOrder } from '../features/orders/orderSlice';
import { getAddresses, addAddress } from '../features/addresses/addressSlice';
import { emptyCart } from '../features/auth/authSlice';
import { toast } from 'react-toastify';

const { Option } = Select;
const { TextArea } = Input;

const CheckoutPage = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const location = useLocation();
    const [form] = Form.useForm();

    const { user, isAuthenticated } = useSelector(state => state.auth);
    const { addresses, loading: addressLoading } = useSelector(state => state.addresses);
    const { loading: orderLoading, error: orderError } = useSelector(state => state.orders);

    const [selectedAddress, setSelectedAddress] = useState(null);
    const [showAddressForm, setShowAddressForm] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState('COD');
    const [placingOrder, setPlacingOrder] = useState(false);

    // Get cart data from navigation state
    const { cartProducts, orderSummary } = location.state || {};

    // Load addresses on component mount
    useEffect(() => {
        if (isAuthenticated) {
            dispatch(getAddresses());
        }
    }, [dispatch, isAuthenticated]);

    // Redirect if no cart data
    useEffect(() => {
        if (!cartProducts || cartProducts.length === 0) {
            toast.warning('Your cart is empty');
            navigate('/cart');
        }
    }, [cartProducts, navigate]);

    // Handle new address submission
    const handleAddAddress = async (values) => {
        try {
            await dispatch(addAddress(values)).unwrap();
            toast.success('Address added successfully');
            setShowAddressForm(false);
            form.resetFields();
            // Reload addresses to get the updated list
            dispatch(getAddresses());
        } catch (error) {
            toast.error(error || 'Failed to add address');
        }
    };

    // Handle order placement
    const handlePlaceOrder = async () => {
        if (!selectedAddress) {
            toast.error('Please select a delivery address');
            return;
        }

        if (!cartProducts || cartProducts.length === 0) {
            toast.error('Your cart is empty');
            return;
        }

        // Check stock availability
        const outOfStockItems = cartProducts.filter(({ product }) => product.stock === 0);
        if (outOfStockItems.length > 0) {
            toast.error('Some items in your cart are out of stock. Please remove them before placing order.');
            return;
        }

        setPlacingOrder(true);

        try {
            // Prepare order data according to your order model
            const orderData = {
                products: cartProducts.map(({ item, product }) => ({
                    productId: product._id,
                    sellerId: product.sellerId?._id,
                    count: item.count,
                    price: product.price
                })),
                totalPrice: orderSummary.subtotal,
                finalPrice: orderSummary.total,
                paymentMethod: paymentMethod,
                address: selectedAddress
            };

            // Create order
            const result = await dispatch(createOrder(orderData)).unwrap();

            // Clear cart after successful order
            await dispatch(emptyCart()).unwrap();

            toast.success('Order placed successfully!');
            // Redirect to order confirmation page
            navigate(`/order-confirmation/${result.order._id}`);

        } catch (error) {
            toast.error(error || 'Failed to place order');
        } finally {
            setPlacingOrder(false);
        }
    };

    // Address card component
    const AddressCard = ({ address, isSelected, onSelect }) => {
        const isDefault = addresses.find(a => a._id === address._id)?.isDefault;

        return (
            <Card
                className={`cursor-pointer border-2 transition-all ${isSelected ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                    }`}
                onClick={() => onSelect(address)}
            >
                <div className="flex justify-between items-start">
                    <div className="flex-1">
                        {isDefault && (
                            <Tag color="blue" className="mb-2">
                                Default
                            </Tag>
                        )}
                        <p className="font-semibold">{address.house}</p>
                        {address.street && <p className="text-gray-600">{address.street}</p>}
                        {address.landmark && <p className="text-gray-600">Near {address.landmark}</p>}
                        <p className="text-gray-600">
                            {address.city}, {address.state} - {address.pincode}
                        </p>
                        <p className="text-gray-600">{address.country}</p>
                    </div>
                    {isSelected && (
                        <CheckOutlined className="text-blue-500 text-lg" />
                    )}
                </div>
            </Card>
        );
    };

    if (!isAuthenticated) {
        return (
            <div className="min-h-screen bg-gray-50 py-8">
                <div className="container mx-auto px-4">
                    <Alert
                        toast="Authentication Required"
                        description="Please log in to complete your purchase."
                        type="warning"
                        showIcon
                        action={
                            <Button
                                type="primary"
                                onClick={() => navigate('/login')}
                            >
                                Login Now
                            </Button>
                        }
                    />
                </div>
            </div>
        );
    }

    if (!cartProducts || cartProducts.length === 0) {
        return (
            <div className="min-h-screen bg-gray-50 py-8">
                <div className="container mx-auto px-4">
                    <div className="text-center py-12">
                        <Spin size="large" />
                        <p className="mt-4 text-gray-600">Redirecting to cart...</p>
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
                        onClick={() => navigate('/cart')}
                        className="mb-4"
                    >
                        Back to Cart
                    </Button>

                    <h1 className="text-3xl font-bold text-gray-800 mb-2">
                        Checkout
                    </h1>
                    <p className="text-gray-600">
                        Complete your order with secure payment
                    </p>
                </div>

                {orderError && (
                    <Alert
                        toast={orderError}
                        type="error"
                        closable
                        className="mb-6"
                    />
                )}

                <Row gutter={[32, 32]}>
                    {/* Left Column - Order Details, Delivery & Payment */}
                    <Col xs={24} lg={16}>
                        {/* Order Items Summary */}
                        <Card title="Order Items" className="mb-6 shadow-sm">
                            <div className="space-y-4">
                                {cartProducts.map(({ item, product }) => (
                                    <div key={item.productId} className="flex gap-4 border-b pb-4 last:border-b-0">
                                        <div className="flex-shrink-0 w-20 h-20 bg-gray-100 rounded-lg overflow-hidden">
                                            <img
                                                src={product.thumbnail || product.images?.[0]?.url || '/placeholder-image.jpg'}
                                                alt={product.title}
                                                className="w-full h-full object-scale-down"
                                            />
                                        </div>
                                        <div className="flex-1">
                                            <h4 className="font-semibold text-gray-800">{product.title}</h4>
                                            <p className="text-gray-600 text-sm">Qty: {item.count}</p>
                                            <p className="text-gray-600 text-sm">${product.price} each</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-semibold text-green-600">
                                                ${(product.price * item.count).toFixed(2)}
                                            </p>
                                            {product.stock < 10 && (
                                                <Tag color="orange" className="text-xs mt-1">
                                                    Only {product.stock} left
                                                </Tag>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </Card>

                        {/* Delivery Address */}
                        <Card title="Delivery Address" className="mb-6 shadow-sm">
                            {addressLoading ? (
                                <div className="text-center py-8">
                                    <Spin />
                                </div>
                            ) : addresses?.length > 0 ? (
                                <div className="space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {addresses.map((address, index) => (
                                            <AddressCard
                                                key={address._id || index}
                                                address={address}
                                                isSelected={selectedAddress?._id === address._id}
                                                onSelect={setSelectedAddress}
                                            />
                                        ))}
                                    </div>

                                    <Button
                                        type="dashed"
                                        icon={<PlusOutlined />}
                                        onClick={() => setShowAddressForm(true)}
                                        className="w-full"
                                    >
                                        Add New Address
                                    </Button>
                                </div>
                            ) : (
                                <div className="text-center py-4">
                                    <Empty
                                        description="No addresses found"
                                        image={Empty.PRESENTED_IMAGE_SIMPLE}
                                    />
                                    <Button
                                        type="primary"
                                        icon={<PlusOutlined />}
                                        onClick={() => setShowAddressForm(true)}
                                        className="mt-4"
                                    >
                                        Add Your First Address
                                    </Button>
                                </div>
                            )}
                        </Card>

                        {/* Payment Method */}
                        <Card title="Payment Method" className="shadow-sm">
                            <Radio.Group
                                value={paymentMethod}
                                onChange={(e) => setPaymentMethod(e.target.value)}
                                className="w-full"
                            >
                                <div className="space-y-3">
                                    <div className="border rounded-lg p-4 hover:border-blue-500 transition-colors">
                                        <Radio value="COD" className="w-full">
                                            <div className="ml-2">
                                                <p className="font-semibold">Cash on Delivery</p>
                                                <p className="text-gray-600 text-sm">Pay when you receive your order</p>
                                            </div>
                                        </Radio>
                                    </div>
                                    <div className="border rounded-lg p-4 hover:border-blue-500 transition-colors">
                                        <Radio value="UPI" className="w-full">
                                            <div className="ml-2">
                                                <p className="font-semibold">UPI Payment</p>
                                                <p className="text-gray-600 text-sm">Pay using UPI apps</p>
                                            </div>
                                        </Radio>
                                    </div>
                                    <div className="border rounded-lg p-4 hover:border-blue-500 transition-colors">
                                        <Radio value="Credit-Card" className="w-full">
                                            <div className="ml-2">
                                                <p className="font-semibold">Credit Card</p>
                                                <p className="text-gray-600 text-sm">Pay with your credit card</p>
                                            </div>
                                        </Radio>
                                    </div>
                                    <div className="border rounded-lg p-4 hover:border-blue-500 transition-colors">
                                        <Radio value="Debit-Card" className="w-full">
                                            <div className="ml-2">
                                                <p className="font-semibold">Debit Card</p>
                                                <p className="text-gray-600 text-sm">Pay with your debit card</p>
                                            </div>
                                        </Radio>
                                    </div>
                                </div>
                            </Radio.Group>
                        </Card>
                    </Col>

                    {/* Right Column - Order Summary */}
                    <Col xs={24} lg={8}>
                        <Card title="Order Summary" className="sticky top-4 shadow-sm">
                            <div className="space-y-4">
                                {/* Price Breakdown */}
                                <div className="space-y-2">
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Subtotal:</span>
                                        <span>${orderSummary?.subtotal.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Shipping:</span>
                                        <span>
                                            {orderSummary?.shipping === 0 ? (
                                                <span className="text-green-600">FREE</span>
                                            ) : (
                                                `$${orderSummary?.shipping.toFixed(2)}`
                                            )}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Tax (10%):</span>
                                        <span>${orderSummary?.tax.toFixed(2)}</span>
                                    </div>
                                    <Divider className="my-2" />
                                    <div className="flex justify-between text-lg font-bold">
                                        <span>Total:</span>
                                        <span className="text-green-600">${orderSummary?.total.toFixed(2)}</span>
                                    </div>
                                </div>

                                {/* Selected Address Preview */}
                                {selectedAddress && (
                                    <>
                                        <Divider className="my-2" />
                                        <div className="text-sm">
                                            <p className="font-semibold mb-2">Delivery to:</p>
                                            <p>{selectedAddress.house}</p>
                                            {selectedAddress.street && <p>{selectedAddress.street}</p>}
                                            <p>{selectedAddress.city}, {selectedAddress.state} - {selectedAddress.pincode}</p>
                                        </div>
                                    </>
                                )}

                                {/* Payment Method Preview */}
                                <div className="text-sm">
                                    <p className="font-semibold">Payment: {paymentMethod}</p>
                                </div>

                                {/* Place Order Button */}
                                <Button
                                    type="primary"
                                    size="large"
                                    icon={<ShoppingOutlined />}
                                    loading={placingOrder || orderLoading}
                                    onClick={handlePlaceOrder}
                                    disabled={!selectedAddress}
                                    className="w-full h-12 text-lg bg-green-600 hover:bg-green-700 border-none shadow-md"
                                >
                                    {placingOrder ? 'Placing Order...' : `Place Order $${orderSummary?.total.toFixed(2)}`}
                                </Button>

                                {/* Security Notice */}
                                <div className="text-center text-xs text-gray-500 mt-4 p-3 bg-gray-50 rounded-lg">
                                    <p className="font-medium mb-1">🔒 Secure Checkout</p>
                                    <p>Your order and payment information are protected</p>
                                </div>
                            </div>
                        </Card>
                    </Col>
                </Row>

                {/* Add Address Modal */}
                <Modal
                    title="Add New Address"
                    open={showAddressForm}
                    onCancel={() => {
                        setShowAddressForm(false);
                        form.resetFields();
                    }}
                    footer={null}
                    width={600}
                >
                    <Form
                        form={form}
                        layout="vertical"
                        onFinish={handleAddAddress}
                    >
                        <Row gutter={16}>
                            <Col xs={24}>
                                <Form.Item
                                    name="house"
                                    label="House/Flat No. & Building"
                                    rules={[{ required: true, toast: 'Please enter house/flat number' }]}
                                >
                                    <Input placeholder="e.g., 101, Skyline Apartments" />
                                </Form.Item>
                            </Col>
                            <Col xs={24}>
                                <Form.Item
                                    name="street"
                                    label="Street/Area"
                                >
                                    <Input placeholder="e.g., Main Street, Downtown" />
                                </Form.Item>
                            </Col>
                            <Col xs={24}>
                                <Form.Item
                                    name="landmark"
                                    label="Landmark (Optional)"
                                >
                                    <Input placeholder="e.g., Near Central Park" />
                                </Form.Item>
                            </Col>
                            <Col xs={24} md={12}>
                                <Form.Item
                                    name="city"
                                    label="City"
                                    rules={[{ required: true, toast: 'Please enter city' }]}
                                >
                                    <Input placeholder="e.g., Mumbai" />
                                </Form.Item>
                            </Col>
                            <Col xs={24} md={12}>
                                <Form.Item
                                    name="state"
                                    label="State"
                                    rules={[{ required: true, toast: 'Please enter state' }]}
                                >
                                    <Input placeholder="e.g., Maharashtra" />
                                </Form.Item>
                            </Col>
                            <Col xs={24} md={12}>
                                <Form.Item
                                    name="pincode"
                                    label="Pincode"
                                    rules={[
                                        { required: true, toast: 'Please enter pincode' },
                                        { pattern: /^[1-9][0-9]{5}$/, toast: 'Please enter valid pincode' }
                                    ]}
                                >
                                    <Input placeholder="e.g., 400001" maxLength={6} />
                                </Form.Item>
                            </Col>
                            <Col xs={24} md={12}>
                                <Form.Item
                                    name="country"
                                    label="Country"
                                    initialValue="India"
                                >
                                    <Input disabled />
                                </Form.Item>
                            </Col>
                        </Row>
                        <div className="flex gap-2 justify-end">
                            <Button onClick={() => setShowAddressForm(false)}>
                                Cancel
                            </Button>
                            <Button type="primary" htmlType="submit">
                                Save Address
                            </Button>
                        </div>
                    </Form>
                </Modal>
            </div>
        </div>
    );
};

export default CheckoutPage;