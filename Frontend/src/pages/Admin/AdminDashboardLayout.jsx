// layouts/AdminDashboardLayout.jsx
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
    TeamOutlined,
    ShoppingOutlined,
    FileTextOutlined,
    BarChartOutlined,
    UserOutlined,
    LogoutOutlined,
    MenuFoldOutlined,
    MenuUnfoldOutlined,
    SettingOutlined,
    ShopOutlined
} from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../../features/auth/authSlice';

const { Header, Sider, Content } = Layout;
const { Text } = Typography;

const AdminDashboardLayout = () => {
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
            key: '/admin/dashboard',
            icon: <DashboardOutlined />,
            label: 'Dashboard',
        },
        {
            key: '/admin/dashboard/users',
            icon: <TeamOutlined />,
            label: 'Users Management',
        },
        {
            key: '/admin/dashboard/products',
            icon: <ShoppingOutlined />,
            label: 'Products Management',
        },
        {
            key: '/admin/dashboard/sellers',
            icon: <ShopOutlined />,
            label: 'Sellers Management',
        },
        {
            key: '/admin/dashboard/orders',
            icon: <FileTextOutlined />,
            label: 'Orders Management',
        },
        {
            key: '/admin/dashboard/analytics',
            icon: <BarChartOutlined />,
            label: 'Analytics',
        },
        {
            key: '/admin/dashboard/settings',
            icon: <SettingOutlined />,
            label: 'Settings',
        },
    ];

    return (
        <Layout style={{ minHeight: '100vh' }}>
            {/* Sidebar */}
            <Sider
                trigger={null}
                collapsible
                collapsed={collapsed}
                width={280}
                style={{
                    background: colorBgContainer,
                    boxShadow: '2px 0 8px rgba(0,0,0,0.1)',
                }}
            >
                {/* Logo */}
                <div className="flex items-center justify-center p-4 border-b">
                    <DashboardOutlined className="text-2xl text-blue-600 mr-2" />
                    {!collapsed && (
                        <Text strong className="text-lg">Admin Panel</Text>
                    )}
                </div>

                {/* Navigation Menu */}
                <Menu
                    mode="inline"
                    selectedKeys={[location.pathname]}
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
                            Admin Dashboard
                        </Text>
                    </div>

                    <Space size="middle">
                        {/* Notifications */}
                        <Badge count={5} size="small">
                            <Button type="text" icon={<FileTextOutlined />} />
                        </Badge>

                        {/* User Profile */}
                        <Dropdown menu={profileMenu} placement="bottomRight">
                            <Space className="cursor-pointer">
                                <Avatar
                                    size="small"
                                    src={user?.avatar?.url}
                                    icon={<UserOutlined />}
                                />
                                <div className="hidden md:block">
                                    <Text strong>{user?.name}</Text>
                                    <br />
                                    <Text type="secondary" className="text-xs">Administrator</Text>
                                </div>
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

export default AdminDashboardLayout;