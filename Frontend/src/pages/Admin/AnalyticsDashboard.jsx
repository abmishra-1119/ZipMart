// components/admin/AnalyticsDashboard.jsx
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
    Row,
    Col,
    Card,
    Statistic,
    Table,
    Tag,
    Select,
    DatePicker,
    Progress,
    List,
    Avatar,
    Spin
} from 'antd';
import {
    RiseOutlined,
    FallOutlined,
    ShoppingOutlined,
    UserOutlined,
    DollarOutlined,
    BarChartOutlined
} from '@ant-design/icons';
import {
    adminGetTopSellingProducts,
    adminGetTotalRevenue,
    adminGetTopCustomers,
    adminGetTopSellers,
    adminGetOrderStatusSummary
} from '../../features/admin/adminSlice';

const { Option } = Select;
const { RangePicker } = DatePicker;

const AnalyticsDashboard = () => {
    const dispatch = useDispatch();

    const {
        topSelling,
        totalRevenue,
        topCustomers,
        topSellers,
        orderSummary,
        isLoading
    } = useSelector(state => state.admin);

    // console.log(topSelling);

    const [timeRange, setTimeRange] = useState('7days');
    const [dateRange, setDateRange] = useState(null);

    useEffect(() => {
        const params = { range: timeRange };
        dispatch(adminGetTopSellingProducts(params));
        dispatch(adminGetTotalRevenue(params));
        dispatch(adminGetTopCustomers({ limit: 5, range: timeRange }));
        dispatch(adminGetTopSellers({ limit: 5, range: timeRange }));
        dispatch(adminGetOrderStatusSummary());
    }, [dispatch, timeRange]);

    const revenueComparison = {
        current: totalRevenue,
        previous: totalRevenue * 0.85, // Mock data - replace with actual comparison
        trend: 'up'
    };

    const getRevenueChange = () => {
        const change = ((revenueComparison.current - revenueComparison.previous) / revenueComparison.previous) * 100;
        return {
            value: Math.abs(change).toFixed(1),
            trend: change >= 0 ? 'up' : 'down'
        };
    };

    const revenueChange = getRevenueChange();

    const topSellingColumns = [
        {
            title: 'Product',
            dataIndex: 'title',
            key: 'title',
            render: (title, record) => (
                <div className="flex items-center">
                    <Avatar
                        src={record.thumbnail}
                        icon={<ShoppingOutlined />}
                        className="mr-3"
                    />
                    <div>
                        <div className="font-medium">{title}</div>
                        <div className="text-gray-500 text-sm">{record.brand}</div>
                    </div>
                </div>
            ),
        },
        {
            title: 'Category',
            dataIndex: 'category',
            key: 'category',
            render: (category) => <Tag color="blue">{category}</Tag>,
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
            render: (count) => <span className="font-semibold">{count}</span>,
        },
        {
            title: 'Revenue',
            dataIndex: 'revenue',
            key: 'revenue',
            render: (revenue) => `$${revenue || 0}`,
        },
    ];

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-64">
                <Spin size="large" />
            </div>
        );
    }

    return (
        <div>
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Analytics Dashboard</h1>
                    <p className="text-gray-600">Business insights and performance metrics</p>
                </div>

                <div className="flex gap-4 mt-4 md:mt-0">
                    <Select
                        value={timeRange}
                        onChange={setTimeRange}
                        style={{ width: 120 }}
                        size="large"
                    >
                        <Option value="7days">Last 7 Days</Option>
                        <Option value="30days">Last 30 Days</Option>
                        <Option value="90days">Last 90 Days</Option>
                        <Option value="1year">Last Year</Option>
                    </Select>
                    <RangePicker size="large" />
                </div>
            </div>

            {/* Key Metrics */}
            <Row gutter={[16, 16]} className="mb-6">
                <Col xs={12} sm={6}>
                    <Card>
                        <Statistic
                            title="Total Revenue"
                            value={totalRevenue}
                            precision={2}
                            prefix={<DollarOutlined />}
                            valueStyle={{ color: '#3f8600' }}
                            suffix={
                                revenueChange.trend === 'up' ?
                                    <RiseOutlined className="text-green-500" /> :
                                    <FallOutlined className="text-red-500" />
                            }
                        />
                        <div className="text-sm text-gray-500 mt-2">
                            {revenueChange.trend === 'up' ? '+' : '-'}{revenueChange.value}% from previous period
                        </div>
                    </Card>
                </Col>

                <Col xs={12} sm={6}>
                    <Card>
                        <Statistic
                            title="Top Selling Products"
                            value={topSelling.length}
                            prefix={<ShoppingOutlined />}
                            valueStyle={{ color: '#1890ff' }}
                        />
                        <div className="text-sm text-gray-500 mt-2">
                            Across all categories
                        </div>
                    </Card>
                </Col>

                <Col xs={12} sm={6}>
                    <Card>
                        <Statistic
                            title="Active Customers"
                            value={topCustomers.length}
                            prefix={<UserOutlined />}
                            valueStyle={{ color: '#faad14' }}
                        />
                        <div className="text-sm text-gray-500 mt-2">
                            Top performing users
                        </div>
                    </Card>
                </Col>

                <Col xs={12} sm={6}>
                    <Card>
                        <Statistic
                            title="Best Sellers"
                            value={topSellers.length}
                            prefix={<BarChartOutlined />}
                            valueStyle={{ color: '#722ed1' }}
                        />
                        <div className="text-sm text-gray-500 mt-2">
                            Vendor performance
                        </div>
                    </Card>
                </Col>
            </Row>

            <Row gutter={[24, 24]}>
                {/* Top Selling Products */}
                <Col xs={24} lg={12}>
                    <Card
                        title="Top Selling Products"
                        className="h-full"
                    >
                        <Table
                            columns={topSellingColumns}
                            dataSource={topSelling.slice(0, 5)}
                            pagination={false}
                            size="small"
                            scroll={{ x: 600 }}
                        />
                    </Card>
                </Col>

                {/* Order Status Distribution */}
                <Col xs={24} lg={12}>
                    <Card title="Order Status Distribution">
                        <div className="space-y-4">
                            {Object.entries(orderSummary).map(([status, count]) => {
                                const total = Object.values(orderSummary).reduce((a, b) => a + b, 0);
                                const percentage = total > 0 ? (count / total) * 100 : 0;
                                const color = status === 'delivered' ? 'green' :
                                    status === 'shipped' ? 'blue' :
                                        status === 'pending' ? 'orange' : 'red';

                                return (
                                    <div key={status} className="flex items-center justify-between">
                                        <div className="flex items-center">
                                            <div
                                                className="w-3 h-3 rounded-full mr-3"
                                                style={{ backgroundColor: color }}
                                            />
                                            <span className="capitalize">{status}</span>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <div className="w-32">
                                                <Progress
                                                    percent={Math.round(percentage)}
                                                    size="small"
                                                    strokeColor={color}
                                                    showInfo={false}
                                                />
                                            </div>
                                            <span className="font-semibold w-12 text-right">{count}</span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </Card>
                </Col>

                {/* Top Customers */}
                <Col xs={24} lg={12}>
                    <Card title="Top Customers">
                        <List
                            dataSource={topCustomers}
                            renderItem={(customer, index) => (
                                <List.Item>
                                    <List.Item.Meta
                                        avatar={
                                            <Avatar
                                                src={customer.avatar?.url}
                                                icon={<UserOutlined />}
                                            />
                                        }
                                        title={
                                            <div className="flex justify-between">
                                                <span>{customer.name}</span>
                                                <Tag color="green">${customer.totalSpent || 0}</Tag>
                                            </div>
                                        }
                                        description={
                                            <div className="flex justify-between text-sm">
                                                <span>{customer.ordersCount || 0} orders</span>
                                                <span className="text-gray-500">{customer.email}</span>
                                            </div>
                                        }
                                    />
                                </List.Item>
                            )}
                        />
                    </Card>
                </Col>

                {/* Top Sellers */}
                <Col xs={24} lg={12}>
                    <Card title="Top Sellers">
                        <List
                            dataSource={topSellers}
                            renderItem={(seller, index) => (
                                <List.Item>
                                    <List.Item.Meta
                                        avatar={
                                            <Avatar
                                                src={seller.avatar?.url}
                                                icon={<UserOutlined />}
                                            />
                                        }

                                        title={
                                            <div className="flex justify-between">
                                                <span>{seller.name}</span>
                                                <Tag color="blue">{seller.totalSold || 0} sold</Tag>
                                            </div>
                                        }
                                    />
                                </List.Item>
                            )}
                        />
                    </Card>
                </Col>
            </Row>
        </div>
    );
};

export default AnalyticsDashboard;