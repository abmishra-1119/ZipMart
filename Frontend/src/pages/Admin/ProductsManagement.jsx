import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  Card,
  Table,
  Button,
  Tag,
  Space,
  Input,
  Select,
  Modal,
  message,
  Image,
} from "antd";
import {
  EyeOutlined,
  EditOutlined,
  DeleteOutlined,
  SearchOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import { getAllProducts } from "../../features/product/productSlice";
import { adminDeleteProduct } from "../../features/admin/adminSlice";

const { Search } = Input;
const { Option } = Select;

const AdminProductsManagement = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { products, isLoading } = useSelector((state) => state.products);
  const { isLoading: isDeleting } = useSelector((state) => state.admin);

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [searchText, setSearchText] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);

  useEffect(() => {
    dispatch(getAllProducts({ page: currentPage, limit: pageSize }));
  }, [dispatch, currentPage, pageSize]);

  const handleViewProduct = (productId) => {
    window.open(`/products/${productId}`, "_blank");
  };

  const handleEditProduct = (productId) => {
    navigate(`/admin/dashboard/products/edit/${productId}`);
  };

  const showDeleteModal = (product) => {
    setProductToDelete(product);
    setDeleteModalVisible(true);
  };

  const handleDeleteConfirm = async () => {
    if (!productToDelete) return;

    try {
      await dispatch(adminDeleteProduct(productToDelete._id)).unwrap();
      message.success("Product deleted successfully");
      // Refresh the products list
      dispatch(getAllProducts({ page: currentPage, limit: pageSize }));
    } catch (error) {
      message.error(error?.message || "Failed to delete product");
    } finally {
      setDeleteModalVisible(false);
      setProductToDelete(null);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteModalVisible(false);
    setProductToDelete(null);
  };

  const categories = [...new Set(products.map((product) => product.category))];

  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      product.title?.toLowerCase().includes(searchText.toLowerCase()) ||
      product.description?.toLowerCase().includes(searchText.toLowerCase());
    const matchesCategory =
      !categoryFilter || product.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const columns = [
    {
      title: "Product",
      dataIndex: "title",
      key: "product",
      render: (title, record) => (
        <div className="flex items-center">
          <Image
            src={record.thumbnail}
            alt={title}
            width={50}
            height={50}
            className="rounded mr-3 object-cover"
            fallback="/placeholder-image.jpg"
            preview={false}
          />
          <div>
            <div className="font-medium">{title}</div>
            <div className="text-gray-500 text-sm">{record.brand}</div>
          </div>
        </div>
      ),
    },
    {
      title: "Seller",
      dataIndex: "sellerId",
      key: "seller",
      render: (seller) => seller?.name || "N/A",
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
      render: (price) => `$${price}`,
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
      title: "Status",
      key: "status",
      render: (_, record) => (
        <Tag color={record.stock > 0 ? "green" : "red"}>
          {record.stock > 0 ? "Active" : "Out of Stock"}
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
            onClick={() => showDeleteModal(record)}
            loading={isDeleting && productToDelete?._id === record._id}
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
          <p className="text-gray-600">Manage all products in the system</p>
        </div>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <div className="flex flex-col md:flex-row md:items-center gap-4">
          <div className="flex-1">
            <Search
              placeholder="Search products by title or description..."
              allowClear
              enterButton={<SearchOutlined />}
              size="large"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              onSearch={(value) => setSearchText(value)}
            />
          </div>
          <Select
            placeholder="Filter by category"
            allowClear
            style={{ width: 200 }}
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
        </div>
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
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} of ${total} items`,
            onChange: (page, size) => {
              setCurrentPage(page);
              setPageSize(size);
            },
          }}
          scroll={{ x: 1000 }}
        />
      </Card>

      {/* Delete Confirmation Modal */}
      <Modal
        title="Confirm Delete"
        open={deleteModalVisible}
        onOk={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
        confirmLoading={isDeleting}
        okText="Delete"
        okType="danger"
        cancelText="Cancel"
      >
        {productToDelete && (
          <div>
            <p>Are you sure you want to delete the product:</p>
            <p className="font-semibold text-lg mt-2">
              "{productToDelete.title}"?
            </p>
            <p className="text-red-500 mt-2">
              This action cannot be undone and will remove the product
              permanently.
            </p>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default AdminProductsManagement;
