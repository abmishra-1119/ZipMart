import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  Card,
  Form,
  Input,
  Button,
  Select,
  InputNumber,
  Upload,
  message,
  Row,
  Col,
  Divider,
  Image,
  Switch,
  Spin,
  Alert,
  Tag,
  Statistic,
} from "antd";
import {
  ArrowLeftOutlined,
  SaveOutlined,
  UploadOutlined,
  DeleteOutlined,
  PictureOutlined,
  ShoppingOutlined,
  StarOutlined,
  DollarOutlined,
} from "@ant-design/icons";
import { getProductById } from "../../features/product/productSlice";
import { adminUpdateProduct } from "../../features/admin/adminSlice";

const { Option } = Select;
const { TextArea } = Input;

const ProductEdit = () => {
  const { productId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [form] = Form.useForm();

  const { product, isLoading } = useSelector((state) => state.products);
  const { isLoading: isUpdating } = useSelector((state) => state.admin);

  const [imageList, setImageList] = useState([]);
  const [thumbnail, setThumbnail] = useState("");
  const [thumbnailError, setThumbnailError] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [newImages, setNewImages] = useState([]);
  const [removedImages, setRemovedImages] = useState([]);

  useEffect(() => {
    if (productId) {
      dispatch(getProductById(productId));
    }
  }, [dispatch, productId]);

  useEffect(() => {
    if (product) {
      form.setFieldsValue({
        title: product.title,
        description: product.description,
        price: product.price,
        stock: product.stock || 0,
        sold: product.sold || 0,
        category: product.category,
        brand: product.brand,
        isActive: product.isActive !== false,
      });

      setThumbnail(
        typeof product.thumbnail === "string" ? product.thumbnail : ""
      );

      if (Array.isArray(product.images)) {
        const validImages = product.images.filter(
          (img) => img && typeof img.url === "string" && img.url.trim() !== ""
        );

        setImageList(
          validImages.map((img, index) => ({
            uid: img.public_id || `existing-${index}`,
            name: `image-${index}.jpg`,
            status: "done",
            url: img.url,
            asset_id: img.asset_id,
            public_id: img.public_id,
            type: "existing",
          }))
        );
      }
    }
  }, [product, form]);

  const isValidUrl = (string) => {
    if (typeof string !== "string") return false;
    if (!string) return false;
    try {
      new URL(string);
      return true;
    } catch (err_) {
      return false;
    }
  };

  // Handle file upload
  const handleImageUpload = async (options) => {
    const { file, onSuccess, onError } = options;

    setUploading(true);

    // Validate file type
    const isValidType =
      file.type === "image/jpeg" ||
      file.type === "image/png" ||
      file.type === "image/webp" ||
      file.type === "image/jpg";

    if (!isValidType) {
      message.error("You can only upload JPG, PNG, or WebP files!");
      onError(new Error("Invalid file type"));
      setUploading(false);
      return;
    }

    const isLt5M = file.size / 1024 / 1024 < 5;
    if (!isLt5M) {
      message.error("Image must be smaller than 5MB!");
      onError(new Error("File too large"));
      setUploading(false);
      return;
    }

    setNewImages((prev) => [...prev, file]);

    // Create preview URL
    const previewUrl = URL.createObjectURL(file);

    const newFileItem = {
      uid: file.uid,
      name: file.name,
      status: "done",
      url: previewUrl,
      type: "new",
      file: file,
    };

    setImageList((prev) => [...prev, newFileItem]);
    onSuccess("Upload success");
    setUploading(false);
  };

  const handleRemoveImage = (file) => {
    if (file.type === "new") {
      setNewImages((prev) => prev.filter((f) => f.uid !== file.uid));
      if (file.url && file.url.startsWith("blob:")) {
        URL.revokeObjectURL(file.url);
      }
    } else if (file.type === "existing") {
      setRemovedImages((prev) => [...prev, file.public_id]);
    }

    const newImageList = imageList.filter((item) => item.uid !== file.uid);
    setImageList(newImageList);
  };

  const handleThumbnailChange = (e) => {
    const value = e.target.value;
    setThumbnail(value);
    setThumbnailError(value && !isValidUrl(value));
  };

  const onFinish = async (values) => {
    try {
      const formData = new FormData();

      Object.keys(values).forEach((key) => {
        if (values[key] !== undefined && values[key] !== null) {
          if (typeof values[key] === "number") {
            formData.append(key, values[key].toString());
          } else {
            formData.append(key, values[key]);
          }
        }
      });

      if (thumbnail !== undefined) {
        formData.append("thumbnail", thumbnail);
      }

      newImages.forEach((file) => {
        formData.append("images", file);
      });

      if (removedImages.length > 0) {
        formData.append("removedImages", JSON.stringify(removedImages));
      }

      await dispatch(
        adminUpdateProduct({
          productId,
          productData: formData,
        })
      ).unwrap();

      message.success("Product updated successfully");
      navigate("/admin/dashboard/products");
    } catch (error) {
      console.error("Update error:", error);
      message.error(error?.message || "Failed to update product");
    }
  };

  const categories = [
    "Electronics",
    "Fashion",
    "Home & Garden",
    "Sports",
    "Books",
    "Beauty",
    "Toys",
    "Automotive",
    "Health",
    "Jewelry",
  ];

  const calculateAverageRating = () => {
    if (!product?.ratings || product.ratings.length === 0) return 0;
    const sum = product.ratings.reduce((acc, rating) => acc + rating.star, 0);
    return (sum / product.ratings.length).toFixed(1);
  };

  const uploadButton = (
    <div>
      {uploading ? <Spin /> : <UploadOutlined />}
      <div style={{ marginTop: 8 }}>{uploading ? "Uploading" : "Upload"}</div>
    </div>
  );

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
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <Button
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate("/admin/dashboard/products")}
            className="mr-4"
          >
            Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Edit Product</h1>
            <p className="text-gray-600">
              Update product information and details
            </p>
          </div>
        </div>
      </div>

      {/* Product Stats */}
      {product && (
        <Row gutter={[16, 16]} className="mb-6">
          <Col xs={12} sm={6}>
            <Card>
              <Statistic
                title="Total Sold"
                value={product.sold || 0}
                prefix={<ShoppingOutlined />}
                valueStyle={{ color: "#1890ff" }}
              />
            </Card>
          </Col>
          <Col xs={12} sm={6}>
            <Card>
              <Statistic
                title="Current Stock"
                value={product.stock || 0}
                valueStyle={{ color: "#52c41a" }}
              />
            </Card>
          </Col>
          <Col xs={12} sm={6}>
            <Card>
              <Statistic
                title="Total Rating"
                value={calculateAverageRating()}
                prefix={<StarOutlined />}
                valueStyle={{ color: "#faad14" }}
              />
            </Card>
          </Col>
          <Col xs={12} sm={6}>
            <Card>
              <Statistic
                title="Total Reviews"
                value={product.ratings?.length || 0}
                valueStyle={{ color: "#722ed1" }}
              />
            </Card>
          </Col>
        </Row>
      )}

      <Form form={form} layout="vertical" onFinish={onFinish} size="large">
        <Row gutter={[24, 0]}>
          <Col xs={24} lg={16}>
            <Card title="Basic Information" className="mb-6">
              <Row gutter={[16, 0]}>
                <Col xs={24} md={12}>
                  <Form.Item
                    label="Product Title"
                    name="title"
                    rules={[
                      { required: true, message: "Please enter product title" },
                      {
                        min: 3,
                        message: "Title must be at least 3 characters",
                      },
                      {
                        max: 100,
                        message: "Title must be less than 100 characters",
                      },
                    ]}
                  >
                    <Input
                      placeholder="Enter product title"
                      showCount
                      maxLength={100}
                    />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item
                    label="Brand"
                    name="brand"
                    rules={[{ required: true, message: "Please enter brand" }]}
                  >
                    <Input placeholder="Enter brand name" />
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item
                label="Description"
                name="description"
                rules={[
                  { required: true, message: "Please enter description" },
                  {
                    min: 5,
                    message: "Description must be at least 5 characters",
                  },
                  {
                    max: 500,
                    message: "Description must be less than 500 characters",
                  },
                ]}
              >
                <TextArea
                  rows={4}
                  placeholder="Enter product description"
                  showCount
                  maxLength={500}
                />
              </Form.Item>

              <Row gutter={[16, 0]}>
                <Col xs={24} md={8}>
                  <Form.Item
                    label="Category"
                    name="category"
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
                <Col xs={24} md={8}>
                  <Form.Item
                    label="Price ($)"
                    name="price"
                    rules={[
                      { required: true, message: "Please enter price" },
                      {
                        type: "number",
                        min: 0,
                        message: "Price must be positive",
                      },
                    ]}
                  >
                    <InputNumber
                      min={0}
                      step={0.01}
                      placeholder="0.00"
                      style={{ width: "100%" }}
                      formatter={(value) =>
                        `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                      }
                      parser={(value) => value.replace(/\$\s?|(,*)/g, "")}
                    />
                  </Form.Item>
                </Col>
                <Col xs={24} md={8}>
                  <Form.Item
                    label="Stock Quantity"
                    name="stock"
                    rules={[
                      {
                        required: true,
                        message: "Please enter stock quantity",
                      },
                      {
                        type: "number",
                        min: 0,
                        message: "Stock must be positive",
                      },
                    ]}
                  >
                    <InputNumber
                      min={0}
                      placeholder="0"
                      style={{ width: "100%" }}
                    />
                  </Form.Item>
                </Col>
              </Row>

              {product && (
                <Row gutter={[16, 0]}>
                  <Col xs={24} md={12}>
                    <Form.Item label="Total Sold">
                      <Input
                        value={product.sold || 0}
                        disabled
                        prefix={<ShoppingOutlined />}
                      />
                    </Form.Item>
                  </Col>
                  <Col xs={24} md={12}>
                    <Form.Item label="Seller">
                      <Input value={product.sellerId?.name || "N/A"} disabled />
                    </Form.Item>
                  </Col>
                </Row>
              )}
            </Card>

            {product?.ratings && product.ratings.length > 0 && (
              <Card title="Product Ratings" className="mb-6">
                <div className="space-y-3">
                  {product.ratings.map((rating, index) => (
                    <div key={index} className="p-3 border rounded">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="flex items-center mb-2">
                            <span className="font-medium mr-2">
                              {rating.postedBy?.name || "Anonymous"}
                            </span>
                            <Tag color="gold">{rating.star} ★</Tag>
                          </div>
                          {rating.comment && (
                            <p className="text-gray-600">{rating.comment}</p>
                          )}
                        </div>
                        <div className="text-sm text-gray-500">
                          {new Date(rating.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            )}
          </Col>

          <Col xs={24} lg={8}>
            <Card title="Product Images" className="mb-6">
              <Form.Item
                label="Thumbnail URL (Optional)"
                validateStatus={thumbnailError ? "error" : ""}
                help={thumbnailError ? "Please enter a valid URL" : ""}
              >
                <Input
                  value={thumbnail}
                  onChange={handleThumbnailChange}
                  placeholder="Enter thumbnail URL"
                  prefix={<PictureOutlined />}
                />
              </Form.Item>

              {thumbnail && isValidUrl(thumbnail) && (
                <div className="mb-4">
                  <div className="text-sm text-gray-500 mb-2">
                    Thumbnail Preview:
                  </div>
                  <Image
                    src={thumbnail}
                    alt="Thumbnail preview"
                    width={250}
                    height={250}
                    style={{
                      objectFit: "cover",
                      borderRadius: "8px",
                    }}
                    fallback={
                      <div className="flex items-center justify-center h-32 bg-gray-100 rounded">
                        <PictureOutlined className="text-2xl text-gray-400" />
                      </div>
                    }
                    placeholder={
                      <div className="flex items-center justify-center h-32 bg-gray-100 rounded">
                        <Spin size="small" />
                      </div>
                    }
                  />
                </div>
              )}

              {thumbnail && !isValidUrl(thumbnail) && (
                <Alert
                  message="Invalid URL"
                  description="Please enter a valid image URL for the thumbnail."
                  type="warning"
                  showIcon
                  className="mb-4"
                />
              )}

              <Divider />

              <Form.Item label="Upload Images">
                <Upload
                  listType="picture-card"
                  fileList={imageList}
                  customRequest={handleImageUpload}
                  onRemove={handleRemoveImage}
                  multiple
                  maxCount={5}
                  accept=".jpg,.jpeg,.png,.webp"
                  showUploadList={{
                    showRemoveIcon: true,
                    showPreviewIcon: true,
                  }}
                  beforeUpload={(file) => {
                    const isValidType =
                      file.type === "image/jpeg" ||
                      file.type === "image/png" ||
                      file.type === "image/webp" ||
                      file.type === "image/jpg";
                    if (!isValidType) {
                      message.error(
                        "You can only upload JPG, PNG, or WebP files!"
                      );
                      return false;
                    }
                    const isLt5M = file.size / 1024 / 1024 < 5;
                    if (!isLt5M) {
                      message.error("Image must be smaller than 5MB!");
                      return false;
                    }
                    return true;
                  }}
                >
                  {imageList.length >= 5 ? null : uploadButton}
                </Upload>
                <div className="text-sm text-gray-500 mt-2">
                  <div>• Upload up to 5 images</div>
                  <div>• Supported formats: JPG, PNG, WebP</div>
                  <div>• Max file size: 5MB per image</div>
                  <div className="mt-1">
                    <Tag color="blue">New</Tag> Uploaded images
                    <Tag color="green" className="ml-2">
                      Existing
                    </Tag>{" "}
                    Current product images
                  </div>
                </div>
              </Form.Item>

              {imageList.length > 0 && (
                <Alert
                  message="Image Upload Information"
                  description={
                    <div>
                      <p>• New images will be uploaded to Cloudinary</p>
                      <p>• Existing images will be preserved</p>
                      <p>
                        • Removing existing images will delete them from
                        Cloudinary
                      </p>
                    </div>
                  }
                  type="info"
                  showIcon
                  className="mt-4"
                />
              )}
            </Card>

            <Card>
              <Form.Item>
                <Button
                  type="primary"
                  htmlType="submit"
                  block
                  size="large"
                  icon={<SaveOutlined />}
                  loading={isUpdating}
                >
                  Update Product
                </Button>
              </Form.Item>

              <Button
                block
                size="large"
                onClick={() => navigate("/admin/dashboard/products")}
                style={{ marginTop: "8px" }}
              >
                Cancel
              </Button>
            </Card>

            {product && (
              <Card title="Product Metadata" className="mt-6">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Created:</span>
                    <span>
                      {new Date(product.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Last Updated:</span>
                    <span>
                      {new Date(product.updatedAt).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Product ID:</span>
                    <span className="font-mono text-xs">{product._id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Seller ID:</span>
                    <span className="font-mono text-xs">
                      {product.sellerId?._id}
                    </span>
                  </div>
                </div>
              </Card>
            )}
          </Col>
        </Row>
      </Form>
    </div>
  );
};

export default ProductEdit;
