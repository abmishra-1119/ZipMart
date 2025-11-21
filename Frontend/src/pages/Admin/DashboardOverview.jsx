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
  Progress,
} from "antd";
import {
  TeamOutlined,
  ShoppingOutlined,
  FileTextOutlined,
  DollarOutlined,
  RiseOutlined,
  EyeOutlined,
} from "@ant-design/icons";
import {
  adminGetAllUsers,
  adminGetAllOrders,
  adminGetTotalRevenue,
  adminGetOrderStatusSummary,
} from "../../features/admin/adminSlice";

const AdminDashboardOverview = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { users, orders, totalRevenue, orderSummary, isLoading } = useSelector(
    (state) => state.admin
  );

  useEffect(() => {
    dispatch(adminGetAllUsers({ page: 1, limit: 5 }));
    dispatch(adminGetAllOrders({ page: 1, limit: 5 }));
    dispatch(adminGetTotalRevenue({}));
    dispatch(adminGetOrderStatusSummary());
  }, [dispatch]);

  const statsData = {
    totalUsers: users.length,
    totalOrders: orders.length,
    totalRevenue: totalRevenue,
    pendingOrders: orderSummary.pending || 0,
  };

  const recentUsersColumns = [
    {
      title: "User",
      dataIndex: "name",
      key: "name",
      render: (name, record) => (
        <div className="flex items-center">
          <img
            src={record.avatar?.url}
            alt={name}
            className="w-8 h-8 rounded-full mr-3"
          />
          <div>
            <div className="font-medium">{name}</div>
            <div className="text-gray-500 text-sm">{record.email}</div>
          </div>
        </div>
      ),
    },
    {
      title: "Role",
      dataIndex: "role",
      key: "role",
      render: (role) => (
        <Tag
          color={
            role === "admin" ? "red" : role === "seller" ? "blue" : "green"
          }
        >
          {role}
        </Tag>
      ),
    },
    {
      title: "Joined",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (date) => new Date(date).toLocaleDateString(),
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <Button
          size="small"
          icon={<EyeOutlined />}
          onClick={() => navigate(`/admin/dashboard/users/${record._id}`)}
        >
          View
        </Button>
      ),
    },
  ];

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
      render: (price) => `$${price}`,
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
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <Button
          size="small"
          icon={<EyeOutlined />}
          onClick={() => navigate(`/admin/dashboard/orders/${record._id}`)}
        >
          View
        </Button>
      ),
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
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800">Admin Dashboard</h1>
        <p className="text-gray-600">Welcome to the administration panel</p>
      </div>

      {/* Stats Cards */}
      <Row gutter={[16, 16]} className="mb-8">
        <Col xs={12} sm={6}>
          <Card>
            <Statistic
              title="Total Users"
              value={statsData.totalUsers}
              prefix={<TeamOutlined />}
              valueStyle={{ color: "#1890ff" }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card>
            <Statistic
              title="Total Orders"
              value={statsData.totalOrders}
              prefix={<FileTextOutlined />}
              valueStyle={{ color: "#52c41a" }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card>
            <Statistic
              title="Total Revenue"
              value={statsData.totalRevenue}
              prefix={<DollarOutlined />}
              valueStyle={{ color: "#3f8600" }}
              suffix={<RiseOutlined />}
              precision={2}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card>
            <Statistic
              title="Pending Orders"
              value={statsData.pendingOrders}
              prefix={<FileTextOutlined />}
              valueStyle={{ color: "#faad14" }}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[24, 24]}>
        {/* Recent Users */}
        <Col xs={24} lg={12}>
          <Card
            title="Recent Users"
            extra={
              <Button
                type="link"
                onClick={() => navigate("/admin/dashboard/users")}
              >
                View All
              </Button>
            }
          >
            <Table
              columns={recentUsersColumns}
              dataSource={users.slice(0, 5)}
              pagination={false}
              size="small"
              scroll={{ x: 450 }}
            />
          </Card>
        </Col>

        {/* Recent Orders */}
        <Col xs={24} lg={12}>
          <Card
            title="Recent Orders"
            extra={
              <Button
                type="link"
                onClick={() => navigate("/admin/dashboard/orders")}
              >
                View All
              </Button>
            }
          >
            <Table
              columns={recentOrdersColumns}
              dataSource={orders.slice(0, 5)}
              pagination={false}
              size="small"
              scroll={{ x: 450 }}
            />
          </Card>
        </Col>

        {/* Order Status Distribution */}
        <Col xs={24}>
          <Card title="Order Status Distribution">
            <Row gutter={[16, 16]}>
              {Object.entries(orderSummary).map(([status, count]) => {
                const total = Object.values(orderSummary).reduce(
                  (a, b) => a + b,
                  0
                );
                const percentage = total > 0 ? (count / total) * 100 : 0;
                const color =
                  status === "delivered"
                    ? "green"
                    : status === "shipped"
                      ? "blue"
                      : status === "pending"
                        ? "orange"
                        : "red";

                return (
                  <Col xs={12} md={6} key={status}>
                    <div className="text-center">
                      <Progress
                        type="circle"
                        percent={Math.round(percentage)}
                        strokeColor={color}
                        size={80}
                      />
                      <div className="mt-2">
                        <div className="font-semibold capitalize">{status}</div>
                        <div className="text-gray-600">{count} orders</div>
                      </div>
                    </div>
                  </Col>
                );
              })}
            </Row>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default AdminDashboardOverview;
