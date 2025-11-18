// components/admin/SellersManagement.jsx
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
  Modal,
  message,
  Badge,
  Avatar,
  Row,
  Col,
  Statistic,
} from "antd";
import {
  EyeOutlined,
  EditOutlined,
  DeleteOutlined,
  SearchOutlined,
  PlusOutlined,
  ShopOutlined,
  UserOutlined,
} from "@ant-design/icons";
import {
  adminGetAllSellers,
  adminDeleteUserById,
} from "../../features/admin/adminSlice";

const { Search } = Input;

const SellersManagement = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { sellers, isLoading } = useSelector((state) => state.admin);

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchText, setSearchText] = useState("");
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [sellerToDelete, setSellerToDelete] = useState(null);

  useEffect(() => {
    dispatch(adminGetAllSellers({ page: currentPage, limit: pageSize }));
  }, [dispatch, currentPage, pageSize]);

  const handleCreateSeller = () => {
    navigate("/admin/dashboard/sellers/create");
  };

  const handleViewSeller = (sellerId) => {
    navigate(`/admin/dashboard/sellers/${sellerId}`);
  };

  const showDeleteModal = (seller) => {
    setSellerToDelete(seller);
    setDeleteModalVisible(true);
  };

  const handleDeleteConfirm = async () => {
    if (!sellerToDelete) return;

    try {
      await dispatch(adminDeleteUserById(sellerToDelete._id)).unwrap();
      message.success("Seller deleted successfully");
      dispatch(adminGetAllSellers({ page: currentPage, limit: pageSize }));
    } catch (error) {
      message.error(error?.message || "Failed to delete seller");
    } finally {
      setDeleteModalVisible(false);
      setSellerToDelete(null);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteModalVisible(false);
    setSellerToDelete(null);
  };

  const filteredSellers = sellers.filter((seller) => {
    return (
      seller.name?.toLowerCase().includes(searchText.toLowerCase()) ||
      seller.email?.toLowerCase().includes(searchText.toLowerCase()) ||
      seller.storeName?.toLowerCase().includes(searchText.toLowerCase())
    );
  });

  const stats = {
    totalSellers: sellers.length,
    activeSellers: sellers.filter((s) => s.isActive).length,
    pendingSellers: sellers.filter((s) => !s.isActive).length,
  };

  const columns = [
    {
      title: "Seller",
      dataIndex: "name",
      key: "seller",
      render: (name, record) => (
        <div className="flex items-center">
          <Avatar
            src={record.avatar?.url}
            icon={<UserOutlined />}
            className="mr-3"
          />
          <div>
            <div className="font-medium">{name}</div>
            <div className="text-gray-500 text-sm">{record.email}</div>
            {record.storeName && (
              <div className="text-blue-600 text-sm">
                <ShopOutlined className="mr-1" />
                {record.storeName}
              </div>
            )}
          </div>
        </div>
      ),
    },
    {
      title: "Store",
      dataIndex: "storeName",
      key: "store",
      render: (storeName) => storeName || "N/A",
    },
    {
      title: "Status",
      dataIndex: "isActive",
      key: "status",
      render: (isActive) => (
        <Badge
          status={isActive ? "success" : "default"}
          text={isActive ? "Active" : "Inactive"}
        />
      ),
    },
    {
      title: "Products",
      dataIndex: "productsCount",
      key: "products",
      render: (count) => count || 0,
    },
    {
      title: "Joined Date",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (date) => new Date(date).toLocaleDateString(),
      sorter: (a, b) => new Date(a.createdAt) - new Date(b.createdAt),
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <Space size="small">
          <Button
            size="small"
            icon={<EyeOutlined />}
            onClick={() => handleViewSeller(record._id)}
          >
            View
          </Button>
          <Button
            size="small"
            danger
            icon={<DeleteOutlined />}
            onClick={() => showDeleteModal(record)}
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
            Sellers Management
          </h1>
          <p className="text-gray-600">Manage all sellers and their stores</p>
        </div>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          size="large"
          onClick={handleCreateSeller}
        >
          Create Seller
        </Button>
      </div>

      {/* Stats */}
      <Row gutter={[16, 16]} className="mb-6">
        <Col xs={12} sm={8}>
          <Card>
            <Statistic
              title="Total Sellers"
              value={stats.totalSellers}
              prefix={<ShopOutlined />}
              valueStyle={{ color: "#1890ff" }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={8}>
          <Card>
            <Statistic
              title="Active Sellers"
              value={stats.activeSellers}
              valueStyle={{ color: "#52c41a" }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={8}>
          <Card>
            <Statistic
              title="Pending Sellers"
              value={stats.pendingSellers}
              valueStyle={{ color: "#faad14" }}
            />
          </Card>
        </Col>
      </Row>

      {/* Filters */}
      <Card className="mb-6">
        <div className="flex flex-col md:flex-row md:items-center gap-4">
          <div className="flex-1">
            <Search
              placeholder="Search sellers by name, email, or store..."
              allowClear
              enterButton={<SearchOutlined />}
              size="large"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
            />
          </div>
        </div>
      </Card>

      {/* Sellers Table */}
      <Card>
        <Table
          columns={columns}
          dataSource={filteredSellers}
          rowKey="_id"
          loading={isLoading}
          pagination={{
            current: currentPage,
            pageSize: pageSize,
            total: sellers.length,
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

      {/* Delete Confirmation Modal */}
      <Modal
        title="Confirm Delete"
        open={deleteModalVisible}
        onOk={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
        okText="Delete"
        okType="danger"
        cancelText="Cancel"
      >
        {sellerToDelete && (
          <div>
            <p>Are you sure you want to delete the seller:</p>
            <p className="font-semibold text-lg mt-2">
              "{sellerToDelete.name}"?
            </p>
            <p className="text-red-500 mt-2">
              This will permanently remove the seller account and all associated
              data.
            </p>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default SellersManagement;
