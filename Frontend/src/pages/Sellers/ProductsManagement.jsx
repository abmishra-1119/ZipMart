import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  Row,
  Col,
  Card,
  Table,
  Button,
  Tag,
  Space,
  Modal,
  Input,
  Select,
  Pagination,
} from "antd";
import {
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  PlusOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import {
  getMyProducts,
  deleteMyProduct,
} from "../../features/seller/sellerSlice";
import { toast } from "react-toastify";
import { getAllCategories } from "../../features/product/productSlice";

const { Search } = Input;
const { Option } = Select;

const ProductsManagement = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const {
    products,
    isLoading,
    isSuccess,
    message: sellerMessage,
  } = useSelector((state) => state.seller);

  const { categories } = useSelector((state) => state.products);

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchText, setSearchText] = useState("");
  const [categoryFilter, setCategoryFilter] = useState(undefined);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  useEffect(() => {
    dispatch(getMyProducts({ page: currentPage, limit: pageSize }));
    dispatch(getAllCategories());
  }, [dispatch, currentPage, pageSize]);

  useEffect(() => {
    if (sellerMessage && isSuccess) {
      toast.success(sellerMessage);
    }
  }, [sellerMessage, isSuccess]);

  const openDeleteModal = (product) => {
    setSelectedProduct(product);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedProduct) return;
    try {
      await dispatch(deleteMyProduct(selectedProduct._id)).unwrap();
      toast.success("Product deleted successfully");
    } catch (error) {
      toast.error(error || "Failed to delete product");
    } finally {
      setIsDeleteModalOpen(false);
    }
  };

  const handleViewProduct = (productId) => {
    window.open(`/products/${productId}`, "_blank");
  };

  const handleEditProduct = (productId) => {
    navigate(`/seller/products/edit/${productId}`);
  };

  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      product?.title.toLowerCase().includes(searchText.toLowerCase()) ||
      product?.description.toLowerCase().includes(searchText.toLowerCase());
    const matchesCategory =
      !categoryFilter || product?.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const columns = [
    {
      title: "Product",
      dataIndex: "title",
      key: "title",
      render: (title, record) => (
        <div className="flex items-center">
          <img
            src={record.thumbnail}
            alt={title}
            className="w-10 h-10 rounded mr-3 object-cover"
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
      render: (price) => `₹${price}`,
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
      title: "Rating",
      dataIndex: "totalRating",
      key: "totalRating",
      render: (rating) => rating || "No ratings",
      sorter: (a, b) => (a.totalRating || 0) - (b.totalRating || 0),
    },
    {
      title: "Status",
      key: "status",
      render: (_, record) => (
        <Tag color={record.stock > 0 ? "green" : "red"}>
          {record.stock > 0 ? "In Stock" : "Out of Stock"}
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
            onClick={() => handleEditProduct(record._id)}
          >
            Edit
          </Button>
          <Button
            size="small"
            danger
            icon={<DeleteOutlined />}
            onClick={() => openDeleteModal(record)}
          >
            Delete
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            Products Management
          </h1>
          <p className="text-gray-600">
            Manage your product listings and inventory
          </p>
        </div>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => navigate("/seller/products/create")}
          size="large"
        >
          Add New Product
        </Button>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} md={8}>
            <Search
              placeholder="Search products..."
              allowClear
              enterButton={<SearchOutlined />}
              size="large"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
            />
          </Col>
          <Col xs={24} md={6}>
            <Select
              placeholder="Filter by category"
              allowClear
              style={{ width: "100%" }}
              size="large"
              value={categoryFilter}
              onChange={setCategoryFilter}
            >
              {categories.map((category) => (
                <Option key={category} value={category}>
                  {category}
                </Option>
              ))}
            </Select>
          </Col>
          <Col xs={24} md={10} className="text-right">
            <span className="text-gray-600">
              Showing {filteredProducts.length} of {products.length} products
            </span>
          </Col>
        </Row>
      </Card>

      {/* Products Table */}
      <Card>
        <Table
          columns={columns}
          dataSource={filteredProducts}
          rowKey="_id"
          loading={isLoading}
          pagination={{
            current: currentPage,
            pageSize: pageSize,
            total: products.length,
            showSizeChanger: true,
            showQuickJumper: true,
            onChange: (page, size) => {
              setCurrentPage(page);
              setPageSize(size);
            },
          }}
          scroll={{ x: 1000 }}
        />
      </Card>
      <Modal
        title="Delete Product"
        open={isDeleteModalOpen}
        onOk={handleConfirmDelete}
        onCancel={() => setIsDeleteModalOpen(false)}
        okText="Yes, Delete"
        okType="danger"
        cancelText="Cancel"
      >
        <p>
          Are you sure you want to delete{" "}
          <strong>{selectedProduct?.title}</strong>? This action cannot be
          undone.
        </p>
      </Modal>
    </div>
  );
};

export default ProductsManagement;
