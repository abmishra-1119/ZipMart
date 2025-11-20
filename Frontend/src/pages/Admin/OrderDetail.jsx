import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import {
  Card,
  Descriptions,
  Button,
  Table,
  Tag,
  Space,
  Modal,
  Spin,
  Row,
  Col,
  Statistic,
  Timeline,
  Alert,
  Image,
  Select,
  Input,
  Form,
  Steps,
} from "antd";
import {
  ArrowLeftOutlined,
  DeleteOutlined,
  ShoppingOutlined,
  DollarOutlined,
  PhoneOutlined,
  EnvironmentOutlined,
  FileTextOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  SyncOutlined,
} from "@ant-design/icons";
import {
  adminGetOrdersBId,
  adminDeleteOrder,
  adminUpdateRefund,
} from "../../features/admin/adminSlice";
import { toast } from "react-toastify";

const { Option } = Select;
const { TextArea } = Input;

const OrderDetail = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [form] = Form.useForm();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  // Modal states
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [refundModalVisible, setRefundModalVisible] = useState(false);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        setLoading(true);
        const res = await dispatch(adminGetOrdersBId(orderId)).unwrap();
        setOrder(res);
      } catch (error) {
        toast.error(error?.message || "Failed to fetch order");
        navigate("/admin/dashboard/orders");
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [orderId, dispatch, navigate]);

  const confirmDeleteOrder = async () => {
    try {
      await dispatch(adminDeleteOrder(orderId)).unwrap();
      toast.success("Order deleted successfully");
      navigate("/admin/dashboard/orders");
    } catch (error) {
      toast.error(error?.message || "Failed to delete order");
    }
    setDeleteModalVisible(false);
  };

  const isRefundablePayment = (order) => {
    return (
      order && order.paymentMethod !== "COD" && order.status === "cancelled"
    );
  };

  const handleRefundUpdate = () => {
    if (!isRefundablePayment(order)) {
      toast.warning("This order is not eligible for refund processing");
      return;
    }
    setRefundModalVisible(true);
    form.setFieldsValue({
      refundProcess: order.refundProcess || "initiated",
      refundMsg: order.refundMsg || "",
    });
  };

  const confirmRefundUpdate = async () => {
    try {
      const values = await form.validateFields();

      await dispatch(
        adminUpdateRefund({
          orderId,
          status: "cancelled", // Keep status as cancelled
          refundProcess: values.refundProcess,
          refundMsg: values.refundMsg,
        })
      ).unwrap();

      toast.success(`Refund process updated to ${values.refundProcess}`);
      setRefundModalVisible(false);

      // Refresh order data
      const updatedOrder = await dispatch(adminGetOrdersBId(orderId)).unwrap();
      setOrder(updatedOrder);
    } catch (error) {
      if (error.errorFields) {
        toast.error("Please fill all required fields");
      } else {
        toast.error(error?.message || "Failed to update refund process");
      }
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "delivered":
        return "green";
      case "shipped":
        return "blue";
      case "processing":
        return "orange";
      case "pending":
        return "yellow";
      case "cancelled":
        return "red";
      case "refunded":
        return "purple";
      default:
        return "default";
    }
  };

  const getRefundProcessColor = (process) => {
    switch (process) {
      case "completed":
        return "green";
      case "processing":
        return "blue";
      case "initiated":
        return "orange";
      case "failed":
        return "red";
      default:
        return "default";
    }
  };

  const getRefundProcessText = (process) => {
    switch (process) {
      case "initiated":
        return "Refund Initiated";
      case "processing":
        return "Processing Refund";
      case "completed":
        return "Refund Completed";
      case "failed":
        return "Refund Failed";
      default:
        return process || "Not Started";
    }
  };

  const getRefundSteps = (order) => {
    if (!isRefundablePayment(order)) return [];

    const steps = [
      {
        title: "Refund Initiated",
        description: "Refund request received",
        status: order.refundProcess ? "finish" : "wait",
      },
      {
        title: "Processing",
        description: "Refund being processed",
        status:
          order.refundProcess === "processing"
            ? "process"
            : order.refundProcess === "completed"
              ? "finish"
              : "wait",
      },
      {
        title: "Completed",
        description: "Refund completed",
        status: order.refundProcess === "completed" ? "finish" : "wait",
      },
    ];

    return steps;
  };

  const productColumns = [
    {
      title: "Product",
      dataIndex: "productId",
      key: "product",
      render: (product) => (
        <div className="flex items-center">
          <Image
            src={product?.thumbnail}
            alt={product?.title}
            width={50}
            height={50}
            className="rounded mr-3 object-cover"
            fallback="/placeholder-image.jpg"
            preview={false}
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
      dataIndex: "productId",
      key: "price",
      render: (product) => `₹${product?.price || 0}`,
    },
    {
      title: "Quantity",
      dataIndex: "count",
      key: "quantity",
      render: (count) => <span className="font-semibold">{count}</span>,
    },
    {
      title: "Total",
      key: "total",
      render: (_, record) =>
        `₹${((record.productId?.price || 0) * (record.count || 0)).toFixed(2)}`,
    },
  ];

  const orderTimeline = [
    {
      color: "green",
      children: (
        <div>
          <p className="font-medium">Order Placed</p>
          <p className="text-gray-500 text-sm">
            {order ? new Date(order.createdAt).toLocaleString() : ""}
          </p>
        </div>
      ),
    },
    {
      color: ["processing", "shipped", "delivered"].includes(order?.status)
        ? "blue"
        : "gray",
      children: (
        <div>
          <p className="font-medium">Processing</p>
          <p className="text-gray-500 text-sm">
            {order?.status !== "pending"
              ? "Order is being processed"
              : "Pending processing"}
          </p>
        </div>
      ),
    },
    {
      color: ["shipped", "delivered"].includes(order?.status) ? "blue" : "gray",
      children: (
        <div>
          <p className="font-medium">Shipped</p>
          <p className="text-gray-500 text-sm">
            {["shipped", "delivered"].includes(order?.status)
              ? "Order has been shipped"
              : "Not shipped yet"}
          </p>
        </div>
      ),
    },
    {
      color: order?.status === "delivered" ? "green" : "gray",
      children: (
        <div>
          <p className="font-medium">Delivered</p>
          <p className="text-gray-500 text-sm">
            {order?.status === "delivered"
              ? "Order has been delivered"
              : "Not delivered yet"}
          </p>
        </div>
      ),
    },
    ...(order?.status === "cancelled"
      ? [
          {
            color: "red",
            children: (
              <div>
                <p className="font-medium">Cancelled</p>
                <p className="text-gray-500 text-sm">
                  Order has been cancelled
                  {isRefundablePayment(order) && order.refundProcess && (
                    <div className="mt-1">
                      <Tag color={getRefundProcessColor(order.refundProcess)}>
                        {getRefundProcessText(order.refundProcess)}
                      </Tag>
                    </div>
                  )}
                </p>
              </div>
            ),
          },
        ]
      : []),
  ];

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spin size="large" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="text-center py-8">
        <Alert
          message="Order Not Found"
          description="The order you are looking for does not exist or has been deleted."
          type="error"
          showIcon
        />
        <Button
          onClick={() => navigate("/admin/dashboard/orders")}
          className="mt-4"
        >
          Back to Orders
        </Button>
      </div>
    );
  }

  return (
    <div>
      {/* Delete Modal */}
      <Modal
        title="Delete Order"
        open={deleteModalVisible}
        onOk={confirmDeleteOrder}
        onCancel={() => setDeleteModalVisible(false)}
        okText="Yes, Delete"
        okType="danger"
        cancelText="Cancel"
      >
        <p>
          Are you sure you want to delete order:{" "}
          <strong>#{order?._id?.slice(-8)}</strong> ?
        </p>
        <p>This action cannot be undone.</p>
      </Modal>

      {/* Refund Update Modal */}
      <Modal
        title="Update Refund Process"
        open={refundModalVisible}
        onOk={confirmRefundUpdate}
        onCancel={() => setRefundModalVisible(false)}
        okText="Update Refund"
        cancelText="Cancel"
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          initialValues={{
            refundProcess: order.refundProcess || "initiated",
            refundMsg: order.refundMsg || "",
          }}
        >
          <Form.Item
            label="Refund Process Status"
            name="refundProcess"
            rules={[
              {
                required: true,
                message: "Please select refund process status",
              },
            ]}
          >
            <Select>
              <Option value="initiated">Initiated</Option>
              <Option value="processing">Processing</Option>
              <Option value="completed">Completed</Option>
              <Option value="failed">Failed</Option>
            </Select>
          </Form.Item>

          <Form.Item
            label="Refund Message"
            name="refundMsg"
            rules={[{ required: true, message: "Please enter refund message" }]}
          >
            <TextArea
              rows={4}
              placeholder="Enter refund status message for customer (e.g., 'Refund will be processed in 7 working days')"
            />
          </Form.Item>

          {isRefundablePayment(order) && (
            <Alert
              message="Refund Information"
              description={`Refund amount: ₹${order.finalPrice} will be processed to customer's original payment method.`}
              type="info"
              showIcon
            />
          )}
        </Form>
      </Modal>

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <Button
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate("/admin/dashboard/orders")}
            className="mr-4"
          >
            Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">
              Order #{order._id?.slice(-8)}
            </h1>
            <p className="text-gray-600">Order details and management</p>
          </div>
        </div>

        <Space>
          {isRefundablePayment(order) && (
            <Button
              type="primary"
              icon={<DollarOutlined />}
              onClick={handleRefundUpdate}
            >
              Update Refund
            </Button>
          )}
          <Button
            danger
            icon={<DeleteOutlined />}
            onClick={() => setDeleteModalVisible(true)}
          >
            Delete Order
          </Button>
        </Space>
      </div>

      <Row gutter={[24, 24]}>
        {/* Order Summary */}
        <Col xs={24} lg={8}>
          <Row gutter={[16, 16]}>
            <Col xs={12}>
              <Card>
                <Statistic
                  title="Total Amount"
                  value={order.finalPrice || 0}
                  prefix="₹"
                  valueStyle={{ color: "#3f8600" }}
                  precision={2}
                />
              </Card>
            </Col>

            <Col xs={12}>
              <Card>
                <Statistic
                  title="Items"
                  value={order.products?.length || 0}
                  prefix={<ShoppingOutlined />}
                  valueStyle={{ color: "#1890ff" }}
                />
              </Card>
            </Col>

            <Col xs={24}>
              <Card title="Order Status">
                <div className="text-center">
                  <Tag
                    color={getStatusColor(order.status)}
                    className="text-lg px-4 py-1"
                  >
                    {order.status?.toUpperCase()}
                  </Tag>
                  {isRefundablePayment(order) && order.refundProcess && (
                    <div className="mt-2">
                      <Tag color={getRefundProcessColor(order.refundProcess)}>
                        {getRefundProcessText(order.refundProcess)}
                      </Tag>
                    </div>
                  )}
                </div>
              </Card>
            </Col>

            {/* Refund Status Card */}
            {isRefundablePayment(order) && (
              <Col xs={24}>
                <Card
                  title="Refund Process"
                  extra={<DollarOutlined className="text-green-600" />}
                >
                  <Steps
                    direction="vertical"
                    size="small"
                    current={
                      order.refundProcess === "initiated"
                        ? 0
                        : order.refundProcess === "processing"
                          ? 1
                          : order.refundProcess === "completed"
                            ? 2
                            : 0
                    }
                    items={getRefundSteps(order)}
                  />

                  {order.refundMsg && (
                    <Alert
                      message="Customer Message"
                      description={order.refundMsg}
                      type="info"
                      showIcon
                      className="mt-3"
                    />
                  )}

                  <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">Refund Amount:</span>
                      <span className="text-green-600 font-bold">
                        ₹{order.finalPrice}
                      </span>
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      Payment Method: {order.paymentMethod}
                    </div>
                  </div>
                </Card>
              </Col>
            )}
          </Row>
        </Col>

        {/* Order Information */}
        <Col xs={24} lg={16}>
          <div className="mb-6">
            <Card title="Order Information">
              <Descriptions
                bordered
                column={{ xs: 1, sm: 2, md: 2, lg: 2, xl: 2 }}
                labelStyle={{ whiteSpace: "normal" }}
                contentStyle={{ whiteSpace: "normal" }}
              >
                <Descriptions.Item label="Order ID">
                  <span className="whitespace-nowrap select-text">
                    #{order?._id?.slice(-8) || "N/A"}
                  </span>
                </Descriptions.Item>

                <Descriptions.Item label="Order Date">
                  <span className="break-normal">
                    {order.orderDate || order.createdAt
                      ? new Date(
                          order.orderDate || order.createdAt
                        ).toLocaleString()
                      : "N/A"}
                  </span>
                </Descriptions.Item>

                <Descriptions.Item label="Name">
                  <span className="break-words select-text max-w-full block">
                    {order.user?.name || "N/A"}
                  </span>
                </Descriptions.Item>

                <Descriptions.Item label="Customer Email">
                  <span className="break-all select-text max-w-full block">
                    {order.user?.email || "N/A"}
                  </span>
                </Descriptions.Item>

                <Descriptions.Item label="Payment Method">
                  {order.paymentMethod || "N/A"}
                  {isRefundablePayment(order) && (
                    <Tag color="green" className="ml-2">
                      Refund Eligible
                    </Tag>
                  )}
                </Descriptions.Item>

                {isRefundablePayment(order) && order.refundProcess && (
                  <Descriptions.Item label="Refund Status">
                    <Tag color={getRefundProcessColor(order.refundProcess)}>
                      {getRefundProcessText(order.refundProcess)}
                    </Tag>
                  </Descriptions.Item>
                )}
              </Descriptions>
            </Card>
          </div>

          {/* Shipping Information */}
          <div className="mb-6">
            <Card title="Shipping Information">
              <Descriptions column={1} bordered>
                <Descriptions.Item label="Shipping Address">
                  <div className="flex items-start">
                    <EnvironmentOutlined className="mr-2 mt-1" />
                    <div>
                      <div>
                        {order.address?.house} {order.address?.street}
                      </div>
                      <div>
                        {order.address?.landmark &&
                          `Near ${order.address.landmark}`}
                      </div>
                      <div>
                        {order.address?.city}, {order.address?.state} -{" "}
                        {order.address?.pincode}
                      </div>
                      <div>{order.address?.country}</div>
                    </div>
                  </div>
                </Descriptions.Item>

                <Descriptions.Item label="Contact">
                  <div className="flex items-center">
                    <PhoneOutlined className="mr-2" />
                    {order.user?.phone || "N/A"}
                  </div>
                </Descriptions.Item>
              </Descriptions>
            </Card>
          </div>
        </Col>

        {/* Order Timeline */}
        <Col xs={24} lg={12}>
          <Card title="Order Timeline">
            <Timeline items={orderTimeline} />
          </Card>
        </Col>

        {/* Order Items */}
        <Col xs={24} lg={12}>
          <Card title="Order Items">
            <Table
              columns={productColumns}
              dataSource={order.products || []}
              rowKey={(record) => `${record.productId?._id}-${record.count}`}
              pagination={false}
              summary={(pageData) => {
                const total = pageData.reduce((sum, item) => {
                  return sum + (item.productId?.price || 0) * (item.count || 0);
                }, 0);

                return (
                  <Table.Summary>
                    <Table.Summary.Row>
                      <Table.Summary.Cell index={0} colSpan={3}>
                        <strong>Total</strong>
                      </Table.Summary.Cell>
                      <Table.Summary.Cell index={1}>
                        <strong>₹{total.toFixed(2)}</strong>
                      </Table.Summary.Cell>
                    </Table.Summary.Row>
                  </Table.Summary>
                );
              }}
            />
          </Card>
        </Col>

        {/* Refund Notes */}
        {order.refundMsg && (
          <Col xs={24}>
            <Card title="Refund Information">
              <div className="p-4 bg-blue-50 rounded border">
                <FileTextOutlined className="mr-2 text-blue-600" />
                <span className="text-blue-800">{order.refundMsg}</span>
              </div>
            </Card>
          </Col>
        )}
      </Row>
    </div>
  );
};

export default OrderDetail;
