import React from "react";
import {
  Modal,
  Form,
  Input,
  InputNumber,
  DatePicker,
  Button,
  message,
} from "antd";
import moment from "moment";
import { useDispatch } from "react-redux";
import { createCoupon } from "../../features/coupons/couponSlice";

const { TextArea } = Input;

const CreateCouponModal = ({ visible, onCancel, onSuccess }) => {
  const [form] = Form.useForm();
  const dispatch = useDispatch();
  const [loading, setLoading] = React.useState(false);

  const handleSubmit = async (values) => {
    try {
      setLoading(true);
      await dispatch(createCoupon(values)).unwrap();
      message.success("Coupon created successfully");
      form.resetFields();
      onSuccess();
    } catch (error) {
      message.error(error?.message || "Failed to create coupon");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    onCancel();
  };

  return (
    <Modal
      title="Create New Coupon"
      open={visible}
      onCancel={handleCancel}
      footer={null}
      width={600}
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        autoComplete="off"
      >
        <Form.Item
          label="Coupon Name"
          name="name"
          rules={[
            { required: true, message: "Please enter coupon name" },
            { min: 3, message: "Coupon name must be at least 3 characters" },
            { max: 20, message: "Coupon name must be less than 20 characters" },
          ]}
        >
          <Input placeholder="Enter coupon name (e.g., SUMMER25)" />
        </Form.Item>

        <Form.Item
          label="Discount Percentage"
          name="discount"
          rules={[
            { required: true, message: "Please enter discount percentage" },
            {
              type: "number",
              min: 1,
              max: 100,
              message: "Discount must be between 1-100%",
            },
          ]}
        >
          <InputNumber
            min={1}
            max={100}
            placeholder="Enter discount percentage"
            style={{ width: "100%" }}
            addonAfter="%"
          />
        </Form.Item>

        <Form.Item
          label="Expiry Date"
          name="expiryDate"
          help="Leave empty for no expiry"
        >
          <DatePicker
            style={{ width: "100%" }}
            placeholder="Select expiry date"
            disabledDate={(current) =>
              current && current < moment().startOf("day")
            }
            showTime
          />
        </Form.Item>

        <Form.Item label="Description (Optional)" name="description">
          <TextArea
            rows={3}
            placeholder="Enter coupon description"
            maxLength={200}
            showCount
          />
        </Form.Item>

        <Form.Item className="mb-0">
          <div className="flex justify-end space-x-2">
            <Button onClick={handleCancel}>Cancel</Button>
            <Button type="primary" htmlType="submit" loading={loading}>
              Create Coupon
            </Button>
          </div>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default CreateCouponModal;
