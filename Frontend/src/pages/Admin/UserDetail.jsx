// components/admin/UserDetail.jsx
import React, { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
    Card,
    Descriptions,
    Button,
    Tabs,
    Table,
    Space,
    Modal,
    message,
    Spin,
    Row,
    Col,
    Statistic
} from "antd";
import {
    ArrowLeftOutlined,
    DeleteOutlined,
    ShoppingOutlined,
    DollarOutlined
} from "@ant-design/icons";

import { useDispatch, useSelector } from "react-redux";

import {
    adminGetUserById,
    adminDeleteUserById,
    adminGetOrdersByUserId
} from "../../features/admin/adminSlice";

const UserDetail = () => {
    const { userId } = useParams();
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const {
        loading,
        userDetails,
        userOrders,
        deleteUserSuccess,
        error
    } = useSelector((state) => state.admin);

    // Fetch user details + orders
    useEffect(() => {
        dispatch(adminGetUserById(userId));
        dispatch(adminGetOrdersByUserId(userId));
    }, [userId, dispatch]);

    // Redirect after delete
    useEffect(() => {
        if (deleteUserSuccess) {
            message.success("User deleted successfully");
            navigate("/admin/dashboard/users");
        }
    }, [deleteUserSuccess, navigate]);

    // Confirm delete
    const handleDeleteUser = () => {
        Modal.confirm({
            title: "Delete User",
            content: "Are you sure you want to delete this user?",
            okText: "Yes, Delete",
            okType: "danger",
            cancelText: "Cancel",
            onOk: () => dispatch(adminDeleteUserById(userId)),
        });
    };

    // Order table columns
    const orderColumns = [
        {
            title: "Order ID",
            dataIndex: "_id",
            render: (id) => `#${id?.slice(-8)}`
        },
        {
            title: "Date",
            dataIndex: "orderDate",
            render: (date) => new Date(date).toLocaleDateString(),
        },
        {
            title: "Amount",
            dataIndex: "finalPrice",
            render: (price) => `₹${price}`,
        }
    ];

    const tabItems = [
        {
            key: "orders",
            label: "Order History",
            children: (
                <Table
                    columns={orderColumns}
                    dataSource={userOrders || []}
                    rowKey="_id"
                    pagination={{ pageSize: 10 }}
                />
            ),
        },
    ];

    // Calculate Total Spent from order details
    const totalSpent = userOrders?.reduce((sum, order) => sum + (order.finalPrice || 0), 0) || 0;

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <Spin size="large" />
            </div>
        );
    }

    if (error || !userDetails) {
        return (
            <div className="text-center py-8">
                <p>{error || "User not found"}</p>
                <Button onClick={() => navigate("/admin/dashboard/users")}>
                    Back to Users
                </Button>
            </div>
        );
    }

    const user = userDetails;

    return (
        <div>
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center">
                    <Button
                        icon={<ArrowLeftOutlined />}
                        onClick={() => navigate("/admin/dashboard/users")}
                        className="mr-4"
                    >
                        Back
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800">
                            {user.name}
                        </h1>
                        <p className="text-gray-600">User details and activity</p>
                    </div>
                </div>

                <Space>
                    {user.role !== "admin" && (
                        <Button
                            danger
                            icon={<DeleteOutlined />}
                            onClick={handleDeleteUser}
                        >
                            Delete User
                        </Button>
                    )}
                </Space>
            </div>

            <Row gutter={[24, 24]}>
                {/* User Stats */}
                <Col xs={24} lg={8}>
                    <Row gutter={[16, 16]}>
                        <Col xs={12}>
                            <Card>
                                <Statistic
                                    title="Total Orders"
                                    value={userOrders?.length || 0}
                                    prefix={<ShoppingOutlined />}
                                />
                            </Card>
                        </Col>

                        <Col xs={12}>
                            <Card>
                                <Statistic
                                    title="Total Spent"
                                    value={totalSpent}
                                    prefix={<DollarOutlined />}
                                />
                            </Card>
                        </Col>
                    </Row>
                </Col>

                {/* User Information */}
                <Col xs={24} lg={16}>
                    <Card title="User Information">
                        <Descriptions column={1} bordered>
                            <Descriptions.Item label="Full Name">
                                {user.name}
                            </Descriptions.Item>

                            <Descriptions.Item label="Email">
                                {user.email}
                            </Descriptions.Item>

                            <Descriptions.Item label="Phone">
                                {user.phone || "Not provided"}
                            </Descriptions.Item>

                            <Descriptions.Item label="Address">
                                {user.address || "Not provided"}
                            </Descriptions.Item>

                            <Descriptions.Item label="Member Since">
                                {new Date(user.createdAt).toLocaleDateString()}
                            </Descriptions.Item>
                        </Descriptions>
                    </Card>
                </Col>

                {/* Orders Tab */}
                <Col xs={24}>
                    <Card>
                        <Tabs items={tabItems} />
                    </Card>
                </Col>
            </Row>
        </div>
    );
};

export default UserDetail;
