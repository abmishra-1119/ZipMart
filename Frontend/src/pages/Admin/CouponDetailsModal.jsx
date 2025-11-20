import React from "react";
import { Modal, Descriptions, Tag, Statistic, Row, Col } from "antd";
import moment from "moment";
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  ClockCircleOutlined,
} from "@ant-design/icons";

const CouponDetailsModal = ({ visible, coupon, onCancel }) => {
  if (!coupon) return null;

  const isExpired =
    coupon.expiryDate && moment(coupon.expiryDate).isBefore(moment());
  const isValid = coupon.isActive && !isExpired;

  return (
    <Modal
      title="Coupon Details"
      open={visible}
      onCancel={onCancel}
      footer={null}
      width={700}
    >
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12}>
          <Statistic
            title="Discount"
            value={coupon.discount}
            suffix="%"
            valueStyle={{ color: "#3f8600" }}
          />
        </Col>
        <Col xs={24} sm={12}>
          <Statistic
            title="Status"
            value={isValid ? "Valid" : "Invalid"}
            valueStyle={{ color: isValid ? "#3f8600" : "#cf1322" }}
          />
        </Col>
      </Row>

      <Descriptions column={1} bordered className="mt-6">
        <Descriptions.Item label="Coupon Name">
          <span className="font-mono text-lg">{coupon.name}</span>
        </Descriptions.Item>

        <Descriptions.Item label="Status">
          <Tag
            color={coupon.isActive ? "green" : "red"}
            icon={
              coupon.isActive ? (
                <CheckCircleOutlined />
              ) : (
                <CloseCircleOutlined />
              )
            }
          >
            {coupon.isActive ? "Active" : "Inactive"}
          </Tag>
        </Descriptions.Item>

        <Descriptions.Item label="Expiry Date">
          {coupon.expiryDate ? (
            <Tag
              color={isExpired ? "red" : "blue"}
              icon={
                isExpired ? <CloseCircleOutlined /> : <ClockCircleOutlined />
              }
            >
              {moment(coupon.expiryDate).format("DD MMM YYYY HH:mm")}
              {isExpired && " (Expired)"}
            </Tag>
          ) : (
            <Tag color="green">No Expiry</Tag>
          )}
        </Descriptions.Item>

        <Descriptions.Item label="Created Date">
          {moment(coupon.createdAt).format("DD MMM YYYY HH:mm")}
        </Descriptions.Item>

        <Descriptions.Item label="Last Updated">
          {moment(coupon.updatedAt).format("DD MMM YYYY HH:mm")}
        </Descriptions.Item>

        {coupon.description && (
          <Descriptions.Item label="Description">
            {coupon.description}
          </Descriptions.Item>
        )}
      </Descriptions>
    </Modal>
  );
};

export default CouponDetailsModal;
