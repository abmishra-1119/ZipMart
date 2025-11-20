import React, { useEffect } from "react";
import {
  Modal,
  Form,
  Input,
  InputNumber,
  DatePicker,
  Button,
  message,
  Switch,
} from "antd";
import { useDispatch } from "react-redux";
import { updateCoupon } from "../../features/coupons/couponSlice";
import moment from "moment";

const { TextArea } = Input;

const EditCouponModal = ({ visible, coupon, onCancel, onSuccess }) => {
  const [form] = Form.useForm();
  const dispatch = useDispatch();
  const [loading, setLoading] = React.useState(false);

  useEffect(() => {
    if (coupon && visible) {
      form.setFieldsValue({
        name: coupon.name,
        discount: coupon.discount,
        expiryDate: coupon.expiryDate ? moment(coupon.expiryDate) : null,
        isActive: coupon.isActive,
        description: coupon.description || "",
      });
    }
  }, [coupon, visible, form]);

  const handleSubmit = async (values) => {
    try {
      setLoading(true);
      await dispatch(
        updateCoupon({
          id: coupon._id,
          data: {
            ...values,
            expiryDate: values.expiryDate
              ? values.expiryDate.toISOString()
              : null,
          },
        })
      ).unwrap();
      message.success("Coupon updated successfully");
      onSuccess();
    } catch (error) {
      message.error(error?.message || "Failed to update coupon");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    onCancel();
  };

  if (!coupon) return null;

  return (
    <Modal
      title="Edit Coupon"
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
          <Input placeholder="Enter coupon name" />
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

        <Form.Item label="Status" name="isActive" valuePropName="checked">
          <Switch checkedChildren="Active" unCheckedChildren="Inactive" />
        </Form.Item>

        <Form.Item label="Description" name="description">
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
              Update Coupon
            </Button>
          </div>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default EditCouponModal;
