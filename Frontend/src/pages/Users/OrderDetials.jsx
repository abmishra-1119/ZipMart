import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
    Card,
    Button,
    Spin,
    Alert,
    Tag,
    Descriptions,
    Divider,
    Modal,
    message,
    Row,
    Col,
    Timeline
} from 'antd';
import {
    ArrowLeftOutlined,
    CloseOutlined,
    ShoppingOutlined,
    TruckOutlined,
    CheckCircleOutlined,
    HomeOutlined
} from '@ant-design/icons';
import { getOrderById, cancelOrder } from '../../features/orders/orderSlice';

const OrderDetailsPage = () => {
    const { orderId } = useParams();
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const { currentOrder, loading, error } = useSelector(state => state.orders);

    // State for cancel modal
    const [cancelModalVisible, setCancelModalVisible] = useState(false);
    const [cancellingOrder, setCancellingOrder] = useState(false);

    useEffect(() => {
        if (orderId) {
            dispatch(getOrderById(orderId));
        }
    }, [orderId, dispatch]);

    const handleCancelOrder = () => {
        setCancelModalVisible(true);
    };

    const handleConfirmCancel = async () => {
        if (!currentOrder) return;

        setCancellingOrder(true);
        try {
            await dispatch(cancelOrder(currentOrder._id)).unwrap();
            message.success('Order cancelled successfully');
            setCancelModalVisible(false);
            // Refresh the order details after cancellation
            dispatch(getOrderById(orderId));
        } catch (error) {
            message.error(error || 'Failed to cancel order');
        } finally {
            setCancellingOrder(false);
        }
    };

    const handleCancelModal = () => {
        setCancelModalVisible(false);
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'pending': return 'orange';
            case 'shipped': return 'blue';
            case 'delivered': return 'green';
            case 'cancelled': return 'red';
            case 'refund': return 'purple';
            case 'refunded': return 'purple';
            default: return 'default';
        }
    };

    const getStatusText = (status) => {
        switch (status) {
            case 'pending': return 'Pending';
            case 'shipped': return 'Shipped';
            case 'delivered': return 'Delivered';
            case 'cancelled': return 'Cancelled';
            case 'refund': return 'Refund Requested';
            case 'refunded': return 'Refunded';
            default: return status;
        }
    };

    const canCancelOrder = (order) => {
        return order && (order.status === 'pending' || order.status === 'shipped');
    };

    const getTimelineItems = (order) => {
        if (!order) return [];

        const items = [
            {
                color: 'green',
                dot: <CheckCircleOutlined />,
                children: (
                    <div>
                        <p className="font-medium">Order Placed</p>
                        <p className="text-gray-600 text-sm">
                            {new Date(order.orderDate).toLocaleString()}
                        </p>
                    </div>
                ),
            },
        ];

        if (order.status === 'shipped' || order.status === 'delivered') {
            items.push({
                color: 'blue',
                dot: <TruckOutlined />,
                children: (
                    <div>
                        <p className="font-medium">Order Shipped</p>
                        <p className="text-gray-600 text-sm">Your order is on the way</p>
                    </div>
                ),
            });
        }

        if (order.status === 'delivered') {
            items.push({
                color: 'green',
                dot: <HomeOutlined />,
                children: (
                    <div>
                        <p className="font-medium">Delivered</p>
                        <p className="text-gray-600 text-sm">Order delivered successfully</p>
                    </div>
                ),
            });
        }

        if (order.status === 'cancelled') {
            items.push({
                color: 'red',
                dot: <CloseOutlined />,
                children: (
                    <div>
                        <p className="font-medium">Order Cancelled</p>
                        <p className="text-gray-600 text-sm">Order has been cancelled</p>
                    </div>
                ),
            });
        }

        return items;
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 py-8">
                <div className="container mx-auto px-4">
                    <div className="flex justify-center items-center h-64">
                        <Spin size="large" tip="Loading order details..." />
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-50 py-8">
                <div className="container mx-auto px-4">
                    <Alert
                        message="Error Loading Order"
                        description={error}
                        type="error"
                        showIcon
                        action={
                            <Button onClick={() => navigate('/orders')}>
                                Back to Orders
                            </Button>
                        }
                    />
                </div>
            </div>
        );
    }

    if (!currentOrder) {
        return (
            <div className="min-h-screen bg-gray-50 py-8">
                <div className="container mx-auto px-4">
                    <Alert
                        message="Order Not Found"
                        description="The order you're looking for doesn't exist."
                        type="error"
                        showIcon
                        action={
                            <Button onClick={() => navigate('/orders')}>
                                Back to Orders
                            </Button>
                        }
                    />
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
                        onClick={() => navigate('/orders')}
                        className="mb-4"
                    >
                        Back to Orders
                    </Button>

                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-800 mb-2">
                                Order Details
                            </h1>
                            <p className="text-gray-600">
                                Order #{currentOrder._id}
                            </p>
                        </div>

                        <div className="flex gap-2">
                            {canCancelOrder(currentOrder) && (
                                <Button
                                    danger
                                    icon={<CloseOutlined />}
                                    onClick={handleCancelOrder}
                                    disabled={cancellingOrder}
                                >
                                    Cancel Order
                                </Button>
                            )}
                            <Button
                                type="primary"
                                icon={<ShoppingOutlined />}
                                onClick={() => navigate('/products')}
                            >
                                Continue Shopping
                            </Button>
                        </div>
                    </div>
                </div>

                <Row gutter={[32, 32]}>
                    {/* Order Timeline */}
                    <Col xs={24} lg={8}>
                        <Card title="Order Status" className="shadow-sm">
                            <Timeline items={getTimelineItems(currentOrder)} />

                            <Divider />

                            <div className="text-center">
                                <Tag
                                    color={getStatusColor(currentOrder.status)}
                                    className="text-lg font-semibold px-4 py-2"
                                >
                                    {getStatusText(currentOrder.status)}
                                </Tag>
                            </div>
                        </Card>
                    </Col>

                    {/* Order Details */}
                    <Col xs={24} lg={16}>
                        <Card title="Order Information" className="shadow-sm mb-6">
                            <Descriptions bordered column={1}>
                                <Descriptions.Item label="Order ID">
                                    {currentOrder._id}
                                </Descriptions.Item>
                                <Descriptions.Item label="Order Date">
                                    {new Date(currentOrder.orderDate).toLocaleString()}
                                </Descriptions.Item>
                                <Descriptions.Item label="Status">
                                    <Tag color={getStatusColor(currentOrder.status)}>
                                        {getStatusText(currentOrder.status)}
                                    </Tag>
                                </Descriptions.Item>
                                <Descriptions.Item label="Payment Method">
                                    {currentOrder.paymentMethod}
                                </Descriptions.Item>
                                <Descriptions.Item label="Total Amount">
                                    <span className="text-green-600 font-bold text-lg">
                                        ₹{currentOrder.finalPrice}
                                    </span>
                                </Descriptions.Item>
                            </Descriptions>
                        </Card>

                        {/* Delivery Address */}
                        <Card title="Delivery Address" className="shadow-sm mb-6">
                            <div className="text-lg">
                                <p className="font-semibold">{currentOrder.address.house}</p>
                                {currentOrder.address.street && (
                                    <p className="text-gray-700">{currentOrder.address.street}</p>
                                )}
                                {currentOrder.address.landmark && (
                                    <p className="text-gray-600">Near {currentOrder.address.landmark}</p>
                                )}
                                <p className="text-gray-700">
                                    {currentOrder.address.city}, {currentOrder.address.state} - {currentOrder.address.pincode}
                                </p>
                                <p className="text-gray-600">{currentOrder.address.country}</p>
                            </div>
                        </Card>

                        {/* Order Items */}
                        <Card title="Order Items" className="shadow-sm">
                            <div className="space-y-4">
                                {currentOrder.products.map((product, index) => (
                                    <div key={index} className="flex gap-4 border-b pb-4 last:border-b-0">
                                        <div className="flex-shrink-0 w-20 h-20 bg-gray-100 rounded-lg overflow-hidden">
                                            <img
                                                src={product.productId?.thumbnail || '/placeholder-image.jpg'}
                                                alt={product.productId?.title}
                                                className="w-full h-full object-scale-down"
                                            />
                                        </div>
                                        <div className="flex-1">
                                            <h4 className="font-semibold text-gray-800">
                                                {product.productId?.title || 'Product'}
                                            </h4>
                                            <p className="text-gray-600 text-sm">
                                                Quantity: {product.count}
                                            </p>
                                            <p className="text-gray-600 text-sm">
                                                Price: ₹{product.price} each
                                            </p>
                                            {product.productId?.brand && (
                                                <Tag color="blue" className="text-xs mt-1">
                                                    {product.productId.brand}
                                                </Tag>
                                            )}
                                        </div>
                                        <div className="text-right">
                                            <p className="font-semibold text-green-600">
                                                ₹{(product.price * product.count).toFixed(2)}
                                            </p>
                                        </div>
                                    </div>
                                ))}

                                {/* Price Summary */}
                                <Divider />
                                <div className="space-y-2 text-right">
                                    <div className="flex justify-between max-w-xs ml-auto">
                                        <span className="text-gray-600">Subtotal:</span>
                                        <span>₹{currentOrder.totalPrice?.toFixed(2)}</span>
                                    </div>
                                    {currentOrder.discount > 0 && (
                                        <div className="flex justify-between max-w-xs ml-auto">
                                            <span className="text-gray-600">Discount:</span>
                                            <span className="text-red-600">-₹{currentOrder.discount?.toFixed(2)}</span>
                                        </div>
                                    )}
                                    <div className="flex justify-between max-w-xs ml-auto text-lg font-bold">
                                        <span>Total:</span>
                                        <span className="text-green-600">₹{currentOrder.finalPrice?.toFixed(2)}</span>
                                    </div>
                                </div>
                            </div>
                        </Card>
                    </Col>
                </Row>

                {/* Cancel Order Modal */}
                <Modal
                    title="Cancel Order"
                    open={cancelModalVisible}
                    onOk={handleConfirmCancel}
                    onCancel={handleCancelModal}
                    confirmLoading={cancellingOrder}
                    okText="Yes, Cancel Order"
                    cancelText="Keep Order"
                    okType="danger"
                >
                    {currentOrder && (
                        <div className="space-y-4">
                            <Alert
                                message="Are you sure you want to cancel this order?"
                                description="This action cannot be undone. You may be charged a cancellation fee depending on the order status."
                                type="warning"
                                showIcon
                            />
                            <div className="bg-gray-50 p-4 rounded-lg">
                                <p><strong>Order ID:</strong> {currentOrder._id}</p>
                                <p><strong>Order Date:</strong> {new Date(currentOrder.orderDate).toLocaleDateString()}</p>
                                <p><strong>Total Amount:</strong> ₹{currentOrder.finalPrice}</p>
                                <p><strong>Items:</strong> {currentOrder.products.reduce((total, product) => total + product.count, 0)} item(s)</p>
                                <p><strong>Current Status:</strong> <Tag color={getStatusColor(currentOrder.status)}>{getStatusText(currentOrder.status)}</Tag></p>
                            </div>
                        </div>
                    )}
                </Modal>
            </div>
        </div>
    );
};

export default OrderDetailsPage;