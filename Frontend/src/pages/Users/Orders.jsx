import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  Row,
  Col,
  Card,
  Button,
  Empty,
  Spin,
  Alert,
  Tag,
  Divider,
  Modal,
  Tabs,
  Badge,
} from "antd";
import {
  ArrowLeftOutlined,
  EyeOutlined,
  CloseOutlined,
  ShoppingOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import { getMyOrders, cancelOrder } from "../../features/orders/orderSlice";
import { toast } from "react-toastify";

const { TabPane } = Tabs;

const OrdersPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { orders, loading, error } = useSelector((state) => state.orders);
  const { isAuthenticated } = useSelector((state) => state.auth);

  const [activeTab, setActiveTab] = useState("all");
  const [cancellingOrder, setCancellingOrder] = useState(null);
  const [cancelModalVisible, setCancelModalVisible] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);

  useEffect(() => {
    if (isAuthenticated) {
      dispatch(getMyOrders());
    }
  }, [dispatch, isAuthenticated]);

  const handleCancelClick = (order) => {
    setSelectedOrder(order);
    setCancelModalVisible(true);
  };

  const handleConfirmCancel = async () => {
    if (!selectedOrder) return;

    setCancellingOrder(selectedOrder._id);
    try {
      await dispatch(cancelOrder(selectedOrder._id)).unwrap();
      toast.success("Order cancelled successfully");
      setCancelModalVisible(false);
      setSelectedOrder(null);
    } catch (error) {
      toast.error(error || "Failed to cancel order");
    } finally {
      setCancellingOrder(null);
    }
  };

  const handleCancelModal = () => {
    setCancelModalVisible(false);
    setSelectedOrder(null);
  };

  const handleViewOrderDetails = (orderId) => {
    navigate(`/orders/${orderId}`);
  };

  const handleRefreshOrders = () => {
    dispatch(getMyOrders());
  };

  // Filter orders based on active tab
  const filteredOrders = orders.filter((order) => {
    switch (activeTab) {
      case "pending":
        return order.status === "pending";
      case "shipped":
        return order.status === "shipped";
      case "delivered":
        return order.status === "delivered";
      case "cancelled":
        return order.status === "cancelled";
      default:
        return true;
    }
  });

  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "orange";
      case "shipped":
        return "blue";
      case "delivered":
        return "green";
      case "cancelled":
        return "red";
      case "refund":
        return "purple";
      case "refunded":
        return "purple";
      default:
        return "default";
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case "pending":
        return "Pending";
      case "shipped":
        return "Shipped";
      case "delivered":
        return "Delivered";
      case "cancelled":
        return "Cancelled";
      case "refund":
        return "Refund Requested";
      case "refunded":
        return "Refunded";
      default:
        return status;
    }
  };

  const canCancelOrder = (order) => {
    return order.status === "pending";
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          <Alert
            toast="Authentication Required"
            description="Please log in to view your orders."
            type="warning"
            showIcon
            action={
              <Button type="primary" onClick={() => navigate("/login")}>
                Login Now
              </Button>
            }
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <Button
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate(-1)}
            className="mb-4"
          >
            Back
          </Button>

          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">
                My Orders
              </h1>
              <p className="text-gray-600">Track and manage your orders</p>
            </div>

            <Button
              icon={<ReloadOutlined />}
              onClick={handleRefreshOrders}
              loading={loading}
            >
              Refresh
            </Button>
          </div>
        </div>

        {error && (
          <Alert toast={error} type="error" closable className="mb-6" />
        )}

        {/* Orders Tabs */}
        <div className="shadow-sm">
          <Card>
            <Tabs activeKey={activeTab} onChange={setActiveTab} type="card">
              <TabPane
                tab={
                  <span>
                    All Orders
                    <Badge
                      count={orders.length}
                      showZero
                      style={{ marginLeft: 8 }}
                    />
                  </span>
                }
                key="all"
              />
              <TabPane
                tab={
                  <span>
                    Pending
                    <Badge
                      count={
                        orders.filter((o) => o.status === "pending").length
                      }
                      showZero
                      style={{ marginLeft: 8 }}
                    />
                  </span>
                }
                key="pending"
              />
              <TabPane
                tab={
                  <span>
                    Shipped
                    <Badge
                      count={
                        orders.filter((o) => o.status === "shipped").length
                      }
                      showZero
                      style={{ marginLeft: 8 }}
                    />
                  </span>
                }
                key="shipped"
              />
              <TabPane
                tab={
                  <span>
                    Delivered
                    <Badge
                      count={
                        orders.filter((o) => o.status === "delivered").length
                      }
                      showZero
                      style={{ marginLeft: 8 }}
                    />
                  </span>
                }
                key="delivered"
              />
              <TabPane
                tab={
                  <span>
                    Cancelled
                    <Badge
                      count={
                        orders.filter((o) => o.status === "cancelled").length
                      }
                      showZero
                      style={{ marginLeft: 8 }}
                    />
                  </span>
                }
                key="cancelled"
              />
            </Tabs>

            {loading ? (
              <div className="flex justify-center items-center py-12">
                <Spin size="large" tip="Loading your orders..." />
              </div>
            ) : filteredOrders.length > 0 ? (
              <div className="space-y-4 mt-4">
                {filteredOrders.map((order) => (
                  <OrderCard
                    key={order._id}
                    order={order}
                    onViewDetails={handleViewOrderDetails}
                    onCancelOrder={handleCancelClick}
                    cancellingOrder={cancellingOrder}
                    getStatusColor={getStatusColor}
                    getStatusText={getStatusText}
                    canCancelOrder={canCancelOrder}
                  />
                ))}
              </div>
            ) : (
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description={
                  <div className="space-y-4">
                    <p className="text-lg text-gray-600">
                      {activeTab === "all"
                        ? "You haven't placed any orders yet"
                        : `No ${activeTab} orders found`}
                    </p>
                    {activeTab === "all" && (
                      <Button
                        type="primary"
                        icon={<ShoppingOutlined />}
                        onClick={() => navigate("/products")}
                      >
                        Start Shopping
                      </Button>
                    )}
                  </div>
                }
                className="py-12"
              />
            )}
          </Card>
        </div>

        {/* Cancel Order Modal */}
        <Modal
          title="Cancel Order"
          open={cancelModalVisible}
          onOk={handleConfirmCancel}
          onCancel={handleCancelModal}
          confirmLoading={cancellingOrder !== null}
          okText="Yes, Cancel Order"
          cancelText="Keep Order"
          okType="danger"
        >
          {selectedOrder && (
            <div className="space-y-4">
              <Alert
                toast="Are you sure you want to cancel this order?"
                description="This action cannot be undone. You may be charged a cancellation fee depending on the order status."
                type="warning"
                showIcon
              />
              <div className="bg-gray-50 p-4 rounded-lg">
                <p>
                  <strong>Order ID:</strong> {selectedOrder._id}
                </p>
                <p>
                  <strong>Order Date:</strong>{" "}
                  {new Date(selectedOrder.orderDate).toLocaleDateString()}
                </p>
                <p>
                  <strong>Total Amount:</strong> ₹{selectedOrder.finalPrice}
                </p>
                <p>
                  <strong>Items:</strong>{" "}
                  {selectedOrder.products.reduce(
                    (total, product) => total + product.count,
                    0
                  )}{" "}
                  item(s)
                </p>
              </div>
            </div>
          )}
        </Modal>
      </div>
    </div>
  );
};

