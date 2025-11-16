import React, { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
    Layout,
    Menu,
    Button,
    Avatar,
    Dropdown,
    Badge,
    theme,
    Space,
    Typography
} from 'antd';
import {
    DashboardOutlined,
    ShoppingOutlined,
    FileTextOutlined,
    BarChartOutlined,
    UserOutlined,
    LogoutOutlined,
    MenuFoldOutlined,
    MenuUnfoldOutlined,
    PlusOutlined
} from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../../features/auth/authSlice';

const { Header, Sider, Content } = Layout;
const { Text } = Typography;

const SellerDashboardLayout = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const location = useLocation();
    const { user } = useSelector(state => state.auth);

    const [collapsed, setCollapsed] = useState(false);
    const {
        token: { colorBgContainer, borderRadiusLG },
    } = theme.useToken();

    const handleLogout = () => {
        dispatch(logout());
        navigate('/login');
    };

    const handleCreateProduct = () => {
        navigate('/seller/products/create');
    };

    const profileMenu = {
        items: [
            {
                key: 'profile',
                icon: <UserOutlined />,
                label: 'My Profile',
                onClick: () => navigate('/profile'),
            },
            {
                type: 'divider',
            },
            {
                key: 'logout',
                icon: <LogoutOutlined />,
                label: 'Logout',
                danger: true,
                onClick: handleLogout,
            },
        ],
    };

    const menuItems = [
        {
            key: '/seller/dashboard',
            icon: <DashboardOutlined />,
            label: 'Dashboard',
        },
        {
            key: '/seller/products',
            icon: <ShoppingOutlined />,
            label: 'Products',
            children: [
                {
                    key: '/seller/products/all',
                    label: 'All Products',
                },
                {
                    key: '/seller/products/create',
                    label: 'Add New Product',
                },
            ],
        },
        {
            key: '/seller/orders',
            icon: <FileTextOutlined />,
            label: 'Orders',
        },
        {
            key: '/seller/analytics',
            icon: <BarChartOutlined />,
            label: 'Analytics',
        },
    ];

    return (
        <Layout style={{ minHeight: '100vh' }}>
            {/* Sidebar */}
            <Sider
                trigger={null}
                collapsible
                collapsed={collapsed}
                width={250}
                style={{
                    background: colorBgContainer,
                    boxShadow: '2px 0 8px rgba(0,0,0,0.1)',
                }}
            >
                {/* Logo */}
                <div className="flex items-center justify-center p-4 border-b">
                    <ShoppingOutlined className="text-2xl text-blue-600 mr-2" />
                    {!collapsed && (
                        <Text strong className="text-lg">Seller Center</Text>
                    )}
                </div>

                {/* Navigation Menu */}
                <Menu
                    mode="inline"
                    selectedKeys={[location.pathname]}
                    defaultOpenKeys={['/seller/dashboard/products']}
                    items={menuItems}
                    onClick={({ key }) => navigate(key)}
                    style={{ border: 'none', marginTop: '8px' }}
                />
            </Sider>

            <Layout>
                {/* Header */}
                <Header
                    style={{
                        padding: '0 24px',
                        background: colorBgContainer,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        boxShadow: '0 1px 4px rgba(0,0,0,0.1)',
                    }}
                >
                    <div className="flex items-center">
                        <Button
                            type="text"
                            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
                            onClick={() => setCollapsed(!collapsed)}
                            style={{ fontSize: '16px', width: 64, height: 64 }}
                        />
                        <Text strong className="text-lg ml-4">
                            Seller Dashboard
                        </Text>
                    </div>

                    <Space size="middle">
                        {/* Add Product Button */}
                        <Button
                            type="primary"
                            icon={<PlusOutlined />}
                            onClick={handleCreateProduct}
                        >
                            Add Product
                        </Button>

                        {/* Notifications
                        <Badge count={5} size="small">
                            <Button type="text" icon={<FileTextOutlined />} />
                        </Badge> */}

                        {/* User Profile */}
                        <Dropdown menu={profileMenu} placement="bottomRight">
                            <Space className="cursor-pointer">
                                <Avatar
                                    size="small"
                                    src={user?.avatar?.url}
                                    icon={<UserOutlined />}
                                />
                                <Text strong>{user?.name}</Text>
                            </Space>
                        </Dropdown>
                    </Space>
                </Header>

                {/* Main Content */}
                <Content
                    style={{
                        margin: '24px',
                        padding: 24,
                        minHeight: 280,
                        background: colorBgContainer,
                        borderRadius: borderRadiusLG,
                        overflow: 'auto',
                    }}
                >
                    <Outlet />
                </Content>
            </Layout>
        </Layout>
    );
};

export default SellerDashboardLayout;