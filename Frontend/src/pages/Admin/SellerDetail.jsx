import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  Card,
  Descriptions,
  Button,
  Tabs,
  Table,
  Tag,
  Space,
  Modal,
  message,
  Spin,
  Row,
  Col,
  Statistic,
  Image,
  Badge,
  Switch,
  Progress,
  Divider,
  List,
  Avatar,
} from "antd";
import {
  ArrowLeftOutlined,
  EditOutlined,
  DeleteOutlined,
  ShopOutlined,
  UserOutlined,
  DollarOutlined,
  ShoppingOutlined,
  StarOutlined,
  PhoneOutlined,
  MailOutlined,
  EnvironmentOutlined,
  CalendarOutlined,
  EyeOutlined,
  ProductOutlined,
} from "@ant-design/icons";
import {
  adminGetUserById,
  adminDeleteUserById,
  adminGetSellerProducts,
  adminGetSellerOrders,
  adminToggleUserStatus,
} from "../../features/admin/adminSlice";

const { TabPane } = Tabs;

const SellerDetail = () => {
  const { sellerId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const {
    userDetails,
    orders: userOrders,
    products,
    isLoading,
    isSuccess,
    message: responseMessage,
  } = useSelector((state) => state.admin);

  const [activeTab, setActiveTab] = useState("overview");
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [togglingStatus, setTogglingStatus] = useState(false);

  useEffect(() => {
    if (sellerId) {
      dispatch(adminGetUserById(sellerId));
      dispatch(adminGetSellerProducts({ sellerId }));
      dispatch(adminGetSellerOrders({ sellerId }));
    }
  }, [sellerId, dispatch]);

  const showDeleteModal = () => {
    setDeleteModalVisible(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      await dispatch(adminDeleteUserById(sellerId)).unwrap();
      message.success("Seller deleted successfully");
      navigate("/admin/dashboard/sellers");
    } catch (error) {
      message.error(error?.message || "Failed to delete seller");
    } finally {
      setDeleteModalVisible(false);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteModalVisible(false);
  };

  const handleStatusToggle = async (checked) => {
    setTogglingStatus(true);
    try {
      const result = await dispatch(adminToggleUserStatus(sellerId)).unwrap();
      message.success(
        `Seller ${result.isActive ? "activated" : "deactivated"} successfully`
      );
      dispatch(adminGetUserById(sellerId));
    } catch (error) {
      message.error(error?.message || "Failed to update seller status");
    } finally {
      setTogglingStatus(false);
    }
  };

  const handleViewProduct = (productId) => {
    window.open(`/products/${productId}`, "_blank");
  };

  // Calculate seller statistics
  const calculateSellerStats = () => {
    const sellerProducts = products || [];
    const orders = userOrders || [];

    const totalRevenue = orders.reduce(
      (sum, order) => sum + (order.finalPrice || 0),
      0
    );
    const totalOrders = orders.length;
    const totalProducts = sellerProducts.length;
    const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    // Product statistics
    const totalStock = sellerProducts.reduce(
      (sum, product) => sum + (product.stock || 0),
      0
    );
    const totalSold = sellerProducts.reduce(
      (sum, product) => sum + (product.sold || 0),
      0
    );
    const outOfStockProducts = sellerProducts.filter(
      (product) => product.stock === 0
    ).length;

    return {
      totalRevenue,
      totalOrders,
      totalProducts,
      avgOrderValue,
      totalStock,
      totalSold,
      outOfStockProducts,
    };
  };

  const stats = calculateSellerStats();

  const getStatusColor = (isActive) => {
    return isActive !== false ? "green" : "red";
  };

  const getStatusText = (isActive) => {
    return isActive !== false ? "Active" : "Inactive";
  };

  // Product columns
  const productColumns = [
    {
      title: "Product",
      dataIndex: "title",
      key: "product",
      render: (title, record) => (
        <div className="flex items-center">
          <Image
            src={record.thumbnail}
            alt={title}
            width={50}
            height={50}
            className="rounded mr-3 object-cover"
            fallback="/placeholder-image.jpg"
            preview={false}
          />
          <div>
            <div className="font-medium">{title}</div>
            <div className="text-gray-500 text-sm">{record.brand}</div>
          </div>
        </div>
      ),
    },
    {
      title: "Category",
      dataIndex: "category",
      key: "category",
      render: (category) => <Tag color="blue">{category}</Tag>,
    },
    {
      title: "Price",
      dataIndex: "price",
      key: "price",
      render: (price) => `$${price}`,
      sorter: (a, b) => a.price - b.price,
    },
    {
      title: "Stock",
      dataIndex: "stock",
      key: "stock",
      render: (stock) => (
        <Tag color={stock > 10 ? "green" : stock > 0 ? "orange" : "red"}>
          {stock}
        </Tag>
      ),
      sorter: (a, b) => a.stock - b.stock,
    },
    {
      title: "Sold",
      dataIndex: "sold",
      key: "sold",
      render: (sold) => sold || 0,
      sorter: (a, b) => (a.sold || 0) - (b.sold || 0),
    },
    {
      title: "Rating",
      dataIndex: "totalRating",
      key: "rating",
      render: (rating) => (rating ? `${rating} ★` : "No ratings"),
      sorter: (a, b) => (a.totalRating || 0) - (b.totalRating || 0),
    },
    {
      title: "Status",
      key: "status",
      render: (_, record) => (
        <Tag color={record.stock > 0 ? "green" : "red"}>
          {record.stock > 0 ? "Active" : "Out of Stock"}
        </Tag>
      ),
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <Space size="small">
          <Button
            size="small"
            icon={<EyeOutlined />}
            onClick={() => handleViewProduct(record._id)}
          >
            View
          </Button>
          <Button
            size="small"
            icon={<EditOutlined />}
            onClick={() =>
              navigate(`/admin/dashboard/products/edit/${record._id}`)
            }
          >
            Edit
          </Button>
        </Space>
      ),
    },
  ];

  // Order columns
  const orderColumns = [
    {
      title: "Order ID",
      dataIndex: "_id",
      key: "_id",
      render: (id) => `#${id?.slice(-8)}`,
    },
    {
      title: "Date",
      dataIndex: "orderDate",
      key: "orderDate",
      render: (date) => new Date(date).toLocaleDateString(),
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
              ? "blue"
              : status === "pending"
                ? "orange"
                : "red";
        return <Tag color={color}>{status?.toUpperCase()}</Tag>;
      },
    },
  ];

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spin size="large" />
      </div>
    );
  }

  if (!userDetails) {
    return (
      <div className="text-center py-8">
        <p>Seller not found</p>
        <Button onClick={() => navigate("/admin/dashboard/sellers")}>
          Back to Sellers
        </Button>
      </div>
    );
  }

  const seller = userDetails;

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <Button
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate("/admin/dashboard/sellers")}
            className="mr-4"
          >
            Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">{seller.name}</h1>
            <p className="text-gray-600">
              Seller Profile • {seller.storeName || "No Store Name"}
            </p>
          </div>
        </div>

        <Space>
          <Button danger icon={<DeleteOutlined />} onClick={showDeleteModal}>
            Delete Seller
          </Button>
        </Space>
      </div>

      {/* Seller Header Card */}
      <Card className="mb-6">
        <Row gutter={[24, 24]} align="middle">
          <Col xs={24} md={6}>
            <div className="text-center">
              <Avatar
                size={100}
                src={seller.avatar?.url}
                icon={<UserOutlined />}
                className="mb-3"
              />
              <div>
                <Badge
                  status={getStatusColor(seller.isActive)}
                  text={getStatusText(seller.isActive)}
                />
              </div>
            </div>
          </Col>
          <Col xs={24} md={18}>
            <Row gutter={[16, 16]}>
              <Col xs={24} sm={12}>
                <div>
                  <h2 className="text-xl font-semibold">{seller.name}</h2>
                  <p className="text-gray-600">{seller.email}</p>
                  {seller.storeName && (
                    <p className="text-blue-600 mt-1">
                      <ShopOutlined className="mr-1" />
                      {seller.storeName}
                    </p>
                  )}
                  <div className="mt-3">
                    <Switch
                      checked={seller.isActive !== false}
                      onChange={handleStatusToggle}
                      checkedChildren="Active"
                      unCheckedChildren="Inactive"
                      loading={togglingStatus}
                      disabled={togglingStatus}
                    />
                    {togglingStatus && (
                      <span className="ml-2 text-gray-500">Updating...</span>
                    )}
                  </div>
                </div>
              </Col>
              <Col xs={24} sm={12}>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Products:</span>
                    <span className="font-semibold">{stats.totalProducts}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Orders:</span>
                    <span className="font-semibold">{stats.totalOrders}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Revenue:</span>
                    <span className="font-semibold">
                      ${stats.totalRevenue.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Avg Order Value:</span>
                    <span className="font-semibold">
                      ${stats.avgOrderValue.toFixed(2)}
                    </span>
                  </div>
                </div>
              </Col>
            </Row>
          </Col>
        </Row>
      </Card>

      {/* Stats Cards */}
      <Row gutter={[16, 16]} className="mb-6">
        <Col xs={12} sm={6}>
          <Card>
            <Statistic
              title="Total Products"
              value={stats.totalProducts}
              prefix={<ProductOutlined />}
              valueStyle={{ color: "#1890ff" }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card>
            <Statistic
              title="Total Revenue"
              value={stats.totalRevenue}
              prefix={<DollarOutlined />}
              valueStyle={{ color: "#3f8600" }}
              precision={2}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card>
            <Statistic
              title="Total Orders"
              value={stats.totalOrders}
              prefix={<ShoppingOutlined />}
              valueStyle={{ color: "#faad14" }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card>
            <Statistic
              title="Products Sold"
              value={stats.totalSold}
              valueStyle={{ color: "#722ed1" }}
            />
          </Card>
        </Col>
      </Row>

      {/* Tabs */}
      <Card>
        <Tabs activeKey={activeTab} onChange={setActiveTab}>
          <TabPane tab="Overview" key="overview">
            <Row gutter={[24, 24]}>
              <Col xs={24} lg={12}>
                <Card title="Product Statistics">
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between mb-1">
                        <span>Stock Distribution</span>
                        <span>{stats.totalStock} units</span>
                      </div>
                      <Progress
                        percent={Math.min(
                          100,
                          (stats.totalStock /
                            (stats.totalStock + stats.totalSold)) *
                            100
                        ).toFixed(2)}
                        status="active"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-3 bg-blue-50 rounded">
                        <div className="text-2xl font-bold text-blue-600">
                          {stats.totalProducts}
                        </div>
                        <div className="text-sm text-gray-600">
                          Total Products
                        </div>
                      </div>
                      <div className="text-center p-3 bg-red-50 rounded">
                        <div className="text-2xl font-bold text-red-600">
                          {stats.outOfStockProducts}
                        </div>
                        <div className="text-sm text-gray-600">
                          Out of Stock
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              </Col>
              <Col xs={24} lg={12}>
                <Card title="Recent Activity">
                  <List
                    dataSource={userOrders?.slice(0, 5) || []}
                    renderItem={(order) => (
                      <List.Item>
                        <List.Item.Meta
                          avatar={
                            <ShoppingOutlined className="text-green-500" />
                          }
                          title={`Order #${order._id?.slice(-8)}`}
                          description={
                            <div className="flex justify-between">
                              <span>${order.finalPrice}</span>
                              <Tag
                                color={
                                  order.status === "delivered"
                                    ? "green"
                                    : order.status === "shipped"
                                      ? "blue"
                                      : "orange"
                                }
                              >
                                {order.status}
                              </Tag>
                            </div>
                          }
                        />
                      </List.Item>
                    )}
                    locale={{ emptyText: "No recent orders" }}
                  />
                </Card>
              </Col>
            </Row>
          </TabPane>

          <TabPane tab={`Products (${products.length})`} key="products">
            <Table
              columns={productColumns}
              dataSource={products}
              rowKey="_id"
              loading={isLoading}
              pagination={{
                pageSize: 10,
                showSizeChanger: true,
                showQuickJumper: true,
              }}
              scroll={{ x: 1000 }}
            />
          </TabPane>

          <TabPane tab={`Orders (${userOrders?.length || 0})`} key="orders">
            <Table
              columns={orderColumns}
              dataSource={userOrders || []}
              rowKey="_id"
              loading={isLoading}
              pagination={{ pageSize: 10 }}
            />
          </TabPane>

          <TabPane tab="Seller Details" key="details">
            <Row gutter={[24, 24]}>
              <Col xs={24} lg={12}>
                <Card title="Store Information">
                  <Descriptions column={1} bordered>
                    <Descriptions.Item label="Store Name">
                      {seller.storeName || "No Store Name"}
                    </Descriptions.Item>
                    <Descriptions.Item label="Store Description">
                      {seller.storeDescription || "No description provided"}
                    </Descriptions.Item>
                    <Descriptions.Item label="Store Category">
                      {seller.storeCategory || "N/A"}
                    </Descriptions.Item>
                  </Descriptions>
                </Card>
              </Col>
              <Col xs={24} lg={12}>
                <Card title="Contact Information">
                  <Descriptions column={1} bordered>
                    <Descriptions.Item label="Email">
                      <div className="flex items-center">
                        <MailOutlined className="mr-2" />
                        {seller.email}
                      </div>
                    </Descriptions.Item>
                    <Descriptions.Item label="Phone">
                      <div className="flex items-center">
                        <PhoneOutlined className="mr-2" />
                        {seller.phone || "Not provided"}
                      </div>
                    </Descriptions.Item>
                    <Descriptions.Item label="Address">
                      <div className="flex items-start">
                        <EnvironmentOutlined className="mr-2 mt-1" />
                        <div>
                          {seller.address ? (
                            <>
                              <div>{seller.address.street}</div>
                              <div>
                                {seller.address.city}, {seller.address.state}
                              </div>
                              <div>
                                {seller.address.zipCode},{" "}
                                {seller.address.country}
                              </div>
                            </>
                          ) : (
                            "Not provided"
                          )}
                        </div>
                      </div>
                    </Descriptions.Item>
                    <Descriptions.Item label="Member Since">
                      <div className="flex items-center">
                        <CalendarOutlined className="mr-2" />
                        {new Date(seller.createdAt).toLocaleDateString()}
                      </div>
                    </Descriptions.Item>
                  </Descriptions>
                </Card>
              </Col>
            </Row>
          </TabPane>
        </Tabs>
      </Card>

      {/* Delete Confirmation Modal */}
      <Modal
        title="Confirm Delete"
        open={deleteModalVisible}
        onOk={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
        okText="Delete"
        okType="danger"
        cancelText="Cancel"
      >
        <div>
          <p>Are you sure you want to delete the seller:</p>
          <p className="font-semibold text-lg mt-2">"{seller.name}"?</p>
          <p className="text-red-500 mt-2">This will permanently remove:</p>
          <ul className="list-disc list-inside text-red-500 mt-2">
            <li>Seller account</li>
            <li>Store information</li>
            <li>All associated products ({stats.totalProducts} products)</li>
            <li>Seller reviews and ratings</li>
          </ul>
          {seller.storeName && (
            <p className="text-orange-500 mt-2">
              Store: "{seller.storeName}" will be permanently deleted.
            </p>
          )}
        </div>
      </Modal>
    </div>
  );
};

export default SellerDetail;
