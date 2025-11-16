// components/admin/OrdersManagement.jsx
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
    Card,
    Table,
    Button,
    Tag,
    Space,
    Input,
    Select,
    Modal,
    message,
    DatePicker
} from 'antd';
import {
    EyeOutlined,
    EditOutlined,
    DeleteOutlined,
    SearchOutlined,
    FilterOutlined
} from '@ant-design/icons';
import { adminGetAllOrders, adminDeleteOrder } from '../../features/admin/adminSlice';

const { Search } = Input;
const { Option } = Select;
const { RangePicker } = DatePicker;

const OrdersManagement = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const { orders, isLoading } = useSelector(state => state.admin);

    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [searchText, setSearchText] = useState('');
    const [statusFilter, setStatusFilter] = useState('');

    useEffect(() => {
        dispatch(adminGetAllOrders({ page: currentPage, limit: pageSize }));
    }, [dispatch, currentPage, pageSize]);

    const handleViewOrder = (orderId) => {
        navigate(`/admin/dashboard/orders/${orderId}`);
    };

    const handleDeleteOrder = (order) => {
        Modal.confirm({
            title: 'Delete Order',
            content: `Are you sure you want to delete order #${order._id}? This action cannot be undone.`,
            okText: 'Yes, Delete',
            okType: 'danger',
            cancelText: 'Cancel',
            onOk: async () => {
                try {
                    await dispatch(adminDeleteOrder(order._id)).unwrap();
                    message.success('Order deleted successfully');
                } catch (error) {
                    message.error(error || 'Failed to delete order');
                }
            },
        });
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'delivered': return 'green';
            case 'shipped': return 'blue';
            case 'pending': return 'orange';
            case 'cancelled': return 'red';
            case 'refunded': return 'purple';
            default: return 'default';
        }
    };

    const filteredOrders = orders.filter(order => {
        const matchesSearch = order._id.toLowerCase().includes(searchText.toLowerCase()) ||
            order.user?.name?.toLowerCase().includes(searchText.toLowerCase());
        const matchesStatus = !statusFilter || order.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

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
                    {products.slice(0, 2).map((product, index) => (
                        <div key={index} className="text-sm">
                            {product.count} × {product.productId?.title || 'Product'}
                        </div>
                    ))}
                    {products.length > 2 && (
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
            filters: [
                { text: 'Pending', value: 'pending' },
                { text: 'Shipped', value: 'shipped' },
                { text: 'Delivered', value: 'delivered' },
                { text: 'Cancelled', value: 'cancelled' },
            ],
            onFilter: (value, record) => record.status === value,
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
                        onClick={() => handleViewOrder(record._id)}
                    >
                        View
                    </Button>
                    <Button
                        size="small"
                        danger
                        icon={<DeleteOutlined />}
                        onClick={() => handleDeleteOrder(record)}
                    >
                        Delete
                    </Button>
                </Space>
            ),
        },
    ];

    return (
        <div>
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Orders Management</h1>
                    <p className="text-gray-600">Manage all orders in the system</p>
                </div>
            </div>

            {/* Filters */}
            <Card className="mb-6">
                <div className="flex flex-col md:flex-row md:items-center gap-4">
                    <div className="flex-1">
                        <Search
                            placeholder="Search orders by ID or customer..."
                            allowClear
                            enterButton={<SearchOutlined />}
                            size="large"
                            value={searchText}
                            onChange={(e) => setSearchText(e.target.value)}
                        />
                    </div>
                    <Select
                        placeholder="Filter by status"
                        allowClear
                        style={{ width: 200 }}
                        size="large"
                        value={statusFilter}
                        onChange={setStatusFilter}
                        suffixIcon={<FilterOutlined />}
                    >
                        <Option value="pending">Pending</Option>
                        <Option value="shipped">Shipped</Option>
                        <Option value="delivered">Delivered</Option>
                        <Option value="cancelled">Cancelled</Option>
                    </Select>
                    <RangePicker style={{ width: 250 }} size="large" />
                </div>
            </Card>

            {/* Orders Table */}
            <Card>
                <Table
                    columns={columns}
                    dataSource={filteredOrders}
                    rowKey="_id"
                    loading={isLoading}
                    pagination={{
                        current: currentPage,
                        pageSize: pageSize,
                        total: orders.length,
                        showSizeChanger: true,
                        showQuickJumper: true,
                        onChange: (page, size) => {
                            setCurrentPage(page);
                            setPageSize(size);
                        },
                    }}
                    scroll={{ x: 1000 }}
                />
            </Card>
        </div>
    );
};

export default OrdersManagement;