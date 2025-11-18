import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  Card,
  Form,
  Input,
  InputNumber,
  Select,
  Upload,
  Button,
  Row,
  Col,
  Spin,
  Divider,
  Image,
  Space,
} from "antd";
import {
  PlusOutlined,
  UploadOutlined,
  ArrowLeftOutlined,
  SaveOutlined,
} from "@ant-design/icons";
import { createProduct } from "../../features/seller/sellerSlice";
import { toast } from "react-toastify";

const { Option } = Select;
const { TextArea } = Input;

const CreateProductPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [form] = Form.useForm();

  const { isLoading } = useSelector((state) => state.seller);

  const [imageList, setImageList] = useState([]);
  const [uploading, setUploading] = useState(false);

  const categories = [
    "Electronics",
    "Clothing",
    "Books",
    "Home & Kitchen",
    "Beauty",
    "Sports",
    "Toys",
    "Automotive",
  ];

  const brands = [
    "Apple",
    "Samsung",
    "Nike",
    "Adidas",
    "Sony",
    "LG",
    "Microsoft",
    "Dell",
    "HP",
    "Canon",
    "Nikon",
  ];

  const handleImageUpload = async (file) => {
    setUploading(true);
    // Simulate upload - replace with actual upload logic
    setTimeout(() => {
      const url = URL.createObjectURL(file);
      setImageList((prev) => [...prev, { url, file }]);
      setUploading(false);
    }, 1000);
    return false; // Prevent default upload
  };

  const handleRemoveImage = (file) => {
    setImageList((prev) => prev.filter((item) => item.url !== file.url));
  };

  const handleSubmit = async (values) => {
    if (imageList.length === 0) {
      toast.error("Please upload at least one product image");
      return;
    }

    const formData = new FormData();

    // Append product data
    Object.keys(values).forEach((key) => {
      formData.append(key, values[key]);
    });

    // Append images
    imageList.forEach((image, index) => {
      formData.append("images", image.file);
    });

    try {
      await dispatch(createProduct(formData)).unwrap();
      toast.success("Product created successfully!");
      navigate("/seller/products");
    } catch (error) {
      toast.error(error || "Failed to create product");
    }
  };

  const uploadButton = (
    <div>
      {uploading ? <Spin /> : <PlusOutlined />}
      <div style={{ marginTop: 8 }}>Upload</div>
    </div>
  );

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <Button
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate("/seller/products")}
            className="mr-4"
          >
            Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">
              Add New Product
            </h1>
            <p className="text-gray-600">Create a new product listing</p>
          </div>
        </div>
      </div>

      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        initialValues={{
          stock: 1,
          price: 0,
        }}
      >
        <Row gutter={[24, 24]}>
          {/* Product Images */}
          <Col xs={24} lg={12}>
            <Card title="Product Images" className="h-full">
              <div className="mb-4">
                <Upload
                  listType="picture-card"
                  fileList={imageList}
                  beforeUpload={handleImageUpload}
                  onRemove={handleRemoveImage}
                  accept="image/*"
                  multiple
                >
                  {imageList.length >= 5 ? null : uploadButton}
                </Upload>
              </div>
              <p className="text-gray-500 text-sm">
                Upload up to 5 images. First image will be used as thumbnail.
              </p>
            </Card>
          </Col>

          {/* Basic Information */}
          <Col xs={24} lg={12}>
            <Card title="Basic Information" className="h-full">
              <Row gutter={16}>
                <Col xs={24}>
                  <Form.Item
                    name="title"
                    label="Product Title"
                    rules={[
                      { required: true, message: "Please enter product title" },
                    ]}
                  >
                    <Input placeholder="Enter product title" />
                  </Form.Item>
                </Col>
                <Col xs={24}>
                  <Form.Item
                    name="description"
                    label="Description"
                    rules={[
                      {
                        required: true,
                        message: "Please enter product description",
                      },
                    ]}
                  >
                    <TextArea
                      rows={4}
                      placeholder="Enter product description"
                    />
                  </Form.Item>
                </Col>
              </Row>
            </Card>
          </Col>

          {/* Pricing & Inventory */}
          <Col xs={24} lg={12}>
            <Card title="Pricing & Inventory">
              <Row gutter={16}>
                <Col xs={12}>
                  <Form.Item
                    name="price"
                    label="Price (₹)"
                    rules={[{ required: true, message: "Please enter price" }]}
                  >
                    <InputNumber
                      min={0}
                      step={0.01}
                      style={{ width: "100%" }}
                      placeholder="0.00"
                    />
                  </Form.Item>
                </Col>
                <Col xs={12}>
                  <Form.Item
                    name="stock"
                    label="Stock Quantity"
                    rules={[
                      {
                        required: true,
                        message: "Please enter stock quantity",
                      },
                    ]}
                  >
                    <InputNumber
                      min={0}
                      style={{ width: "100%" }}
                      placeholder="0"
                    />
                  </Form.Item>
                </Col>
              </Row>
            </Card>
          </Col>

          {/* Categories & Brand */}
          <Col xs={24} lg={12}>
            <Card title="Categories & Brand">
              <Row gutter={16}>
                <Col xs={24} md={12}>
                  <Form.Item
                    name="category"
                    label="Category"
                    rules={[
                      { required: true, message: "Please select category" },
                    ]}
                  >
                    <Select placeholder="Select category">
                      {categories.map((category) => (
                        <Option key={category} value={category}>
                          {category}
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item
                    name="brand"
                    label="Brand"
                    rules={[{ required: true, message: "Please select brand" }]}
                  >
                    <Select placeholder="Select brand">
                      {brands.map((brand) => (
                        <Option key={brand} value={brand}>
                          {brand}
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>
              </Row>
            </Card>
          </Col>

          {/* Submit Button */}
          <Col xs={24}>
            <Card>
              <div className="flex justify-end gap-4">
                <Button
                  size="large"
                  onClick={() => navigate("/seller/products")}
                >
                  Cancel
                </Button>
                <Button
                  type="primary"
                  size="large"
                  icon={<SaveOutlined />}
                  htmlType="submit"
                  loading={isLoading}
                >
                  Create Product
                </Button>
              </div>
            </Card>
          </Col>
        </Row>
      </Form>
    </div>
  );
};

export default CreateProductPage;
