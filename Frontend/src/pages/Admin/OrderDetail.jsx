// components/admin/OrderDetail.jsx
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
    Card,
    Descriptions,
    Button,
    Table,
    Tag,
    Space,
    Modal,
    message,
    Spin,
    Row,
    Col,
    Statistic,
    Timeline,
    Divider,
    Image,
    List,
    Alert
} from 'antd';
import {
    ArrowLeftOutlined,
    EditOutlined,
    DeleteOutlined,
    ShoppingOutlined,
    DollarOutlined,
    UserOutlined,
    PhoneOutlined,
    EnvironmentOutlined,
    FileTextOutlined,
    CheckCircleOutlined,
    CloseCircleOutlined
} from '@ant-design/icons';
import { adminGetOrdersBId, adminDeleteOrder, adminUpdateRefund } from '../../features/admin/adminSlice';

const OrderDetail = () => {
    const { orderId } = useParams();
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const {
        orders,
        isLoading,
        isSuccess,
        message: responseMessage,
        orderDetails
    } = useSelector(state => state.admin);

    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [refundModalVisible, setRefundModalVisible] = useState(false);
    const [refundStatus, setRefundStatus] = useState('');

    useEffect(() => {
        const fetchOrder = async () => {
            try {
                setLoading(true);
                const res = await dispatch(adminGetOrdersBId(orderId)).unwrap();
                setOrder(res);
            } catch (error) {
                message.error(error?.message || "Failed to fetch order");
                navigate("/admin/dashboard/orders");
            } finally {
                setLoading(false);
            }
        };

        fetchOrder();
    }, [orderId]);


    const handleDeleteOrder = () => {
        Modal.confirm({
            title: 'Delete Order',
            content: `Are you sure you want to delete order #${order?._id?.slice(-8)}? This action cannot be undone.`,
            okText: 'Yes, Delete',
            okType: 'danger',
            cancelText: 'Cancel',
            onOk: async () => {
                try {
                    await dispatch(adminDeleteOrder(orderId)).unwrap();
                    message.success('Order deleted successfully');
                    navigate('/admin/dashboard/orders');
                } catch (error) {
                    message.error(error?.message || 'Failed to delete order');
                }
            },
        });
    };

    const handleRefundUpdate = (status) => {
        setRefundStatus(status);
        setRefundModalVisible(true);
    };

    const confirmRefundUpdate = async () => {
        try {
            await dispatch(adminUpdateRefund({
                orderId,
                status: refundStatus
            })).unwrap();

            message.success(`Refund status updated to ${refundStatus}`);
            setRefundModalVisible(false);

            // 🔥 Force reload order after refund update
            const updatedOrder = await dispatch(adminGetOrdersByUserId(orderId)).unwrap();
            setOrder(updatedOrder);

        } catch (error) {
            message.error(error?.message || 'Failed to update refund status');
        }
    };


    const getStatusColor = (status) => {
        switch (status) {
            case 'delivered': return 'green';
            case 'shipped': return 'blue';
            case 'processing': return 'orange';
            case 'pending': return 'yellow';
            case 'cancelled': return 'red';
            case 'refunded': return 'purple';
            default: return 'default';
        }
    };

    const getRefundStatusColor = (status) => {
        switch (status) {
            case 'approved': return 'green';
            case 'pending': return 'orange';
            case 'rejected': return 'red';
            case 'processed': return 'blue';
            default: return 'default';
        }
    };

    const productColumns = [
        {
            title: 'Product',
            dataIndex: 'productId',
            key: 'product',
            render: (product) => (
                <div className="flex items-center">
                    <Image
                        src={product?.thumbnail}
                        alt={product?.title}
                        width={50}
                        height={50}
                        className="rounded mr-3 object-cover"
                        fallback="/placeholder-image.jpg"
                        preview={false}
                    />
                    <div>
                        <div className="font-medium">{product?.title}</div>
                        <div className="text-gray-500 text-sm">{product?.brand}</div>
                    </div>
                </div>
            ),
        },
        {
            title: 'Price',
            dataIndex: 'productId',
            key: 'price',
            render: (product) => `$${product?.price || 0}`,
        },
        {
            title: 'Quantity',
            dataIndex: 'count',
            key: 'quantity',
            render: (count) => <span className="font-semibold">{count}</span>,
        },
        {
            title: 'Total',
            key: 'total',
            render: (_, record) => `$${(record.productId?.price || 0) * (record.count || 0)}`,
        },
    ];

    const orderTimeline = [
        {
            color: 'green',
            children: (
                <div>
                    <p className="font-medium">Order Placed</p>
                    <p className="text-gray-500 text-sm">
                        {order ? new Date(order.createdAt).toLocaleString() : ''}
                    </p>
                </div>
            ),
        },
        {
            color: order?.status === 'processing' || order?.status === 'shipped' || order?.status === 'delivered' ? 'blue' : 'gray',
            children: (
                <div>
                    <p className="font-medium">Processing</p>
                    <p className="text-gray-500 text-sm">
                        {order?.status !== 'pending' ? 'Order is being processed' : 'Pending processing'}
                    </p>
                </div>
            ),
        },
        {
            color: order?.status === 'shipped' || order?.status === 'delivered' ? 'blue' : 'gray',
            children: (
                <div>
                    <p className="font-medium">Shipped</p>
                    <p className="text-gray-500 text-sm">
                        {order?.status === 'shipped' || order?.status === 'delivered' ? 'Order has been shipped' : 'Not shipped yet'}
                    </p>
                </div>
            ),
        },
        {
            color: order?.status === 'delivered' ? 'green' : 'gray',
            children: (
                <div>
                    <p className="font-medium">Delivered</p>
                    <p className="text-gray-500 text-sm">
                        {order?.status === 'delivered' ? 'Order has been delivered' : 'Not delivered yet'}
                    </p>
                </div>
            ),
        },
    ];

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <Spin size="large" />
            </div>
        );
    }

    if (!order) {
        return (
            <div className="text-center py-8">
                <Alert
                    message="Order Not Found"
                    description="The order you are looking for does not exist or has been deleted."
                    type="error"
                    showIcon
                />
                <Button
                    onClick={() => navigate('/admin/dashboard/orders')}
                    className="mt-4"
                >
                    Back to Orders
                </Button>
            </div>
        );
    }

    return (
        <div>
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center">
                    <Button
                        icon={<ArrowLeftOutlined />}
                        onClick={() => navigate('/admin/dashboard/orders')}
                        className="mr-4"
                    >
                        Back
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800">
                            Order #{order._id?.slice(-8)}
                        </h1>
                        <p className="text-gray-600">Order details and management</p>
                    </div>
                </div>

                <Space>
                    {/* <Button
                        icon={<EditOutlined />}
                        onClick={() => navigate(`/admin/dashboard/orders/edit/${orderId}`)}
                    >
                        Edit Order
                    </Button> */}
                    <Button
                        danger
                        icon={<DeleteOutlined />}
                        onClick={handleDeleteOrder}
                    >
                        Delete Order
                    </Button>
                </Space>
            </div>

            <Row gutter={[24, 24]}>
                {/* Order Summary */}
                <Col xs={24} lg={8}>
                    <Row gutter={[16, 16]}>
                        <Col xs={12}>
                            <Card>
                                <Statistic
                                    title="Total Amount"
                                    value={order.finalPrice || 0}
                                    prefix={<DollarOutlined />}
                                    valueStyle={{ color: '#3f8600' }}
                                    precision={2}
                                />
                            </Card>
                        </Col>
                        <Col xs={12}>
                            <Card>
                                <Statistic
                                    title="Items"
                                    value={order.products?.length || 0}
                                    prefix={<ShoppingOutlined />}
                                    valueStyle={{ color: '#1890ff' }}
                                />
                            </Card>
                        </Col>
                        <Col xs={24}>
                            <Card title="Order Status">
                                <div className="text-center">
                                    <Tag
                                        color={getStatusColor(order.status)}
                                        className="text-lg px-4 py-1"
                                    >
                                        {order.status?.toUpperCase()}
                                    </Tag>
                                </div>
                            </Card>
                        </Col>
                        {order.refundStatus && (
                            <Col xs={24}>
                                <Card title="Refund Status">
                                    <div className="text-center">
                                        <Tag
                                            color={getRefundStatusColor(order.refundStatus)}
                                            className="text-lg px-4 py-1"
                                        >
                                            {order.refundStatus?.toUpperCase()}
                                        </Tag>
                                        <div className="mt-3 space-y-2">
                                            <Button
                                                type="primary"
                                                size="small"
                                                icon={<CheckCircleOutlined />}
                                                onClick={() => handleRefundUpdate('approved')}
                                                disabled={order.refundStatus === 'approved'}
                                            >
                                                Approve
                                            </Button>
                                            <Button
                                                danger
                                                size="small"
                                                icon={<CloseCircleOutlined />}
                                                onClick={() => handleRefundUpdate('rejected')}
                                                disabled={order.refundStatus === 'rejected'}
                                                className="ml-2"
                                            >
                                                Reject
                                            </Button>
                                        </div>
                                    </div>
                                </Card>
                            </Col>
                        )}
                    </Row>
                </Col>

                {/* Order Information */}
                <Col xs={24} lg={16}>
                    <Card title="Order Information" className="mb-6">
                        <Descriptions column={{ xs: 1, sm: 2 }} bordered>
                            <Descriptions.Item label="Order ID">
                                #{order._id?.slice(-8)}
                            </Descriptions.Item>
                            <Descriptions.Item label="Order Date">
                                {new Date(order.orderDate || order.createdAt).toLocaleString()}
                            </Descriptions.Item>
                            <Descriptions.Item label="Customer">
                                <div style={{ whiteSpace: "nowrap" }}>
                                    {order.user?.name || "N/A"}
                                </div>
                            </Descriptions.Item>
                            <Descriptions.Item label="Customer Email">
                                <div style={{ whiteSpace: "nowrap" }}>
                                    {order.user?.email || "N/A"}
                                </div>
                            </Descriptions.Item>
                            <Descriptions.Item label="Payment Method">
                                {order.paymentMethod || 'N/A'}
                            </Descriptions.Item>
                        </Descriptions>
                    </Card>

                    {/* Shipping Information */}
                    <Card title="Shipping Information" className="mb-6">
                        <Descriptions column={1} bordered>
                            <Descriptions.Item label="Shipping Address">
                                <div className="flex items-start">
                                    <EnvironmentOutlined className="mr-2 mt-1" />
                                    <div>
                                        <div>{order.address?.street}</div>
                                        <div>{order.address?.city}, {order.address?.state}</div>
                                        <div>{order.address?.zipCode}, {order.address?.country}</div>
                                    </div>
                                </div>
                            </Descriptions.Item>
                            <Descriptions.Item label="Contact">
                                <div className="flex items-center">
                                    <PhoneOutlined className="mr-2" />
                                    {order.user?.phone || 'N/A'}
                                </div>
                            </Descriptions.Item>
                        </Descriptions>
                    </Card>
                </Col>

                {/* Order Timeline */}
                <Col xs={24} lg={12}>
                    <Card title="Order Timeline">
                        <Timeline items={orderTimeline} />
                    </Card>
                </Col>

                {/* Order Items */}
                <Col xs={24} lg={12}>
                    <Card title="Order Items">
                        <Table
                            columns={productColumns}
                            dataSource={order.products || []}
                            rowKey={(record) => `${record.productId?._id}-${record.count}`}
                            pagination={false}
                            summary={(pageData) => {
                                const total = pageData.reduce((sum, item) => {
                                    return sum + (item.productId?.price || 0) * (item.count || 0);
                                }, 0);

                                return (
                                    <Table.Summary>
                                        <Table.Summary.Row>
                                            <Table.Summary.Cell index={0} colSpan={3}>
                                                <strong>Total</strong>
                                            </Table.Summary.Cell>
                                            <Table.Summary.Cell index={1}>
                                                <strong>${total.toFixed(2)}</strong>
                                            </Table.Summary.Cell>
                                        </Table.Summary.Row>
                                    </Table.Summary>
                                );
                            }}
                        />
                    </Card>
                </Col>

                {/* Order Notes */}
                {order.notes && (
                    <Col xs={24}>
                        <Card title="Order Notes">
                            <div className="p-4 bg-gray-50 rounded">
                                <FileTextOutlined className="mr-2" />
                                {order.notes}
                            </div>
                        </Card>
                    </Col>
                )}
            </Row>

            {/* Refund Update Modal */}
            <Modal
                title="Update Refund Status"
                open={refundModalVisible}
                onOk={confirmRefundUpdate}
                onCancel={() => setRefundModalVisible(false)}
                okText="Update"
                cancelText="Cancel"
            >
                <p>Are you sure you want to update the refund status to:</p>
                <p className="font-semibold text-lg text-center my-4">
                    <Tag color={getRefundStatusColor(refundStatus)} className="text-lg px-4 py-1">
                        {refundStatus?.toUpperCase()}
                    </Tag>
                </p>
                <p className="text-gray-600">
                    This action will notify the customer about the refund status update.
                </p>
            </Modal>
        </div>
    );
};

export default OrderDetail;