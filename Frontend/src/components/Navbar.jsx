// src/components/Navbar.jsx
import React, { useState } from 'react';
import {
  Layout,
  Menu,
  Badge,
  Dropdown,
  Avatar,
  Button,
  Drawer,
  Input
} from 'antd';
import {
  ShoppingCartOutlined,
  UserOutlined,
  LogoutOutlined,
  ProfileOutlined,
  AppstoreOutlined,
  MenuOutlined,
  DashboardOutlined,
  SearchOutlined
} from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../features/auth/authSlice';

const { Header } = Layout;
const { Search } = Input;

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();

  const { user, isAuthenticated, cart } = useSelector((state) => state.auth);
  const cartItems = cart && cart.length;

  const [mobileMenuVisible, setMobileMenuVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const handleSearch = (value) => {
    if (value.trim()) {
      navigate(`/search?q=${encodeURIComponent(value.trim())}`);
      setSearchQuery(''); // Clear search after submitting
    }
  };

  // Profile dropdown
  const profileMenu = {
    items: [
      {
        key: 'profile',
        icon: <ProfileOutlined />,
        label: 'My Profile',
        onClick: () => navigate('/profile'),
      },
      {
        key: 'dashboard',
        icon: <DashboardOutlined />,
        label:
          user?.role === 'admin'
            ? 'Admin Dashboard'
            : user?.role === 'seller'
              ? 'Seller Dashboard'
              : 'My Orders',
        onClick: () => {
          if (user?.role === 'admin') navigate('/admin/dashboard');
          else if (user?.role === 'seller') navigate('/seller/dashboard');
          else navigate('/orders');
        },
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
      key: '/',
      label: 'Home',
      onClick: () => navigate('/'),
    },
    {
      key: '/products',
      label: 'All Products',
      icon: <AppstoreOutlined />,
      onClick: () => navigate('/products'),
    },
  ];

  return (
    <Header className="sticky top-0 z-50 w-full bg-[#001529] shadow-md flex items-center justify-between px-4 md:px-8">
      {/* Logo */}
      <div
        className="text-white text-2xl font-bold flex items-center cursor-pointer"
        onClick={() => navigate('/')}
      >
        <ShoppingCartOutlined style={{ marginRight: '8px', fontSize: '24px' }} />
        E-Shop
      </div>

      {/* Search Bar with Button */}
      <div className="hidden md:flex flex-1 justify-center px-8">
        <Search
          size="large"
          placeholder="Search products..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onSearch={handleSearch}
          enterButton={<SearchOutlined />}
          className="max-w-md"
        />
      </div>

      {/* Desktop Right Section */}
      <div className="hidden md:flex items-center gap-6">
        {/* Cart */}
        <Badge count={cartItems} showZero>
          <Button
            type="text"
            icon={<ShoppingCartOutlined style={{ fontSize: '20px', color: 'white' }} />}
            onClick={() => navigate('/cart')}
          />
        </Badge>

        {/* Auth */}
        {isAuthenticated ? (
          <Dropdown menu={profileMenu} trigger={['click']} placement="bottomRight">
            <div className="flex items-center cursor-pointer">
              <Avatar
                style={{ backgroundColor: '#87d068' }}
                icon={<UserOutlined />}
              >
                {user?.name?.charAt(0).toUpperCase()}
              </Avatar>
              <span className="text-white ml-2 font-medium">{user?.name}</span>
            </div>
          </Dropdown>
        ) : (
          <div className="flex gap-2">
            <Button onClick={() => navigate('/login')}>Login</Button>
            <Button type="primary" onClick={() => navigate('/signup')}>
              Sign Up
            </Button>
          </div>
        )}
      </div>

      {/* Mobile Menu Button */}
      <div className="flex md:hidden">
        <button
          onClick={() => setMobileMenuVisible(true)}
          className="p-2 rounded-md hover:bg-[#112240] transition"
        >
          <MenuOutlined style={{ fontSize: '20px', color: 'white' }} />
        </button>
      </div>

      {/* Mobile Drawer */}
      <Drawer
        title={
          <div className="flex items-center gap-2">
            <ShoppingCartOutlined />
            <span className="font-bold">E-Shop</span>
          </div>
        }
        placement="right"
        onClose={() => setMobileMenuVisible(false)}
        open={mobileMenuVisible}
      >
        <div className="mb-4">
          <Search
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onSearch={(value) => {
              handleSearch(value);
              setMobileMenuVisible(false);
            }}
            enterButton={<SearchOutlined />}
          />
        </div>

        <Menu
          mode="vertical"
          selectedKeys={[location.pathname]}
          items={[
            ...menuItems,
            {
              key: 'cart',
              label: `Cart (${cartItems})`,
              icon: <ShoppingCartOutlined />,
              onClick: () => {
                navigate('/cart');
                setMobileMenuVisible(false);
              },
            },
            ...(isAuthenticated
              ? [
                { type: 'divider' },
                {
                  key: 'logout',
                  icon: <LogoutOutlined />,
                  label: 'Logout',
                  danger: true,
                  onClick: () => {
                    handleLogout();
                    setMobileMenuVisible(false);
                  },
                },
              ]
              : [
                { type: 'divider' },
                {
                  key: 'login',
                  label: 'Login',
                  onClick: () => {
                    navigate('/login');
                    setMobileMenuVisible(false);
                  },
                },
                {
                  key: 'signup',
                  label: 'Sign Up',
                  onClick: () => {
                    navigate('/signup');
                    setMobileMenuVisible(false);
                  },
                },
              ]),
          ]}
        />
      </Drawer>
    </Header>
  );
};

export default Navbar;