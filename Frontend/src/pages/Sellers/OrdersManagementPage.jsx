// pages/seller/OrdersManagementPage.jsx
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
    Card,
    Table,
    Tag,
    Button,
    Select,
    Space,
    Modal,
    message,
    Row,
    Col,
    Statistic,
    DatePicker,
    Input
} from 'antd';
import {
    EyeOutlined,
    CheckCircleOutlined,
    TruckOutlined,
    SearchOutlined,
    FilterOutlined
} from '@ant-design/icons';
import { getMyOrders, updateOrderStatus } from '../../features/seller/sellerSlice';

const { Option } = Select;
const { Search } = Input;
const { RangePicker } = DatePicker;

const OrdersManagementPage = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const { orders, isLoading } = useSelector(state => state.seller);

    const [statusFilter, setStatusFilter] = useState('');
    const [searchText, setSearchText] = useState('');

    useEffect(() => {
        dispatch(getMyOrders({ page: 1, limit: 50 }));
    }, [dispatch]);

    const handleUpdateStatus = async (orderId, newStatus) => {
        try {
            await dispatch(updateOrderStatus({ orderId, status: newStatus })).unwrap();
            message.success(`Order status updated to ${newStatus}`);
        } catch (error) {
            message.error(error || 'Failed to update order status');
        }
    };

    const handleViewOrder = (orderId) => {
        navigate(`/seller/orders/${orderId}`);
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'pending': return 'orange';
            case 'confirmed': return 'blue';
            case 'shipped': return 'cyan';
            case 'delivered': return 'green';
            case 'cancelled': return 'red';
            default: return 'default';
        }
    };

    const filteredOrders = orders.filter(order => {
        const matchesSearch = order._id.toLowerCase().includes(searchText.toLowerCase()) ||
            order.user?.name?.toLowerCase().includes(searchText.toLowerCase());
        const matchesStatus = !statusFilter || order.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const statusOptions = [
        { value: 'pending', label: 'Pending', color: 'orange' },
        { value: 'confirmed', label: 'Confirmed', color: 'blue' },
        { value: 'shipped', label: 'Shipped', color: 'cyan' },
        { value: 'delivered', label: 'Delivered', color: 'green' },
        { value: 'cancelled', label: 'Cancelled', color: 'red' },
    ];

    const nextStatusMap = {
        pending: ['confirmed', 'cancelled'],
        confirmed: ['shipped', 'cancelled'],
        shipped: ['delivered'],
        delivered: [],
        cancelled: [],
    };

    const columns = [
        {
            title: 'Order ID',
            dataIndex: '_id',
            key: '_id',
            render: (id) => `#${id.slice(-8)}`,
        },
        {
            title: 'Customer',
            dataIndex: 'user',
            key: 'user',
            render: (user) => user?.name || 'N/A',
        },
        {
            title: 'Products',
            dataIndex: 'products',
            key: 'products',
            render: (products) => (
                <div>
                    {products?.slice(0, 2).map((product, index) => (
                        <div key={index} className="text-sm">
                            {product.count} × {product.productId?.title || 'Product'}
                        </div>
                    ))}
                    {products?.length > 2 && (
                        <div className="text-sm text-gray-500">
                            +{products.length - 2} more
                        </div>
                    )}
                </div>
            ),
        },
        {
            title: 'Amount',
            dataIndex: 'finalPrice',
            key: 'finalPrice',
            render: (price) => `$${price}`,
            sorter: (a, b) => a.finalPrice - b.finalPrice,
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            render: (status) => (
                <Tag color={getStatusColor(status)}>
                    {status.toUpperCase()}
                </Tag>
            ),
        },
        {
            title: 'Order Date',
            dataIndex: 'orderDate',
            key: 'orderDate',
            render: (date) => new Date(date).toLocaleDateString(),
            sorter: (a, b) => new Date(a.orderDate) - new Date(b.orderDate),
        },
        {
            title: 'Actions',
            key: 'actions',
            render: (_, record) => (
                <Space size="small">
                    <Button
                        size="small"
                        icon={<EyeOutlined />}
                        onClick={() => navigate(`/seller/orders/${record._id}`)}
                    >
                        View
                    </Button>

                    {nextStatusMap[record.status]?.map(status => (
                        <Button
                            key={status}
                            size="small"
                            type={status === 'delivered' ? 'primary' : 'default'}
                            icon={status === 'delivered' ? <CheckCircleOutlined /> : <TruckOutlined />}
                            onClick={() => handleUpdateStatus(record._id, status)}
                        >
                            {status.charAt(0).toUpperCase() + status.slice(1)}
                        </Button>
                    ))}
                </Space>
            ),
        },
    ];

    const orderStats = {
        total: orders.length,
        pending: orders.filter(o => o.status === 'pending').length,
        delivered: orders.filter(o => o.status === 'delivered').length,
        revenue: orders.filter(o => o.status === 'delivered')
            .reduce((sum, order) => sum + order.finalPrice, 0)
    };

    return (
        <div>
            {/* Header */}
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-800">Orders Management</h1>
                <p className="text-gray-600">Manage and track your customer orders</p>
            </div>

            {/* Statistics */}
            <Row gutter={[16, 16]} className="mb-6">
                <Col xs={12} sm={6}>
                    <Card>
                        <Statistic
                            title="Total Orders"
                            value={orderStats.total}
                            valueStyle={{ color: '#1890ff' }}
                        />
                    </Card>
                </Col>
                <Col xs={12} sm={6}>
                    <Card>
                        <Statistic
                            title="Pending Orders"
                            value={orderStats.pending}
                            valueStyle={{ color: '#faad14' }}
                        />
                    </Card>
                </Col>
                <Col xs={12} sm={6}>
                    <Card>
                        <Statistic
                            title="Delivered"
                            value={orderStats.delivered}
                            valueStyle={{ color: '#52c41a' }}
                        />
                    </Card>
                </Col>
                <Col xs={12} sm={6}>
                    <Card>
                        <Statistic
                            title="Total Revenue"
                            value={orderStats.revenue}
                            prefix="$"
                            valueStyle={{ color: '#722ed1' }}
                        />
                    </Card>
                </Col>
            </Row>

            {/* Filters */}
            <Card className="mb-6">
                <Row gutter={[16, 16]} align="middle">
                    <Col xs={24} md={8}>
                        <Search
                            placeholder="Search orders..."
                            allowClear
                            enterButton={<SearchOutlined />}
                            size="large"
                            value={searchText}
                            onChange={(e) => setSearchText(e.target.value)}
                        />
                    </Col>
                    <Col xs={24} md={6}>
                        <Select
                            placeholder="Filter by status"
                            allowClear
                            style={{ width: '100%' }}
                            size="large"
                            value={statusFilter}
                            onChange={setStatusFilter}
                            suffixIcon={<FilterOutlined />}
                        >
                            {statusOptions.map(option => (
                                <Option key={option.value} value={option.value}>
                                    <Tag color={option.color}>{option.label}</Tag>
                                </Option>
                            ))}
                        </Select>
                    </Col>
                    <Col xs={24} md={6}>
                        <RangePicker style={{ width: '100%' }} size="large" />
                    </Col>
                    <Col xs={24} md={4} className="text-right">
                        <span className="text-gray-600">
                            {filteredOrders.length} orders
                        </span>
                    </Col>
                </Row>
            </Card>

            {/* Orders Table */}
            <Card>
                <Table
                    columns={columns}
                    dataSource={filteredOrders}
                    rowKey="_id"
                    loading={isLoading}
                    scroll={{ x: 1000 }}
                    pagination={{
                        pageSize: 10,
                        showSizeChanger: true,
                        showQuickJumper: true,
                    }}
                />
            </Card>
        </div>
    );
};

export default OrdersManagementPage;