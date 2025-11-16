// components/admin/UsersManagement.jsx
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
    Badge,
    Avatar
} from 'antd';
import {
    EyeOutlined,
    EditOutlined,
    DeleteOutlined,
    SearchOutlined,
    UserOutlined
} from '@ant-design/icons';
import { adminGetAllUsers } from '../../features/admin/adminSlice';

const { Search } = Input;
const { Option } = Select;

const UsersManagement = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const { users, isLoading } = useSelector(state => state.admin);

    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [searchText, setSearchText] = useState('');
    const [roleFilter, setRoleFilter] = useState('');

    useEffect(() => {
        dispatch(adminGetAllUsers({ page: currentPage, limit: pageSize }));
    }, [dispatch, currentPage, pageSize]);

    const handleViewUser = (userId) => {
        navigate(`/admin/dashboard/users/${userId}`);
    };

    const handleEditUser = (userId) => {
        // Implement edit user functionality
        message.info('Edit user functionality to be implemented');
    };

    const handleDeleteUser = (user) => {
        Modal.confirm({
            title: 'Delete User',
            content: `Are you sure you want to delete user "${user.name}"? This action cannot be undone.`,
            okText: 'Yes, Delete',
            okType: 'danger',
            cancelText: 'Cancel',
            onOk: async () => {
                // Implement delete user functionality
                message.success('User deleted successfully');
            },
        });
    };

    const getRoleColor = (role) => {
        switch (role) {
            case 'admin': return 'red';
            case 'seller': return 'blue';
            case 'user': return 'green';
            default: return 'default';
        }
    };

    const getStatusColor = (status) => {
        return status === 'active' ? 'green' : 'red';
    };

    const filteredUsers = users.filter(user => {
        const matchesSearch = user.name.toLowerCase().includes(searchText.toLowerCase()) ||
            user.email.toLowerCase().includes(searchText.toLowerCase());
        const matchesRole = !roleFilter || user.role === roleFilter;
        return matchesSearch && matchesRole;
    });

    const columns = [
        {
            title: 'User',
            dataIndex: 'name',
            key: 'user',
            render: (name, record) => (
                <div className="flex items-center">
                    <Avatar
                        src={record.avatar?.url}
                        icon={<UserOutlined />}
                        className="mr-3"
                    />
                    <div>
                        <div className="font-medium">{name}</div>
                        <div className="text-gray-500 text-sm">{record.email}</div>
                    </div>
                </div>
            ),
        },
        {
            title: 'Role',
            dataIndex: 'role',
            key: 'role',
            render: (role) => (
                <Tag color={getRoleColor(role)}>
                    {role.toUpperCase()}
                </Tag>
            ),
            filters: [
                { text: 'Admin', value: 'admin' },
                { text: 'Seller', value: 'seller' },
                { text: 'User', value: 'user' },
            ],
            onFilter: (value, record) => record.role === value,
        },
        {
            title: 'Joined Date',
            dataIndex: 'createdAt',
            key: 'createdAt',
            render: (date) => new Date(date).toLocaleDateString(),
            sorter: (a, b) => new Date(a.createdAt) - new Date(b.createdAt),
        },
        {
            title: 'Orders',
            dataIndex: 'ordersCount',
            key: 'orders',
            render: (count) => count || 0,
            sorter: (a, b) => (a.ordersCount || 0) - (b.ordersCount || 0),
        },
        {
            title: 'Actions',
            key: 'actions',
            render: (_, record) => (
                <Space size="small">
                    <Button
                        size="small"
                        icon={<EyeOutlined />}
                        onClick={() => handleViewUser(record._id)}
                    >
                        View
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
                    <h1 className="text-2xl font-bold text-gray-800">Users Management</h1>
                    <p className="text-gray-600">Manage all users in the system</p>
                </div>
            </div>

            {/* Filters */}
            <Card className="mb-6">
                <div className="flex flex-col md:flex-row md:items-center gap-4">
                    <div className="flex-1">
                        <Search
                            placeholder="Search users by name or email..."
                            allowClear
                            enterButton={<SearchOutlined />}
                            size="large"
                            value={searchText}
                            onChange={(e) => setSearchText(e.target.value)}
                        />
                    </div>
                    <Select
                        placeholder="Filter by role"
                        allowClear
                        style={{ width: 200 }}
                        size="large"
                        value={roleFilter}
                        onChange={setRoleFilter}
                    >
                        <Option value="admin">Admin</Option>
                        <Option value="seller">Seller</Option>
                        <Option value="user">User</Option>
                    </Select>
                </div>
            </Card>

            {/* Users Table */}
            <Card>
                <Table
                    columns={columns}
                    dataSource={filteredUsers}
                    rowKey="_id"
                    loading={isLoading}
                    pagination={{
                        current: currentPage,
                        pageSize: pageSize,
                        total: users.length,
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

export default UsersManagement;