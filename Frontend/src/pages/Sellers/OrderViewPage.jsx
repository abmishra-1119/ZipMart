import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  Card,
  Descriptions,
  Tag,
  Button,
  Space,
  Table,
  Divider,
  Timeline,
  Row,
  Col,
  Statistic,
  Modal,
  Select,
  Spin,
  Alert,
} from "antd";
import {
  ArrowLeftOutlined,
  EyeOutlined,
  TruckOutlined,
  CheckCircleOutlined,
  CloseOutlined,
  DollarOutlined,
  UserOutlined,
  PhoneOutlined,
  EnvironmentOutlined,
} from "@ant-design/icons";
import { updateOrderStatus } from "../../features/seller/sellerSlice";
import { toast } from "react-toastify";

const { Option } = Select;

const OrderViewPage = () => {
  const { orderId } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { orders, isLoading } = useSelector((state) => state.seller);

  const [order, setOrder] = useState(null);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  useEffect(() => {
    const foundOrder = orders.find((o) => o._id === orderId);
    if (foundOrder) {
      setOrder(foundOrder);
    } else {
      toast.error("Order not found");
      navigate("/seller/orders");
    }
  }, [orderId, orders, navigate]);

  const handleUpdateStatus = async (newStatus) => {
    setUpdatingStatus(true);
    try {
      await dispatch(
        updateOrderStatus({ orderId, status: newStatus })
      ).unwrap();
      toast.success(`Order status updated to ${newStatus}`);
      // Update local order state
      setOrder((prev) => ({ ...prev, status: newStatus }));
    } catch (error) {
      toast.error(error || "Failed to update order status");
    } finally {
      setUpdatingStatus(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "orange";
      case "confirmed":
        return "blue";
      case "shipped":
        return "cyan";
      case "delivered":
        return "green";
      case "cancelled":
        return "red";
      default:
        return "default";
    }
  };

  const getStatusOptions = (currentStatus) => {
    const statusFlow = {
      pending: ["confirmed", "cancelled"],
      confirmed: ["shipped", "cancelled"],
      shipped: ["delivered"],
      delivered: [],
      cancelled: [],
    };
    return statusFlow[currentStatus] || [];
  };

  const getTimelineItems = (order) => {
    if (!order) return [];

    const items = [
      {
        color: "green",
        children: (
          <div>
            <p className="font-medium">Order Placed</p>
            <p className="text-gray-600 text-sm">
              {new Date(order.orderDate).toLocaleString()}
            </p>
          </div>
        ),
      },
    ];

    if (
      order.status === "confirmed" ||
      order.status === "shipped" ||
      order.status === "delivered"
    ) {
      items.push({
        color: "blue",
        children: (
          <div>
            <p className="font-medium">Order Confirmed</p>
            <p className="text-gray-600 text-sm">Order has been confirmed</p>
          </div>
        ),
      });
    }

    if (order.status === "shipped" || order.status === "delivered") {
      items.push({
        color: "cyan",
        children: (
          <div>
            <p className="font-medium">Order Shipped</p>
            <p className="text-gray-600 text-sm">Your order is on the way</p>
          </div>
        ),
      });
    }

    if (order.status === "delivered") {
      items.push({
        color: "green",
        children: (
          <div>
            <p className="font-medium">Delivered</p>
            <p className="text-gray-600 text-sm">
              Order delivered successfully
            </p>
          </div>
        ),
      });
    }

    if (order.status === "cancelled") {
      items.push({
        color: "red",
        children: (
          <div>
            <p className="font-medium">Order Cancelled</p>
            <p className="text-gray-600 text-sm">Order has been cancelled</p>
          </div>
        ),
      });
    }

    return items;
  };

  const productColumns = [
    {
      title: "Product",
      dataIndex: "productId",
      key: "product",
      render: (product) => (
        <div className="flex items-center">
          <img
            src={product?.thumbnail || "/placeholder-image.jpg"}
            alt={product?.title}
            className="w-12 h-12 rounded mr-3 object-cover"
          />
          <div>
            <div className="font-medium">{product?.title}</div>
            <div className="text-gray-500 text-sm">{product?.brand}</div>
          </div>
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
      title: "Quantity",
      dataIndex: "count",
      key: "count",
    },
    {
      title: "Total",
      key: "total",
      render: (_, record) => `₹${(record.price * record.count).toFixed(2)}`,
    },
    {
      title: "Seller",
      dataIndex: "sellerId",
      key: "seller",
      render: (seller) => seller?.name || "N/A",
    },
  ];

  if (!order) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <Button
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate("/seller/orders")}
            className="mr-4"
          >
            Back to Orders
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">
              Order #{order._id.slice(-8)}
            </h1>
            <p className="text-gray-600">
              Order placed on {new Date(order.orderDate).toLocaleDateString()}
            </p>
          </div>
        </div>

        <Space>
          <Tag
            color={getStatusColor(order.status)}
            className="text-lg px-4 py-1"
          >
            {order.status.toUpperCase()}
          </Tag>
        </Space>
      </div>

      <Row gutter={[24, 24]}>
        {/* Order Timeline & Actions */}
        <Col xs={24} lg={8}>
          <Card title="Order Timeline" className="mb-6">
            <Timeline items={getTimelineItems(order)} />
          </Card>

          {/* Order Actions */}
          <Card title="Order Actions">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-medium">Update Status:</span>
                <Select
                  value={order.status}
                  style={{ width: 140 }}
                  onChange={handleUpdateStatus}
                  loading={updatingStatus}
                  disabled={
                    updatingStatus ||
                    getStatusOptions(order.status).length === 0
                  }
                >
                  {getStatusOptions(order.status).map((status) => (
                    <Option key={status} value={status}>
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </Option>
                  ))}
                </Select>
              </div>

              <Divider />

              <Space direction="vertical" style={{ width: "100%" }}>
                <Button
                  icon={<TruckOutlined />}
                  type="primary"
                  block
                  onClick={() => handleUpdateStatus("shipped")}
                  loading={updatingStatus}
                  disabled={order.status !== "confirmed"}
                >
                  Mark as Shipped
                </Button>

                <Button
                  icon={<CheckCircleOutlined />}
                  type="primary"
                  block
                  onClick={() => handleUpdateStatus("delivered")}
                  loading={updatingStatus}
                  disabled={order.status !== "shipped"}
                >
                  Mark as Delivered
                </Button>

                <Button
                  icon={<CloseOutlined />}
                  danger
                  block
                  onClick={() => handleUpdateStatus("cancelled")}
                  loading={updatingStatus}
                  disabled={
                    order.status === "delivered" || order.status === "cancelled"
                  }
                >
                  Cancel Order
                </Button>
              </Space>
            </div>
          </Card>
        </Col>

        {/* Order Details */}
        <Col xs={24} lg={16}>
          {/* Order Summary */}
          <Card title="Order Summary" className="mb-6">
            <Row gutter={[16, 16]}>
              <Col xs={12} sm={6}>
                <Statistic
                  title="Total Amount"
                  value={order.finalPrice}
                  prefix={<DollarOutlined />}
                  valueStyle={{ color: "#3f8600" }}
                />
              </Col>
              <Col xs={12} sm={6}>
                <Statistic
                  title="Items"
                  value={order?.products?.reduce(
                    (sum, item) => sum + item.count,
                    0
                  )}
                />
              </Col>
              <Col xs={12} sm={6}>
                <Statistic title="Payment Method" value={order.paymentMethod} />
              </Col>
              <Col xs={12} sm={6}>
                <Statistic
                  title="Order Date"
                  value={new Date(order.orderDate).toLocaleDateString()}
                />
              </Col>
            </Row>
          </Card>

          {/* Customer Information */}
          <Card title="Customer Information" className="mb-6">
            <Descriptions bordered column={1} size="small">
              <Descriptions.Item label="Customer Name">
                <Space>
                  <UserOutlined />
                  {order.user?.name}
                </Space>
              </Descriptions.Item>
              <Descriptions.Item label="Email">
                {order.user?.email}
              </Descriptions.Item>
              <Descriptions.Item label="Customer Since">
                {order.user?.createdAt
                  ? new Date(order.user.createdAt).toLocaleDateString()
                  : "N/A"}
              </Descriptions.Item>
            </Descriptions>
          </Card>

          {/* Shipping Address */}
          <Card title="Shipping Address" className="mb-6">
            <div className="space-y-2">
              <p className="font-semibold flex items-center">
                <EnvironmentOutlined className="mr-2" />
                {order.address.house}
              </p>
              {order.address.street && (
                <p className="text-gray-700">{order.address.street}</p>
              )}
              {order.address.landmark && (
                <p className="text-gray-600">Near {order.address.landmark}</p>
              )}
              <p className="text-gray-700">
                {order.address.city}, {order.address.state} -{" "}
                {order.address.pincode}
              </p>
              <p className="text-gray-600">{order.address.country}</p>
            </div>
          </Card>

          {/* Order Items */}
          <Card title="Order Items">
            <Table
              columns={productColumns}
              dataSource={order.products.map((item, index) => ({
                ...item,
                key: index,
              }))}
              pagination={false}
              scroll={{ x: 800 }}
            />

            <Divider />

            <div className="text-right space-y-2">
              <div className="flex justify-between max-w-xs ml-auto">
                <span className="text-gray-600">Subtotal:</span>
                <span>₹{order.totalPrice?.toFixed(2)}</span>
              </div>
              {order.discount > 0 && (
                <div className="flex justify-between max-w-xs ml-auto">
                  <span className="text-gray-600">Discount:</span>
                  <span className="text-red-600">
                    -₹{order.discount?.toFixed(2)}
                  </span>
                </div>
              )}
              <div className="flex justify-between max-w-xs ml-auto text-lg font-bold">
                <span>Total:</span>
                <span className="text-green-600">
                  ₹{order.finalPrice?.toFixed(2)}
                </span>
              </div>
            </div>
          </Card>
        </Col>
      </Row>

      {/* Additional Actions */}
      <Card className="mt-6">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="font-semibold">Need Help with this Order?</h3>
            <p className="text-gray-600">
              Contact support if you need assistance
            </p>
          </div>
          <Space>
            <Button>Print Invoice</Button>
            <Button type="primary">Contact Support</Button>
          </Space>
        </div>
      </Card>
    </div>
  );
};

export default OrderViewPage;
