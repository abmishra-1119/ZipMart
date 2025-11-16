// pages/seller/AnalyticsPage.jsx
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
    Row,
    Col,
    Card,
    Statistic,
    Table,
    Tag,
    Progress,
    List,
    Avatar,
    Space,
    DatePicker,
    Select,
    Button,
    Spin,
    Alert
} from 'antd';
import {
    DollarOutlined,
    ShoppingOutlined,
    UserOutlined,
    RiseOutlined,
    FallOutlined,
    StarOutlined,
    ReloadOutlined,
    FilterOutlined
} from '@ant-design/icons';
import {
    getTotalRevenue,
    getTopSellingProducts,
    getMyOrders
} from '../../features/seller/sellerSlice';

const { Option } = Select;
const { RangePicker } = DatePicker;

const AnalyticsPage = () => {
    const dispatch = useDispatch();

    const {
        totalRevenue,
        topSelling,
        orders,
        isLoading
    } = useSelector(state => state.seller);

    // State for filters
    const [dateRange, setDateRange] = useState(null);
    const [timeRange, setTimeRange] = useState('30days');
    const [filteredOrders, setFilteredOrders] = useState([]);
    const [filteredRevenue, setFilteredRevenue] = useState(0);
    const [filteredTopSelling, setFilteredTopSelling] = useState([]);

    // Calculate date ranges
    const getDateRange = (range) => {
        const now = new Date();
        const start = new Date();

        switch (range) {
            case '7days':
                start.setDate(now.getDate() - 7);
                break;
            case '30days':
                start.setDate(now.getDate() - 30);
                break;
            case '90days':
                start.setDate(now.getDate() - 90);
                break;
            case '1year':
                start.setFullYear(now.getFullYear() - 1);
                break;
            default:
                start.setDate(now.getDate() - 30);
        }

        return { start, end: now };
    };

    // Filter data based on date range
    const filterData = () => {
        let startDate, endDate;

        if (dateRange && dateRange.length === 2) {
            startDate = dateRange[0];
            endDate = dateRange[1];
        } else {
            const range = getDateRange(timeRange);
            startDate = range.start;
            endDate = range.end;
        }

        // Filter orders by date range
        const filtered = orders.filter(order => {
            const orderDate = new Date(order.orderDate);
            return orderDate >= startDate && orderDate <= endDate;
        });

        setFilteredOrders(filtered);

        // Calculate filtered revenue
        const revenue = filtered
            .filter(order => order.status === 'delivered')
            .reduce((sum, order) => sum + order.finalPrice, 0);
        setFilteredRevenue(revenue);

        // Filter top selling products (you might want to implement this in the backend)
        // For now, we'll use the existing topSelling data
        setFilteredTopSelling(topSelling);
    };

    // Load initial data
    useEffect(() => {
        const loadData = async () => {
            const range = timeRange;
            await Promise.all([
                dispatch(getTotalRevenue({ range })),
                dispatch(getTopSellingProducts({ range })),
                dispatch(getMyOrders({ page: 1, limit: 100 }))
            ]);
        };
        loadData();
    }, [dispatch, timeRange]);

    // Apply filters when data or filters change
    useEffect(() => {
        if (orders.length > 0) {
            filterData();
        }
    }, [orders, dateRange, timeRange]);

    const handleDateRangeChange = (dates) => {
        setDateRange(dates);
        setTimeRange('custom');
    };

    const handleTimeRangeChange = (value) => {
        setTimeRange(value);
        setDateRange(null);
    };

    const handleRefresh = () => {
        const range = dateRange ? 'custom' : timeRange;
        dispatch(getTotalRevenue({ range }));
        dispatch(getTopSellingProducts({ range }));
        dispatch(getMyOrders({ page: 1, limit: 100 }));
    };

    // Calculate analytics data based on filtered orders
    const analyticsData = {
        totalOrders: filteredOrders.length,
        completedOrders: filteredOrders.filter(o => o.status === 'delivered').length,
        pendingOrders: filteredOrders.filter(o => o.status === 'pending').length,
        shippedOrders: filteredOrders.filter(o => o.status === 'shipped').length,
        cancelledOrders: filteredOrders.filter(o => o.status === 'cancelled').length,
        totalProducts: filteredTopSelling.length,
        totalRevenue: filteredRevenue,
        averageOrderValue: filteredOrders.length > 0 ? filteredRevenue / filteredOrders.length : 0,
        conversionRate: filteredOrders.length > 0 ?
            (filteredOrders.filter(o => o.status === 'delivered').length / filteredOrders.length) * 100 : 0,
    };

    // Generate revenue data for the selected time period
    const generateRevenueData = () => {
        if (!filteredOrders.length) return [];

        const revenueByPeriod = {};
        const period = timeRange === '7days' ? 'day' :
            timeRange === '30days' ? 'day' :
                timeRange === '90days' ? 'week' : 'month';

        filteredOrders
            .filter(order => order.status === 'delivered')
            .forEach(order => {
                const date = new Date(order.orderDate);
                let key;

                switch (period) {
                    case 'day':
                        key = date.toLocaleDateString();
                        break;
                    case 'week':
                        key = `Week ${Math.ceil(date.getDate() / 7)}`;
                        break;
                    case 'month':
                        key = date.toLocaleString('default', { month: 'short' });
                        break;
                    default:
                        key = date.toLocaleDateString();
                }

                revenueByPeriod[key] = (revenueByPeriod[key] || 0) + order.finalPrice;
            });

        return Object.entries(revenueByPeriod).map(([period, revenue]) => ({
            period,
            revenue
        }));
    };

    const revenueData = generateRevenueData();
    const maxRevenue = revenueData.length > 0 ? Math.max(...revenueData.map(item => item.revenue)) : 0;

    const topProductsColumns = [
        {
            title: 'Product',
            dataIndex: 'title',
            key: 'title',
            render: (title, record) => (
                <div className="flex items-center">
                    <Avatar
                        src={record.thumbnail}
                        icon={<ShoppingOutlined />}
                        className="mr-2"
                    />
                    <span>{title}</span>
                </div>
            ),
        },
        {
            title: 'Price',
            dataIndex: 'price',
            key: 'price',
            render: (price) => `$${price}`,
        },
        {
            title: 'Sold',
            dataIndex: 'sold',
            key: 'sold',
            render: (sold) => sold || 0,
        },
        {
            title: 'Revenue',
            key: 'revenue',
            render: (_, record) => `$${((record.price || 0) * (record.sold || 0)).toFixed(2)}`,
        },
        {
            title: 'Rating',
            dataIndex: 'totalRating',
            key: 'totalRating',
            render: (rating) => (
                <Space>
                    <StarOutlined style={{ color: '#faad14' }} />
                    <span>{rating ? rating.toFixed(1) : 'No ratings'}</span>
                </Space>
            ),
        },
    ];

    const recentActivities = filteredOrders
        .slice(0, 5)
        .map(order => ({
            id: order._id,
            action: `New ${order.status} order`,
            description: `Order #${order._id.slice(-8)} for $${order.finalPrice}`,
            time: new Date(order.orderDate).toLocaleDateString(),
            type: 'order'
        }));

    const getActivityIcon = (type) => {
        switch (type) {
            case 'order': return <ShoppingOutlined style={{ color: '#1890ff' }} />;
            case 'warning': return <FallOutlined style={{ color: '#faad14' }} />;
            case 'review': return <StarOutlined style={{ color: '#52c41a' }} />;
            case 'payment': return <DollarOutlined style={{ color: '#722ed1' }} />;
            default: return <UserOutlined />;
        }
    };

    const getDateRangeText = () => {
        if (dateRange && dateRange.length === 2) {
            return `${dateRange[0].format('MMM DD, YYYY')} - ${dateRange[1].format('MMM DD, YYYY')}`;
        }

        switch (timeRange) {
            case '7days': return 'Last 7 Days';
            case '30days': return 'Last 30 Days';
            case '90days': return 'Last 90 Days';
            case '1year': return 'Last Year';
            default: return 'Last 30 Days';
        }
    };

    return (
        <div>
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Analytics Dashboard</h1>
                    <p className="text-gray-600">Track your store performance and insights</p>
                </div>
                <Space>
                    <Button
                        icon={<ReloadOutlined />}
                        onClick={handleRefresh}
                        loading={isLoading}
                    >
                        Refresh
                    </Button>
                </Space>
            </div>

            {/* Filters */}
            <Card className="mb-6">
                <Row gutter={[16, 16]} align="middle">
                    <Col xs={24} md={8}>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Custom Date Range
                            </label>
                            <RangePicker
                                value={dateRange}
                                onChange={handleDateRangeChange}
                                style={{ width: '100%' }}
                            />
                        </div>
                    </Col>
                    <Col xs={24} md={6}>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Quick Range
                            </label>
                            <Select
                                value={timeRange}
                                onChange={handleTimeRangeChange}
                                style={{ width: '100%' }}
                                suffixIcon={<FilterOutlined />}
                            >
                                <Option value="7days">Last 7 days</Option>
                                <Option value="30days">Last 30 days</Option>
                                <Option value="90days">Last 90 days</Option>
                                <Option value="1year">Last year</Option>
                            </Select>
                        </div>
                    </Col>
                    <Col xs={24} md={10} className="text-right">
                        <div className="space-y-1">
                            <p className="text-sm text-gray-600">
                                Showing data for: <strong>{getDateRangeText()}</strong>
                            </p>
                            <p className="text-sm text-gray-500">
                                {filteredOrders.length} orders • ${filteredRevenue.toFixed(2)} revenue
                            </p>
                        </div>
                    </Col>
                </Row>
            </Card>

            {/* Key Metrics */}
            <Row gutter={[16, 16]} className="mb-6">
                <Col xs={12} sm={6}>
                    <Card>
                        <Statistic
                            title="Total Revenue"
                            value={filteredRevenue}
                            prefix={<DollarOutlined />}
                            valueStyle={{ color: '#3f8600' }}
                            precision={2}
                        />
                    </Card>
                </Col>
                <Col xs={12} sm={6}>
                    <Card>
                        <Statistic
                            title="Total Orders"
                            value={analyticsData.totalOrders}
                            prefix={<ShoppingOutlined />}
                            valueStyle={{ color: '#1890ff' }}
                        />
                    </Card>
                </Col>
                <Col xs={12} sm={6}>
                    <Card>
                        <Statistic
                            title="Conversion Rate"
                            value={analyticsData.conversionRate}
                            suffix="%"
                            valueStyle={{ color: '#722ed1' }}
                            precision={1}
                        />
                        <Progress
                            percent={Math.round(analyticsData.conversionRate)}
                            size="small"
                            showInfo={false}
                        />
                    </Card>
                </Col>
                <Col xs={12} sm={6}>
                    <Card>
                        <Statistic
                            title="Avg Order Value"
                            value={analyticsData.averageOrderValue}
                            prefix={<DollarOutlined />}
                            valueStyle={{ color: '#faad14' }}
                            precision={2}
                        />
                    </Card>
                </Col>
            </Row>

            <Row gutter={[16, 16]}>
                {/* Top Selling Products */}
                <Col xs={24} lg={12}>
                    <Card
                        title="Top Selling Products"
                        loading={isLoading}
                        extra={
                            <span className="text-sm text-gray-500">
                                {getDateRangeText()}
                            </span>
                        }
                    >
                        <Table
                            columns={topProductsColumns}
                            dataSource={filteredTopSelling.slice(0, 5)}
                            pagination={false}
                            size="small"
                            scroll={{ x: 600 }}
                        />
                    </Card>
                </Col>

                {/* Recent Activities */}
                <Col xs={24} lg={12}>
                    <Card
                        title="Recent Activities"
                        extra={
                            <span className="text-sm text-gray-500">
                                {getDateRangeText()}
                            </span>
                        }
                    >
                        {recentActivities.length > 0 ? (
                            <List
                                itemLayout="horizontal"
                                dataSource={recentActivities}
                                renderItem={item => (
                                    <List.Item>
                                        <List.Item.Meta
                                            avatar={getActivityIcon(item.type)}
                                            title={item.action}
                                            description={
                                                <Space direction="vertical" size={0}>
                                                    <span>{item.description}</span>
                                                    <span className="text-gray-400 text-xs">
                                                        {item.time}
                                                    </span>
                                                </Space>
                                            }
                                        />
                                    </List.Item>
                                )}
                            />
                        ) : (
                            <div className="text-center py-8 text-gray-500">
                                No activities in the selected period
                            </div>
                        )}
                    </Card>
                </Col>

                {/* Order Status Distribution */}
                <Col xs={24} lg={12}>
                    <Card
                        title="Order Status Distribution"
                        extra={
                            <span className="text-sm text-gray-500">
                                {getDateRangeText()}
                            </span>
                        }
                    >
                        <div className="space-y-4">
                            {[
                                { status: 'Delivered', count: analyticsData.completedOrders, color: '#52c41a' },
                                { status: 'Pending', count: analyticsData.pendingOrders, color: '#faad14' },
                                { status: 'Shipped', count: analyticsData.shippedOrders, color: '#1890ff' },
                                { status: 'Cancelled', count: analyticsData.cancelledOrders, color: '#ff4d4f' },
                            ].map(item => (
                                <div key={item.status} className="flex items-center justify-between">
                                    <span>{item.status}</span>
                                    <Space>
                                        <span>{item.count}</span>
                                        <Progress
                                            percent={analyticsData.totalOrders > 0 ?
                                                Math.round((item.count / analyticsData.totalOrders) * 100) : 0
                                            }
                                            strokeColor={item.color}
                                            size="small"
                                            style={{ width: 100 }}
                                        />
                                    </Space>
                                </div>
                            ))}
                        </div>
                    </Card>
                </Col>

                {/* Revenue Trend */}
                <Col xs={24} lg={12}>
                    <Card
                        title="Revenue Trend"
                        extra={
                            <span className="text-sm text-gray-500">
                                {getDateRangeText()}
                            </span>
                        }
                    >
                        {revenueData.length > 0 ? (
                            <div className="space-y-3">
                                {revenueData.map(item => (
                                    <div key={item.period} className="flex items-center justify-between">
                                        <span className="font-medium">{item.period}</span>
                                        <Space>
                                            <span className="text-gray-600">${item.revenue.toFixed(2)}</span>
                                            <Progress
                                                percent={maxRevenue > 0 ?
                                                    Math.round((item.revenue / maxRevenue) * 100) : 0
                                                }
                                                size="small"
                                                style={{ width: 150 }}
                                                showInfo={false}
                                            />
                                        </Space>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-8 text-gray-500">
                                No revenue data in the selected period
                            </div>
                        )}
                    </Card>
                </Col>
            </Row>
        </div>
    );
};

export default AnalyticsPage;