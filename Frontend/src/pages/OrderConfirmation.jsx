import React, { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { Card, Button, Result, Spin, Descriptions, Tag } from "antd";
import {
  ShoppingOutlined,
  HomeOutlined,
  CheckCircleOutlined,
} from "@ant-design/icons";
import { getOrderById } from "../features/orders/orderSlice";
import confetti from "canvas-confetti";

const OrderConfirmation = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { currentOrder, loading } = useSelector((state) => state.orders);

  useEffect(() => {
    if (orderId) {
      dispatch(getOrderById(orderId));
      var count = 500;
      var defaults = {
        origin: { y: 0.0 },
      };

      function fire(particleRatio, opts) {
        confetti({
          ...defaults,
          ...opts,
          particleCount: Math.floor(count * particleRatio),
        });
      }

      fire(0.25, {
        spread: 160,
        startVelocity: 55,
      });
      fire(0.2, {
        spread: 100,
      });
      fire(0.35, {
        spread: 100,
        decay: 0.91,
        scalar: 0.8,
      });
      fire(0.1, {
        spread: 120,
        startVelocity: 25,
        decay: 0.92,
        scalar: 1.2,
      });
      fire(0.1, {
        spread: 120,
        startVelocity: 45,
      });
    }
  }, [orderId, dispatch]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          <div className="text-center py-12">
            <Spin size="large" />
            <p className="mt-4 text-gray-600">Loading order details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!currentOrder) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          <Result
            status="404"
            title="Order Not Found"
            subTitle="Sorry, the order you are looking for does not exist."
            extra={
              <Button type="primary" onClick={() => navigate("/orders")}>
                View My Orders
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
        <Result
          icon={<CheckCircleOutlined style={{ color: "#52c41a" }} />}
          status="success"
          title="Order Placed Successfully!"
          subTitle={`Order ID: ${currentOrder._id}`}
          extra={[
            <Button
              key="home"
              icon={<HomeOutlined />}
              onClick={() => navigate("/")}
            >
              Back to Home
            </Button>,
            <Button
              key="orders"
              type="primary"
              icon={<ShoppingOutlined />}
              onClick={() => navigate("/orders")}
            >
              View My Orders
            </Button>,
          ]}
        />

        <Card title="Order Details" className="mt-8">
          <Descriptions bordered column={1}>
            <Descriptions.Item label="Order ID">
              {currentOrder._id}
            </Descriptions.Item>
            <Descriptions.Item label="Order Date">
              {new Date(currentOrder.orderDate).toLocaleDateString()}
            </Descriptions.Item>
            <Descriptions.Item label="Status">
              <Tag
                color={
                  currentOrder.status === "pending"
                    ? "orange"
                    : currentOrder.status === "shipped"
                      ? "blue"
                      : currentOrder.status === "delivered"
                        ? "green"
                        : "red"
                }
              >
                {currentOrder.status.toUpperCase()}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Payment Method">
              {currentOrder.paymentMethod}
            </Descriptions.Item>
            <Descriptions.Item label="Total Amount">
              <span className="text-green-600 font-bold">
                ₹{currentOrder.finalPrice}
              </span>
            </Descriptions.Item>
            <Descriptions.Item label="Delivery Address">
              <div>
                <p>{currentOrder.address.house}</p>
                {currentOrder.address.street && (
                  <p>{currentOrder.address.street}</p>
                )}
                {currentOrder.address.landmark && (
                  <p>Near {currentOrder.address.landmark}</p>
                )}
                <p>
                  {currentOrder.address.city}, {currentOrder.address.state} -{" "}
                  {currentOrder.address.pincode}
                </p>
                <p>{currentOrder.address.country}</p>
              </div>
            </Descriptions.Item>
          </Descriptions>
        </Card>
      </div>
    </div>
  );
};

export default OrderConfirmation;
