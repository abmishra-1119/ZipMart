import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  Row,
  Col,
  Card,
  Statistic,
  Table,
  Tag,
  Button,
  Spin,
  Alert,
  Progress,
} from "antd";
import {
  ShoppingOutlined,
  DollarOutlined,
  FileTextOutlined,
  EyeOutlined,
  ArrowUpOutlined,
} from "@ant-design/icons";
import {
  getTotalRevenue,
  getTopSellingProducts,
  getMyOrders,
} from "../../features/seller/sellerSlice";

const DashboardOverview = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { totalRevenue, topSelling, orders, isLoading, isError, message } =
    useSelector((state) => state.seller);

  useEffect(() => {
    dispatch(getTotalRevenue());
    dispatch(getTopSellingProducts());
    dispatch(getMyOrders({ page: 1, limit: 5 }));
  }, [dispatch]);

  const recentOrdersColumns = [
    {
      title: "Order ID",
      dataIndex: "_id",
      key: "_id",
      render: (id) => `#${id.slice(-8)}`,
    },
    {
      title: "Customer",
      dataIndex: "user",
      key: "user",
      render: (user) => user?.name || "N/A",
    },
    {
      title: "Amount",
      dataIndex: "finalPrice",
      key: "finalPrice",
      render: (price) => `₹${price}`,
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status) => {
        const color =
          status === "delivered"
            ? "green"
            : status === "shipped"
              ? "cyan"
              : status === "pending"
                ? "orange"
                : status === "confirmed"
                  ? "blue"
                  : "red";
        return <Tag color={color}>{status.toUpperCase()}</Tag>;
      },
    },
    {
      title: "Date",
      dataIndex: "orderDate",
      key: "orderDate",
      render: (date) => new Date(date).toLocaleDateString(),
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <Button
          size="small"
          icon={<EyeOutlined />}
          onClick={() => navigate(`/seller/orders/${record._id}`)}
        >
          View
        </Button>
      ),
    },
  ];

  const topProductsColumns = [
    {
      title: "Product",
      dataIndex: "title",
      key: "title",
      render: (title, record) => (
        <div className="flex items-center">
          <img
            src={record.thumbnail}
            alt={title}
            className="w-8 h-8 rounded mr-2 object-cover"
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
      title: "Stock",
      dataIndex: "stock",
      key: "stock",
      render: (stock) => (
        <Tag color={stock > 10 ? "green" : stock > 0 ? "orange" : "red"}>
          {stock} left
        </Tag>
      ),
    },
    {
      title: "Rating",
      dataIndex: "totalRating",
      key: "totalRating",
      render: (rating) => rating || "No ratings",
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
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Dashboard Overview</h1>
        <p className="text-gray-600">
          Welcome back! Here's what's happening with your store.
        </p>
      </div>

      {isError && (
        <Alert
          message="Error"
          description={message}
          type="error"
          closable
          className="mb-6"
        />
      )}

      {/* Stats Cards */}
      <Row gutter={[16, 16]} className="mb-6">
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Total Revenue"
              value={totalRevenue}
              prefix={<DollarOutlined />}
              valueStyle={{ color: "#3f8600" }}
              suffix={<ArrowUpOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Total Products"
              value={topSelling.length}
              prefix={<ShoppingOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Pending Orders"
              value={
                orders.filter((order) => order.status === "pending").length
              }
              prefix={<FileTextOutlined />}
              valueStyle={{ color: "#cf1322" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Total Orders"
              value={orders.length}
              prefix={<FileTextOutlined />}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        {/* Recent Orders */}
        <Col xs={24} lg={12}>
          <Card
            title="Recent Orders"
            extra={
              <Button type="link" onClick={() => navigate("/seller/orders")}>
                View All
              </Button>
            }
          >
            <Table
              columns={recentOrdersColumns}
              dataSource={orders.slice(0, 5)}
              pagination={false}
              size="small"
              scroll={{ x: 600 }}
            />
          </Card>
        </Col>

        {/* Top Selling Products */}
        <Col xs={24} lg={12}>
          <Card
            title="Top Selling Products"
            extra={
              <Button type="link" onClick={() => navigate("/seller/products")}>
                View All
              </Button>
            }
          >
            <Table
              columns={topProductsColumns}
              dataSource={topSelling.slice(0, 5)}
              pagination={false}
              size="small"
            />
          </Card>
        </Col>
      </Row>

      {/* Quick Actions */}
      <Row gutter={[16, 16]} className="mt-6">
        <Col xs={24}>
          <Card title="Quick Actions">
            <div className="flex flex-wrap gap-4">
              <Button
                type="primary"
                size="large"
                onClick={() => navigate("/seller/products/create")}
              >
                Add New Product
              </Button>
              <Button size="large" onClick={() => navigate("/seller/orders")}>
                Manage Orders
              </Button>
              <Button
                size="large"
                onClick={() => navigate("/seller/analytics")}
              >
                View Analytics
              </Button>
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default DashboardOverview;
