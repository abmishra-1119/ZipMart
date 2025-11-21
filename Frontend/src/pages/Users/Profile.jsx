import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  Row,
  Col,
  Card,
  Button,
  Form,
  Input,
  Upload,
  Avatar,
  Spin,
  Alert,
  Divider,
  Modal,
  Tabs,
  Tag,
  Switch,
  InputNumber,
} from "antd";
import {
  UserOutlined,
  CameraOutlined,
  LockOutlined,
  EnvironmentOutlined,
  EditOutlined,
  DeleteOutlined,
  StarOutlined,
  SaveOutlined,
} from "@ant-design/icons";
import {
  getProfile,
  changePassword,
  uploadAvatar,
  updateUser,
} from "../../features/auth/authSlice";
import {
  getAddresses,
  addAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress,
} from "../../features/addresses/addressSlice";
import { toast } from "react-toastify";

const { TabPane } = Tabs;
const { TextArea } = Input;

const ProfilePage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [passwordForm] = Form.useForm();
  const [addressForm] = Form.useForm();

  const {
    user,
    loading: authLoading,
    message: authMessage,
  } = useSelector((state) => state.auth);
  const { addresses, loading: addressLoading } = useSelector(
    (state) => state.addresses
  );

  const [activeTab, setActiveTab] = useState("profile");
  const [editingProfile, setEditingProfile] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [addressModalVisible, setAddressModalVisible] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [deleteIndex, setDeleteIndex] = useState(null);

  useEffect(() => {
    dispatch(getProfile());
    dispatch(getAddresses());
  }, [dispatch]);

  // Handle auth messages
  useEffect(() => {
    if (authMessage) {
      if (authMessage.includes("success")) {
        toast.success(authMessage);
      } else {
        toast.error(authMessage);
      }
    }
  }, [authMessage]);

  // Avatar Upload
  const handleAvatarUpload = async (file) => {
    setUploadingAvatar(true);
    try {
      await dispatch(uploadAvatar(file)).unwrap();
      toast.success("Profile picture updated successfully");
    } catch (error) {
      toast.error(error || "Failed to upload profile picture");
    } finally {
      setUploadingAvatar(false);
    }
    return false; // Prevent default upload behavior
  };

  const uploadProps = {
    beforeUpload: handleAvatarUpload,
    showUploadList: false,
    accept: "image/*",
  };

  // Profile Update
  const handleProfileUpdate = async (values) => {
    try {
      await dispatch(updateUser(values)).unwrap();
      toast.success("Profile updated successfully");
      setEditingProfile(false);
    } catch (error) {
      toast.error(error || "Failed to update profile");
    }
  };

  // Password Change
  const handlePasswordChange = async (values) => {
    setChangingPassword(true);
    try {
      await dispatch(
        changePassword({
          oldPassword: values.oldPassword,
          newPassword: values.newPassword,
        })
      ).unwrap();
      toast.success("Password changed successfully");
      passwordForm.resetFields();
    } catch (error) {
      toast.error(error || "Failed to change password");
    } finally {
      setChangingPassword(false);
    }
  };

  // Address Management
  const handleAddAddress = async (values) => {
    try {
      await dispatch(addAddress(values)).unwrap();
      toast.success("Address added successfully");
      setAddressModalVisible(false);
      addressForm.resetFields();
    } catch (error) {
      toast.error(error || "Failed to add address");
    }
  };

  const handleEditAddress = (address, index) => {
    setEditingAddress({ ...address, index });
    addressForm.setFieldsValue(address);
    setAddressModalVisible(true);
  };

  const handleUpdateAddress = async (values) => {
    if (!editingAddress) return;

    try {
      await dispatch(
        updateAddress({
          index: editingAddress.index,
          data: values,
        })
      ).unwrap();
      toast.success("Address updated successfully");
      setAddressModalVisible(false);
      setEditingAddress(null);
      addressForm.resetFields();
    } catch (error) {
      toast.error(error || "Failed to update address");
    }
  };

  const openDeleteModal = (index) => {
    setDeleteIndex(index);
    setDeleteModalVisible(true);
  };

  const confirmDeleteAddress = async () => {
    try {
      await dispatch(deleteAddress(deleteIndex)).unwrap();
      toast.success("Address deleted successfully");
    } catch (error) {
      console.error(error);
      toast.error("Failed to delete address");
    }
    setDeleteModalVisible(false);
    setDeleteIndex(null);
  };

  const handleSetDefaultAddress = async (index) => {
    try {
      console.log(index);

      await dispatch(setDefaultAddress(index)).unwrap();
      toast.success("Default address updated successfully");
    } catch (error) {
      toast.error(error || "Failed to set default address");
    }
  };

  const handleAddressModalClose = () => {
    setAddressModalVisible(false);
    setEditingAddress(null);
    addressForm.resetFields();
  };

  const handleAddressSubmit = (values) => {
    if (editingAddress) {
      handleUpdateAddress(values);
    } else {
      handleAddAddress(values);
    }
  };

  if (authLoading && !user) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          <div className="flex justify-center items-center h-64">
            <Spin size="large" tip="Loading profile..." />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">My Profile</h1>
          <p className="text-gray-600">
            Manage your account settings and preferences
          </p>
        </div>

        <Row gutter={[32, 32]}>
          {/* Left Sidebar - Profile Summary */}
          <Col xs={24} lg={8}>
            <div className="text-center shadow-sm sticky top-20">
              <Card>
                {/* Avatar Section */}
                <div className="mb-6">
                  <div className="relative inline-block">
                    <Avatar
                      size={120}
                      src={user?.avatar?.url}
                      icon={<UserOutlined />}
                      className="border-4 border-white shadow-lg"
                    />
                    <Upload {...uploadProps}>
                      <Button
                        type="primary"
                        shape="circle"
                        icon={<CameraOutlined />}
                        size="small"
                        loading={uploadingAvatar}
                        className="absolute bottom-0 right-0 shadow-md"
                      />
                    </Upload>
                  </div>
                  <h2 className="text-xl font-semibold mt-4 text-gray-800">
                    {user?.name}
                  </h2>
                  <p className="text-gray-600">{user?.email}</p>
                  <Tag color="blue" className="mt-2">
                    {user?.role}
                  </Tag>
                </div>

                {/* Quick Stats */}
                <Divider />
                <div className="space-y-3 text-left">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Member since:</span>
                    <span className="font-medium">
                      {user?.createdAt
                        ? new Date(user.createdAt).toLocaleDateString()
                        : "N/A"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Orders:</span>
                    <span className="font-medium">
                      {user?.ordersCount || 0}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Default Address:</span>
                    <span className="font-medium">
                      {addresses?.find((addr) => addr.isDefault)
                        ? "Set"
                        : "Not Set"}
                    </span>
                  </div>
                </div>
              </Card>
            </div>
          </Col>

          {/* Right Content - Tabs */}
          <Col xs={24} lg={16}>
            <div className="shadow-sm">
              <Card>
                <Tabs activeKey={activeTab} onChange={setActiveTab} type="card">
                  {/* Profile Information Tab */}
                  <TabPane tab="Profile Information" key="profile">
                    <div className="max-w-2xl">
                      <div className="flex justify-between items-center mb-6">
                        <h3 className="text-lg font-semibold">
                          Personal Information
                        </h3>
                        <Button
                          icon={<EditOutlined />}
                          onClick={() => setEditingProfile(!editingProfile)}
                        >
                          {editingProfile ? "Cancel Edit" : "Edit Profile"}
                        </Button>
                      </div>

                      <Form
                        form={form}
                        layout="vertical"
                        onFinish={handleProfileUpdate}
                        initialValues={{
                          name: user?.name,
                          email: user?.email,
                          age: user?.age,
                        }}
                      >
                        <Row gutter={16}>
                          <Col xs={24} md={12}>
                            <Form.Item
                              name="name"
                              label="Full Name"
                              rules={[
                                {
                                  required: true,
                                  toast: "Please enter your name",
                                },
                              ]}
                            >
                              <Input
                                disabled={!editingProfile}
                                prefix={<UserOutlined />}
                              />
                            </Form.Item>
                          </Col>
                          <Col xs={24} md={12}>
                            <Form.Item name="email" label="Email Address">
                              <Input disabled type="email" />
                            </Form.Item>
                          </Col>
                          <Col xs={24} md={12}>
                            <Form.Item
                              name="age"
                              label="Age"
                              rules={[
                                {
                                  required: true,
                                  message: "Please enter your age",
                                },

                                {
                                  type: "number",
                                  min: 18,
                                  max: 120,
                                  message: "Age must be between 18 and 120",
                                },

                                {
                                  validator: (_, value) => {
                                    if (value && value < 18) {
                                      return Promise.reject(
                                        new Error(
                                          "You must be at least 18 years old!"
                                        )
                                      );
                                    }
                                    return Promise.resolve();
                                  },
                                },
                              ]}
                            >
                              <InputNumber
                                min={0}
                                max={120}
                                style={{ width: "100%" }}
                                disabled={!editingProfile}
                                placeholder="Enter your age"
                              />
                            </Form.Item>
                          </Col>
                        </Row>

                        {editingProfile && (
                          <div className="flex gap-2 justify-end">
                            <Button onClick={() => setEditingProfile(false)}>
                              Cancel
                            </Button>
                            <Button type="primary" htmlType="submit">
                              Save Changes
                            </Button>
                          </div>
                        )}
                      </Form>
                    </div>
                  </TabPane>

                  {/* Change Password Tab */}
                  <TabPane tab="Change Password" key="password">
                    <div className="max-w-2xl">
                      <h3 className="text-lg font-semibold mb-6">
                        Update Password
                      </h3>
                      <Form
                        form={passwordForm}
                        layout="vertical"
                        onFinish={handlePasswordChange}
                      >
                        <Form.Item
                          name="oldPassword"
                          label="Current Password"
                          rules={[
                            {
                              required: true,
                              toast: "Please enter your current password",
                            },
                          ]}
                        >
                          <Input.Password
                            prefix={<LockOutlined />}
                            placeholder="Enter current password"
                          />
                        </Form.Item>

                        <Form.Item
                          name="newPassword"
                          label="New Password"
                          rules={[
                            {
                              required: true,
                              toast: "Please enter new password",
                            },
                            {
                              min: 6,
                              toast: "Password must be at least 6 characters",
                            },
                          ]}
                        >
                          <Input.Password
                            prefix={<LockOutlined />}
                            placeholder="Enter new password"
                          />
                        </Form.Item>

                        <Form.Item
                          name="confirmPassword"
                          label="Confirm New Password"
                          dependencies={["newPassword"]}
                          rules={[
                            {
                              required: true,
                              toast: "Please confirm your password",
                            },
                            ({ getFieldValue }) => ({
                              validator(_, value) {
                                if (
                                  !value ||
                                  getFieldValue("newPassword") === value
                                ) {
                                  return Promise.resolve();
                                }
                                return Promise.reject(
                                  new Error("Passwords do not match")
                                );
                              },
                            }),
                          ]}
                        >
                          <Input.Password
                            prefix={<LockOutlined />}
                            placeholder="Confirm new password"
                          />
                        </Form.Item>

                        <Button
                          type="primary"
                          htmlType="submit"
                          loading={changingPassword}
                          icon={<SaveOutlined />}
                        >
                          Change Password
                        </Button>
                      </Form>
                    </div>
                  </TabPane>

                  {/* Address Management Tab */}
                  <TabPane tab="Address Book" key="address">
                    <div className="flex justify-between items-center mb-6">
                      <h3 className="text-lg font-semibold">
                        Manage Addresses
                      </h3>
                      <Button
                        type="primary"
                        icon={<EnvironmentOutlined />}
                        onClick={() => setAddressModalVisible(true)}
                      >
                        Add New Address
                      </Button>
                    </div>

                    {addressLoading ? (
                      <div className="text-center py-8">
                        <Spin />
                      </div>
                    ) : addresses?.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {addresses.map((address, index) => (
                          <AddressCard
                            key={index}
                            address={address}
                            index={index}
                            onEdit={handleEditAddress}
                            openDeleteModal={openDeleteModal}
                            onSetDefault={handleSetDefaultAddress}
                          />
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <EnvironmentOutlined className="text-4xl text-gray-300 mb-4" />
                        <p className="text-gray-500 text-lg">
                          No addresses saved yet
                        </p>
                        <p className="text-gray-400 mb-4">
                          Add your first address to get started
                        </p>
                        <Button
                          type="primary"
                          onClick={() => setAddressModalVisible(true)}
                        >
                          Add Your First Address
                        </Button>
                      </div>
                    )}
                  </TabPane>
                </Tabs>
              </Card>
            </div>
          </Col>
        </Row>

        {/* Add/Edit Address Modal */}
        <Modal
          title={editingAddress ? "Edit Address" : "Add New Address"}
          open={addressModalVisible}
          onCancel={handleAddressModalClose}
          footer={null}
          width={600}
        >
          <Form
            form={addressForm}
            layout="vertical"
            onFinish={handleAddressSubmit}
          >
            <Row gutter={16}>
              <Col xs={24}>
                <Form.Item
                  name="house"
                  label="House/Flat No. & Building"
                  rules={[
                    { required: true, toast: "Please enter house/flat number" },
                  ]}
                >
                  <Input placeholder="e.g., 101, Skyline Apartments" />
                </Form.Item>
              </Col>
              <Col xs={24}>
                <Form.Item name="street" label="Street/Area">
                  <Input placeholder="e.g., Main Street, Downtown" />
                </Form.Item>
              </Col>
              <Col xs={24}>
                <Form.Item name="landmark" label="Landmark (Optional)">
                  <Input placeholder="e.g., Near Central Park" />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item
                  name="city"
                  label="City"
                  rules={[{ required: true, toast: "Please enter city" }]}
                >
                  <Input placeholder="e.g., Mumbai" />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item
                  name="state"
                  label="State"
                  rules={[{ required: true, toast: "Please enter state" }]}
                >
                  <Input placeholder="e.g., Maharashtra" />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item
                  name="pincode"
                  label="Pincode"
                  rules={[
                    { required: true, toast: "Please enter pincode" },
                    {
                      pattern: /^[1-9][0-9]{5}$/,
                      toast: "Please enter valid pincode",
                    },
                  ]}
                >
                  <Input placeholder="e.g., 400001" maxLength={6} />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item name="country" label="Country" initialValue="India">
                  <Input disabled />
                </Form.Item>
              </Col>
            </Row>
            <div className="flex gap-2 justify-end">
              <Button onClick={handleAddressModalClose}>Cancel</Button>
              <Button type="primary" htmlType="submit">
                {editingAddress ? "Update Address" : "Save Address"}
              </Button>
            </div>
          </Form>
        </Modal>
      </div>
      <Modal
        title="Delete Address"
        open={deleteModalVisible}
        onCancel={() => setDeleteModalVisible(false)}
        onOk={confirmDeleteAddress}
        okText="Delete"
        okType="danger"
        cancelText="Cancel"
      >
        <p>Are you sure you want to delete this address?</p>
        <p className="text-red-500 font-medium mt-2">
          This action cannot be undone.
        </p>
      </Modal>
    </div>
  );
};

// Address Card Component
const AddressCard = ({
  address,
  index,
  onEdit,
  openDeleteModal,
  onSetDefault,
}) => {
  return (
    <div
      className={`border-l-4 ${
        address.isDefault
          ? "border-l-green-500 bg-green-50"
          : "border-l-blue-500"
      } hover:shadow-md transition-shadow`}
    >
      <Card>
        <div className="flex justify-between items-start mb-3">
          <div className="flex-1">
            {address.isDefault && (
              <Tag color="green" icon={<StarOutlined />} className="mb-2">
                Default
              </Tag>
            )}
            <p className="font-semibold text-gray-800">{address.house}</p>
            {address.street && (
              <p className="text-gray-600">{address.street}</p>
            )}
            {address.landmark && (
              <p className="text-gray-600">Near {address.landmark}</p>
            )}
            <p className="text-gray-600">
              {address.city}, {address.state} - {address.pincode}
            </p>
            <p className="text-gray-600">{address.country}</p>
          </div>
        </div>

        <div className="flex gap-2">
          <Button
            size="small"
            icon={<EditOutlined />}
            onClick={() => onEdit(address, index)}
          >
            Edit
          </Button>
          {!address.isDefault && (
            <>
              <Button
                size="small"
                icon={<StarOutlined />}
                onClick={() => onSetDefault(index)}
              >
                Set Default
              </Button>
              <Button
                size="small"
                danger
                icon={<DeleteOutlined />}
                onClick={() => openDeleteModal(index)}
              >
                Delete
              </Button>
            </>
          )}
        </div>
      </Card>
    </div>
  );
};

export default ProfilePage;
