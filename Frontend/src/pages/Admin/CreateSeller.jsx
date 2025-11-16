// components/admin/CreateSeller.jsx
import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
    Card,
    Form,
    Input,
    Button,
    Select,
    message,
    Row,
    Col,
    Divider,
    Steps,
    Alert,
    Spin
} from 'antd';
import {
    UserOutlined,
    MailOutlined,
    LockOutlined,
    ShopOutlined,
    ArrowLeftOutlined,
    CheckCircleOutlined
} from '@ant-design/icons';
import { adminCreateUser } from '../../features/admin/adminSlice';

const { Option } = Select;
const { Step } = Steps;

const CreateSeller = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [form] = Form.useForm();

    const { isLoading, isSuccess, message: responseMessage } = useSelector(state => state.admin);

    const [currentStep, setCurrentStep] = useState(0);
    const [createdSeller, setCreatedSeller] = useState(null);

    const onFinish = async (values) => {
        try {
            const sellerData = {
                ...values,
                role: 'seller' // Set role to seller
            };

            const result = await dispatch(adminCreateUser(sellerData)).unwrap();

            setCreatedSeller(result.user || result); // Adjust based on your API response
            setCurrentStep(1);
            message.success('Seller account created successfully!');
        } catch (error) {
            message.error(error || 'Failed to create seller account');
        }
    };

    const steps = [
        {
            title: 'Seller Information',
            content: (
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={onFinish}
                    size="large"
                >
                    <Row gutter={[16, 0]}>
                        <Col xs={24} md={12}>
                            <Form.Item
                                label="Full Name"
                                name="name"
                                rules={[
                                    { required: true, message: 'Please enter seller name' },
                                    { min: 2, message: 'Name must be at least 2 characters' }
                                ]}
                            >
                                <Input
                                    prefix={<UserOutlined />}
                                    placeholder="Enter seller's full name"
                                />
                            </Form.Item>
                        </Col>

                        <Col xs={24} md={12}>
                            <Form.Item
                                label="Email Address"
                                name="email"
                                rules={[
                                    { required: true, message: 'Please enter email address' },
                                    { type: 'email', message: 'Please enter a valid email' }
                                ]}
                            >
                                <Input
                                    prefix={<MailOutlined />}
                                    placeholder="Enter seller's email"
                                />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Row gutter={[16, 0]}>
                        <Col xs={24} md={12}>
                            <Form.Item
                                label="Password"
                                name="password"
                                rules={[
                                    { required: true, message: 'Please enter password' },
                                    { min: 6, message: 'Password must be at least 6 characters' }
                                ]}
                            >
                                <Input.Password
                                    prefix={<LockOutlined />}
                                    placeholder="Enter password"
                                />
                            </Form.Item>
                        </Col>

                        <Col xs={24} md={12}>
                            <Form.Item
                                label="Confirm Password"
                                name="confirmPassword"
                                dependencies={['password']}
                                rules={[
                                    { required: true, message: 'Please confirm password' },
                                    ({ getFieldValue }) => ({
                                        validator(_, value) {
                                            if (!value || getFieldValue('password') === value) {
                                                return Promise.resolve();
                                            }
                                            return Promise.reject(new Error('Passwords do not match'));
                                        },
                                    }),
                                ]}
                            >
                                <Input.Password
                                    prefix={<LockOutlined />}
                                    placeholder="Confirm password"
                                />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Form.Item
                        label="Store Name"
                        name="storeName"
                        rules={[{ required: true, message: 'Please enter store name' }]}
                    >
                        <Input
                            prefix={<ShopOutlined />}
                            placeholder="Enter store name"
                        />
                    </Form.Item>

                    <Form.Item
                        label="Phone Number"
                        name="phone"
                        rules={[
                            { required: true, message: 'Please enter phone number' },
                            { pattern: /^[0-9+\-\s()]+$/, message: 'Please enter a valid phone number' }
                        ]}
                    >
                        <Input placeholder="Enter phone number" />
                    </Form.Item>

                    <Form.Item
                        label="Address"
                        name="address"
                        rules={[{ required: true, message: 'Please enter address' }]}
                    >
                        <Input.TextArea
                            rows={3}
                            placeholder="Enter complete address"
                        />
                    </Form.Item>

                    <Form.Item>
                        <Button
                            type="primary"
                            htmlType="submit"
                            loading={isLoading}
                            block
                            size="large"
                        >
                            Create Seller Account
                        </Button>
                    </Form.Item>
                </Form>
            ),
        },
        {
            title: 'Success',
            content: (
                <div className="text-center py-8">
                    <CheckCircleOutlined className="text-4xl text-green-500 mb-4" />
                    <h3 className="text-xl font-semibold text-gray-800 mb-2">
                        Seller Account Created Successfully!
                    </h3>
                    <p className="text-gray-600 mb-6">
                        The seller account has been created and is now active.
                    </p>

                    {createdSeller && (
                        <Card className="max-w-md mx-auto mb-6">
                            <div className="text-left space-y-2">
                                <p><strong>Name:</strong> {createdSeller.name}</p>
                                <p><strong>Email:</strong> {createdSeller.email}</p>
                                <p><strong>Store:</strong> {createdSeller.storeName}</p>
                                <p><strong>Role:</strong> <span className="capitalize">{createdSeller.role}</span></p>
                                <p><strong>Status:</strong> <span className="text-green-500">Active</span></p>
                            </div>
                        </Card>
                    )}

                    <div className="space-y-3">
                        <Button
                            type="primary"
                            onClick={() => navigate('/admin/dashboard/sellers')}
                            size="large"
                        >
                            View All Sellers
                        </Button>
                        <br />
                        <Button
                            onClick={() => {
                                setCurrentStep(0);
                                form.resetFields();
                                setCreatedSeller(null);
                            }}
                            size="large"
                        >
                            Create Another Seller
                        </Button>
                    </div>
                </div>
            ),
        },
    ];

    return (
        <div>
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center">
                    <Button
                        icon={<ArrowLeftOutlined />}
                        onClick={() => navigate('/admin/dashboard/sellers')}
                        className="mr-4"
                    >
                        Back
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800">Create Seller Account</h1>
                        <p className="text-gray-600">Add a new seller to the platform</p>
                    </div>
                </div>
            </div>

            {/* Steps */}
            <Card className="mb-6">
                <Steps current={currentStep} className="mb-8">
                    <Step title="Seller Information" />
                    <Step title="Confirmation" />
                </Steps>

                {responseMessage && (
                    <Alert
                        message="Error"
                        description={responseMessage}
                        type="error"
                        showIcon
                        className="mb-4"
                    />
                )}

                {isLoading ? (
                    <div className="text-center py-8">
                        <Spin size="large" />
                        <p className="mt-4 text-gray-600">Creating seller account...</p>
                    </div>
                ) : (
                    steps[currentStep].content
                )}
            </Card>

            {/* Information Card */}
            <Card title="Seller Account Information">
                <Row gutter={[16, 16]}>
                    <Col xs={24} md={8}>
                        <div className="text-center">
                            <UserOutlined className="text-2xl text-blue-500 mb-2" />
                            <h4 className="font-semibold">Seller Profile</h4>
                            <p className="text-sm text-gray-600">
                                Complete profile information for the seller
                            </p>
                        </div>
                    </Col>
                    <Col xs={24} md={8}>
                        <div className="text-center">
                            <ShopOutlined className="text-2xl text-green-500 mb-2" />
                            <h4 className="font-semibold">Store Details</h4>
                            <p className="text-sm text-gray-600">
                                Store name and contact information
                            </p>
                        </div>
                    </Col>
                    <Col xs={24} md={8}>
                        <div className="text-center">
                            <LockOutlined className="text-2xl text-orange-500 mb-2" />
                            <h4 className="font-semibold">Secure Access</h4>
                            <p className="text-sm text-gray-600">
                                Secure login credentials
                            </p>
                        </div>
                    </Col>
                </Row>
            </Card>
        </div>
    );
};

export default CreateSeller;