// Order Card Component
const OrderCard = ({
  order,
  onViewDetails,
  onCancelOrder,
  cancellingOrder,
  getStatusColor,
  getStatusText,
  canCancelOrder,
}) => {
  const itemsCount = order.products.reduce(
    (total, product) => total + product.count,
    0
  );

  return (
    <div className="border-l-4 border-l-blue-500 hover:shadow-md transition-shadow">
      <Card>
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
          {/* Order Info */}
          <div className="flex-1">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 mb-3">
              <div>
                <h3 className="text-lg font-semibold text-gray-800">
                  Order #{order._id}
                </h3>
                <p className="text-gray-600 text-sm">
                  Placed on {new Date(order.orderDate).toLocaleDateString()}
                </p>
              </div>
              <Tag
                color={getStatusColor(order.status)}
                className="text-sm font-medium"
              >
                {getStatusText(order.status)}
              </Tag>
            </div>

            {/* Products Preview */}
            <div className="mb-3">
              <p className="text-gray-700 mb-2">
                {itemsCount} item(s) • ₹{order.finalPrice}
              </p>
              <div className="flex flex-wrap gap-2">
                {order.products.slice(0, 3).map((product, index) => (
                  <span
                    key={index}
                    className="text-sm text-gray-600 bg-gray-100 px-2 py-1 rounded"
                  >
                    {product.count} × {product.productId?.title || "Product"}
                  </span>
                ))}
                {order.products.length > 3 && (
                  <span className="text-sm text-gray-500">
                    +{order.products.length - 3} more
                  </span>
                )}
              </div>
            </div>

            {/* Delivery Address */}
            <div className="text-sm text-gray-600">
              <p>
                Deliver to: {order.address.city}, {order.address.state}
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row lg:flex-col gap-2">
            <Button
              icon={<EyeOutlined />}
              onClick={() => onViewDetails(order._id)}
              className="flex items-center justify-center"
            >
              View Details
            </Button>

            {canCancelOrder(order) && (
              <Button
                danger
                icon={<CloseOutlined />}
                loading={cancellingOrder === order._id}
                onClick={() => onCancelOrder(order)}
                disabled={cancellingOrder === order._id}
                className="flex items-center justify-center"
              >
                Cancel Order
              </Button>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
};

export default OrdersPage;
