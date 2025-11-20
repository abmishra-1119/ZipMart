import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Card,
  Table,
  Button,
  Space,
  Tag,
  Modal,
  message,
  Spin,
  Row,
  Col,
  Input,
  Select,
  DatePicker,
  Form,
  Popconfirm,
  Tooltip,
  Switch,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SearchOutlined,
  EyeOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import moment from "moment";
import {
  getAllCoupons,
  deleteCoupon,
  toggleCouponStatus,
  resetCouponState,
} from "../../features/coupons/couponSlice";
import CreateCouponModal from "./CreateCouponModal";
import EditCouponModal from "./EditCouponModal";
import CouponDetailsModal from "./CouponDetailsModal";

const { Option } = Select;
const { RangePicker } = DatePicker;

const CouponManagement = () => {
  const dispatch = useDispatch();
  const { coupons, loading, error, success } = useSelector(
    (state) => state.coupon
  );

  console.log(coupons);

  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [detailsModalVisible, setDetailsModalVisible] = useState(false);
  const [selectedCoupon, setSelectedCoupon] = useState(null);
  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  useEffect(() => {
    loadCoupons();
  }, [pagination.current, pagination.pageSize, statusFilter]);

  useEffect(() => {
    if (success) {
      loadCoupons();
      dispatch(resetCouponState());
    }
  }, [success]);

  const loadCoupons = () => {
    const params = {
      page: pagination.current,
      limit: pagination.pageSize,
      ...(statusFilter !== "all" && { active: statusFilter === "active" }),
    };
    dispatch(getAllCoupons(params));
  };

  const handleCreate = () => {
    setCreateModalVisible(true);
  };

  const handleEdit = (coupon) => {
    setSelectedCoupon(coupon);
    setEditModalVisible(true);
  };

  const handleView = (coupon) => {
    setSelectedCoupon(coupon);
    setDetailsModalVisible(true);
  };

  const handleDelete = async (couponId) => {
    try {
      await dispatch(deleteCoupon(couponId)).unwrap();
      message.success("Coupon deleted successfully");
      loadCoupons();
    } catch (error) {
      message.error(error?.message || "Failed to delete coupon");
    }
  };

  const handleStatusToggle = async (couponId, currentStatus) => {
    try {
      await dispatch(toggleCouponStatus(couponId)).unwrap();
      message.success(
        `Coupon ${currentStatus ? "deactivated" : "activated"} successfully`
      );
      loadCoupons();
    } catch (error) {
      message.error(error?.message || "Failed to update coupon status");
    }
  };

  const handleSearch = (value) => {
    setSearchText(value);
    // Implement search logic here or filter locally
  };

  const handleTableChange = (newPagination) => {
    setPagination(newPagination);
  };

  const filteredCoupons = coupons.filter((coupon) =>
    coupon.name.toLowerCase().includes(searchText.toLowerCase())
  );

  const columns = [
    {
      title: "Coupon Name",
      dataIndex: "name",
      key: "name",
      render: (name) => <span className="font-medium">{name}</span>,
    },
    {
      title: "Discount",
      dataIndex: "discount",
      key: "discount",
      render: (discount) => (
        <Tag color="green" className="text-lg">
          {discount}%
        </Tag>
      ),
    },
    {
      title: "Expiry Date",
      dataIndex: "expiryDate",
      key: "expiryDate",
      render: (date) =>
        date ? (
          <span
            className={moment(date).isBefore(moment()) ? "text-red-500" : ""}
          >
            {moment(date).format("DD MMM YYYY")}
          </span>
        ) : (
          <Tag color="blue">No Expiry</Tag>
        ),
    },
    {
      title: "Status",
      dataIndex: "isActive",
      key: "isActive",
      render: (isActive, record) => (
        <Space>
          <Tag color={isActive ? "green" : "red"}>
            {isActive ? "Active" : "Inactive"}
          </Tag>
          <Switch
            size="small"
            checked={isActive}
            onChange={() => handleStatusToggle(record._id, isActive)}
          />
        </Space>
      ),
    },
    {
      title: "Created Date",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (date) => moment(date).format("DD MMM YYYY HH:mm"),
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="View Details">
            <Button
              type="text"
              icon={<EyeOutlined />}
              onClick={() => handleView(record)}
            />
          </Tooltip>
          <Tooltip title="Edit Coupon">
            <Button
              type="text"
              icon={<EditOutlined />}
              onClick={() => handleEdit(record)}
            />
          </Tooltip>
          <Popconfirm
            title="Delete Coupon"
            description="Are you sure you want to delete this coupon?"
            onConfirm={() => handleDelete(record._id)}
            okText="Yes"
            cancelText="No"
            okType="danger"
          >
            <Tooltip title="Delete Coupon">
              <Button type="text" danger icon={<DeleteOutlined />} />
            </Tooltip>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            Coupon Management
          </h1>
          <p className="text-gray-600">Create and manage discount coupons</p>
        </div>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={handleCreate}
          size="large"
        >
          Create Coupon
        </Button>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} sm={8}>
            <Input
              placeholder="Search coupons..."
              prefix={<SearchOutlined />}
              value={searchText}
              onChange={(e) => handleSearch(e.target.value)}
              allowClear
            />
          </Col>
          <Col xs={24} sm={8}>
            <Select
              placeholder="Filter by status"
              value={statusFilter}
              onChange={setStatusFilter}
              style={{ width: "100%" }}
              allowClear
            >
              <Option value="all">All Status</Option>
              <Option value="active">Active</Option>
              <Option value="inactive">Inactive</Option>
            </Select>
          </Col>
          <Col xs={24} sm={8}>
            <Button
              icon={<ReloadOutlined />}
              onClick={loadCoupons}
              loading={loading}
            >
              Refresh
            </Button>
          </Col>
        </Row>
      </Card>

      {/* Coupons Table */}
      <Card>
        <Table
          columns={columns}
          dataSource={filteredCoupons}
          rowKey="_id"
          loading={loading}
          pagination={{
            current: pagination.current,
            pageSize: pagination.pageSize,
            total: pagination.total,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} of ${total} coupons`,
          }}
          onChange={handleTableChange}
          scroll={{ x: 800 }}
        />
      </Card>

      {/* Modals */}
      <CreateCouponModal
        visible={createModalVisible}
        onCancel={() => setCreateModalVisible(false)}
        onSuccess={() => {
          setCreateModalVisible(false);
          loadCoupons();
        }}
      />

      <EditCouponModal
        visible={editModalVisible}
        coupon={selectedCoupon}
        onCancel={() => setEditModalVisible(false)}
        onSuccess={() => {
          setEditModalVisible(false);
          loadCoupons();
        }}
      />

      <CouponDetailsModal
        visible={detailsModalVisible}
        coupon={selectedCoupon}
        onCancel={() => setDetailsModalVisible(false)}
      />
    </div>
  );
};

export default CouponManagement;
