import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Row,
  Col,
  Card,
  Statistic,
  Table,
  Progress,
  List,
  Avatar,
  Space,
  DatePicker,
  Select,
  Button,
} from "antd";
import {
  ShoppingOutlined,
  StarOutlined,
  ReloadOutlined,
  FilterOutlined,
} from "@ant-design/icons";
import {
  getTotalRevenue,
  getTopSellingProducts,
  getMyOrders,
} from "../../features/seller/sellerSlice";
import { RiMoneyRupeeCircleLine } from "react-icons/ri";

const { RangePicker } = DatePicker;

const AnalyticsPage = () => {
  const dispatch = useDispatch();

  const {
    totalRevenue = 0,
    topSelling = [],
    orders = [],
    isLoading,
  } = useSelector((state) => state.seller);

  // Filters
  const [dateRange, setDateRange] = useState(null);
  const [timeRange, setTimeRange] = useState("30days");

  const getDateRange = (rangeKey) => {
    const now = new Date();
    const start = new Date();

    switch (rangeKey) {
      case "7days":
        start.setDate(now.getDate() - 7);
        break;
      case "30days":
        start.setDate(now.getDate() - 30);
        break;
      case "90days":
        start.setDate(now.getDate() - 90);
        break;
      case "1year":
        start.setFullYear(now.getFullYear() - 1);
        break;
      default:
        start.setDate(now.getDate() - 30);
    }

    return { start, end: now };
  };

  // Load data from backend when timeRange changes
  useEffect(() => {
    const loadData = async () => {
      try {
        const range = timeRange;
        await Promise.all([
          dispatch(getTotalRevenue({ range })),
          dispatch(getTopSellingProducts({ range })),
          dispatch(getMyOrders({ page: 1, limit: 100 })),
        ]);
      } catch (error) {
        console.error("Failed to load analytics data:", error);
      }
    };

    loadData();
  }, [dispatch, timeRange]);

  const handleDateRangeChange = (dates) => {
    setDateRange(dates);
    setTimeRange("custom");
  };

  const handleTimeRangeChange = (value) => {
    setTimeRange(value);
    setDateRange(null);
  };

  const handleRefresh = () => {
    const range = dateRange ? "custom" : timeRange;
    dispatch(getTotalRevenue({ range }));
    dispatch(getTopSellingProducts({ range }));
    dispatch(getMyOrders({ page: 1, limit: 100 }));
  };

  // Derived data (filtered orders, revenue, analytics, charts, activities)
  const {
    filteredOrders,
    completedOrders,
    pendingOrders,
    shippedOrders,
    cancelledOrders,
    conversionRate,
    averageOrderValue,
    revenueData,
    maxRevenue,
    recentActivities,
  } = useMemo(() => {
    if (!orders || orders.length === 0) {
      return {
        filteredOrders: [],
        completedOrders: 0,
        pendingOrders: 0,
        shippedOrders: 0,
        cancelledOrders: 0,
        conversionRate: 0,
        averageOrderValue: 0,
        revenueData: [],
        maxRevenue: 0,
        recentActivities: [],
      };
    }

    let startDate;
    let endDate;

    if (dateRange && dateRange.length === 2) {
      startDate = dateRange[0].startOf("day").toDate();
      endDate = dateRange[1].endOf("day").toDate();
    } else {
      const range = getDateRange(timeRange);
      startDate = range.start;
      endDate = range.end;
    }

    const filtered = orders.filter((order) => {
      if (!order.orderDate) return false;
      const orderDate = new Date(order.orderDate);
      return orderDate >= startDate && orderDate <= endDate;
    });

    const deliveredOrders = filtered.filter((o) => o.status === "delivered");
    const pending = filtered.filter((o) => o.status === "pending").length;
    const shipped = filtered.filter((o) => o.status === "shipped").length;
    const cancelled = filtered.filter((o) => o.status === "cancelled").length;

    const filteredRevenue = deliveredOrders.reduce(
      (sum, order) => sum + (order.finalPrice || 0),
      0
    );

    const avgOrderValue =
      filtered.length > 0 ? filteredRevenue / filtered.length : 0;

    const convRate =
      filtered.length > 0
        ? (deliveredOrders.length / filtered.length) * 100
        : 0;

    // Revenue trend data
    const revenueByPeriod = {};
    const periodKey =
      timeRange === "7days" || timeRange === "30days"
        ? "day"
        : timeRange === "90days"
          ? "week"
          : "month";

    deliveredOrders.forEach((order) => {
      const date = new Date(order.orderDate);
      let key;

      switch (periodKey) {
        case "day":
          key = date.toLocaleDateString();
          break;
        case "week":
          key = `Week ${Math.ceil(date.getDate() / 7)}`;
          break;
        case "month":
          key = date.toLocaleString("default", { month: "short" });
          break;
        default:
          key = date.toLocaleDateString();
      }

      revenueByPeriod[key] =
        (revenueByPeriod[key] || 0) + (order.finalPrice || 0);
    });

    const revenueDataArr = Object.entries(revenueByPeriod).map(
      ([period, revenue]) => ({
        period,
        revenue,
      })
    );

    const maxRev =
      revenueDataArr.length > 0
        ? Math.max(...revenueDataArr.map((r) => r.revenue))
        : 0;

    // Recent Activities
    const recentActivitiesArr = filtered.slice(0, 5).map((order) => ({
      id: order._id,
      action: `New ${order.status} order`,
      description: `Order #${order._id.slice(-8)} for ₹${order.finalPrice}`,
      time: new Date(order.orderDate).toLocaleDateString(),
      type: "order",
    }));

    return {
      filteredOrders: filtered,
      completedOrders: deliveredOrders.length,
      pendingOrders: pending,
      shippedOrders: shipped,
      cancelledOrders: cancelled,
      conversionRate: convRate,
      averageOrderValue: avgOrderValue,
      revenueData: revenueDataArr,
      maxRevenue: maxRev,
      recentActivities: recentActivitiesArr,
    };
  }, [orders, dateRange, timeRange]);

  const getActivityIcon = (type) => {
    switch (type) {
      case "order":
      default:
        return <ShoppingOutlined style={{ color: "#1890ff" }} />;
    }
  };

  const getDateRangeText = () => {
    if (dateRange && dateRange.length === 2) {
      return `${dateRange[0].format("MMM DD, YYYY")} - ${dateRange[1].format(
        "MMM DD, YYYY"
      )}`;
    }

    switch (timeRange) {
      case "7days":
        return "Last 7 Days";
      case "30days":
        return "Last 30 Days";
      case "90days":
        return "Last 90 Days";
      case "1year":
        return "Last Year";
      default:
        return "Last 30 Days";
    }
  };

  // Columns for top-selling products table
  const topProductsColumns = [
    {
      title: "Product",
      dataIndex: "title",
      key: "title",
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
      title: "Price",
      dataIndex: "price",
      key: "price",
      render: (price) => `₹${price}`,
    },
    {
      title: "Sold",
      dataIndex: "sold",
      key: "sold",
      render: (sold) => sold || 0,
    },
    {
      title: "Revenue",
      key: "revenue",
      render: (_, record) =>
        `₹${((record.price || 0) * (record.sold || 0)).toFixed(2)}`,
    },
    {
      title: "Rating",
      dataIndex: "totalRating",
      key: "totalRating",
      render: (rating) => (
        <Space>
          <StarOutlined style={{ color: "#faad14" }} />
          <span>{rating ? rating.toFixed(1) : "No ratings"}</span>
        </Space>
      ),
    },
  ];

  const totalOrders = filteredOrders.length;

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            Analytics Dashboard
          </h1>
          <p className="text-gray-600">
            Track your store performance and insights
          </p>
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
                style={{ width: "100%" }}
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
                style={{ width: "100%" }}
                suffixIcon={<FilterOutlined />}
                options={[
                  { value: "7days", label: "Last 7 days" },
                  { value: "30days", label: "Last 30 days" },
                  { value: "90days", label: "Last 90 days" },
                  { value: "1year", label: "Last year" },
                ]}
              />
            </div>
          </Col>
          <Col xs={24} md={10} className="text-right">
            <div className="space-y-1">
              <p className="text-sm text-gray-600">
                Showing data for: <strong>{getDateRangeText()}</strong>
              </p>
              <p className="text-sm text-gray-500">
                {totalOrders} orders • ₹{totalRevenue.toFixed(2)} revenue
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
              value={totalRevenue}
              prefix={<RiMoneyRupeeCircleLine />}
              valueStyle={{ color: "#3f8600" }}
              precision={2}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card>
            <Statistic
              title="Total Orders"
              value={totalOrders}
              prefix={<ShoppingOutlined />}
              valueStyle={{ color: "#1890ff" }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card>
            <Statistic
              title="Conversion Rate"
              value={conversionRate}
              suffix="%"
              valueStyle={{ color: "#722ed1" }}
              precision={1}
            />
            <Progress
              percent={Math.round(conversionRate)}
              size="small"
              showInfo={false}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card>
            <Statistic
              title="Avg Order Value"
              value={averageOrderValue}
              prefix={<RiMoneyRupeeCircleLine />}
              valueStyle={{ color: "#faad14" }}
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
              dataSource={topSelling.slice(0, 5)}
              pagination={false}
              size="small"
              scroll={{ x: 600 }}
              rowKey={(record) => record._id}
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
                renderItem={(item) => (
                  <List.Item key={item.id}>
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
                {
                  status: "Delivered",
                  count: completedOrders,
                  color: "#52c41a",
                },
                {
                  status: "Pending",
                  count: pendingOrders,
                  color: "#faad14",
                },
                {
                  status: "Shipped",
                  count: shippedOrders,
                  color: "#1890ff",
                },
                {
                  status: "Cancelled",
                  count: cancelledOrders,
                  color: "#ff4d4f",
                },
              ].map((item) => (
                <div
                  key={item.status}
                  className="flex items-center justify-between"
                >
                  <span>{item.status}</span>
                  <Space>
                    <span>{item.count}</span>
                    <Progress
                      percent={
                        totalOrders > 0
                          ? Math.round((item.count / totalOrders) * 100)
                          : 0
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
                {revenueData.map((item) => (
                  <div
                    key={item.period}
                    className="flex items-center justify-between"
                  >
                    <span className="font-medium">{item.period}</span>
                    <Space>
                      <span className="text-gray-600">
                        ₹{item.revenue.toFixed(2)}
                      </span>
                      <Progress
                        percent={
                          maxRevenue > 0
                            ? Math.round((item.revenue / maxRevenue) * 100)
                            : 0
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
