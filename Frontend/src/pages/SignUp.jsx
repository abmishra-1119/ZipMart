import React, { useState } from 'react';
import {
    Form,
    Input,
    Button,
    Card,
    Typography,
    Steps,
} from 'antd';
import {
    MailOutlined,
    LockOutlined,
    UserOutlined,
    PhoneOutlined,
    SafetyOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { sendOtp, verifyOtp } from '../features/auth/authSlice';
import { toast } from 'react-toastify';

const { Title, Text } = Typography;

const Signup = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [form] = Form.useForm();

    const [currentStep, setCurrentStep] = useState(0);
    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState('');

    // Step 1: Send OTP
    const handleSendOTP = async (values) => {
        setLoading(true);
        try {
            await dispatch(sendOtp(values.email)).unwrap();
            setEmail(values.email);
            setCurrentStep(1);
            toast.success('OTP sent to your email successfully!');
        } catch (error) {
            toast.error(error || 'Failed to send OTP');
        } finally {
            setLoading(false);
        }
    };

    // Step 2: Verify OTP and Register
    const handleVerifyAndRegister = async (values) => {
        setLoading(true);
        try {
            await dispatch(
                verifyOtp({
                    name: values.name,
                    email,
                    password: values.password,
                    phone: values.phone,
                    otp: values.otp,
                })
            ).unwrap();

            toast.success('Registration successful!');
            navigate('/login');
        } catch (error) {
            toast.error(error || 'Registration failed');
        } finally {
            setLoading(false);
        }
    };

    const steps = [
        { title: 'Email Verification', icon: <MailOutlined /> },
        { title: 'Complete Profile', icon: <UserOutlined /> },
    ];

    return (
        <div className="flex justify-center items-center min-h-screen bg-gray-100 px-4">
            <Card className="w-full max-w-lg shadow-xl rounded-2xl p-6">
                <div className="text-center mb-6">
                    <Title level={2} className="!mb-1">
                        Create Account
                    </Title>
                    <Text type="secondary">Join our e-commerce platform</Text>
                </div>

                <Steps
                    current={currentStep}
                    items={steps}
                    className="mb-8"
                />

                {/* Step 1: Send OTP */}
                {currentStep === 0 && (
                    <Form
                        form={form}
                        name="send-otp"
                        onFinish={handleSendOTP}
                        layout="vertical"
                        size="large"
                    >
                        <Form.Item
                            name="email"
                            label="Email Address"
                            rules={[
                                { required: true, message: 'Please input your email!' },
                                { type: 'email', message: 'Please enter a valid email!' },
                            ]}
                        >
                            <Input
                                prefix={<MailOutlined className="text-gray-500" />}
                                placeholder="Enter your email"
                                className="rounded-lg"
                            />
                        </Form.Item>

                        <Form.Item>
                            <Button
                                type="primary"
                                htmlType="submit"
                                block
                                loading={loading}
                                className="rounded-lg h-11"
                            >
                                Send OTP
                            </Button>
                        </Form.Item>

                        <div className="text-center text-gray-600 text-sm">
                            Already have an account?{' '}
                            <a href="/login" className="text-blue-600 hover:underline">
                                Login
                            </a>
                        </div>
                    </Form>
                )}

                {/* Step 2: Verify OTP and Register */}
                {currentStep === 1 && (
                    <Form
                        form={form}
                        name="verify-register"
                        onFinish={handleVerifyAndRegister}
                        layout="vertical"
                        size="large"
                    >
                        <Form.Item
                            name="otp"
                            label="Enter OTP"
                            rules={[
                                { required: true, message: 'Please enter the OTP!' },
                                { len: 6, message: 'OTP must be 6 digits!' },
                            ]}
                        >
                            <Input
                                prefix={<SafetyOutlined className="text-gray-500" />}
                                placeholder="Enter 6-digit OTP"
                                maxLength={6}
                                className="rounded-lg"
                            />
                        </Form.Item>

                        <div className="text-sm text-gray-500 mb-4">
                            OTP sent to: <strong>{email}</strong>{' '}
                            <Button
                                type="link"
                                size="small"
                                className="!p-0 text-blue-600"
                                onClick={() => setCurrentStep(0)}
                            >
                                Change email
                            </Button>
                        </div>

                        <Form.Item
                            name="name"
                            label="Full Name"
                            rules={[{ required: true, message: 'Please input your name!' }]}
                        >
                            <Input
                                prefix={<UserOutlined className="text-gray-500" />}
                                placeholder="Enter your full name"
                                className="rounded-lg"
                            />
                        </Form.Item>

                        <Form.Item
                            name="phone"
                            label="Phone Number"
                            rules={[
                                { required: true, message: 'Please input your phone number!' },
                                {
                                    pattern: /^[0-9]{10}$/,
                                    message: 'Please enter a valid 10-digit phone number!',
                                },
                            ]}
                        >
                            <Input
                                prefix={<PhoneOutlined className="text-gray-500" />}
                                placeholder="Enter your phone number"
                                maxLength={10}
                                className="rounded-lg"
                            />
                        </Form.Item>

                        <Form.Item
                            name="password"
                            label="Password"
                            rules={[
                                { required: true, message: 'Please input your password!' },
                                { min: 8, message: 'Password must be at least 8 characters!' },
                            ]}
                            hasFeedback
                        >
                            <Input.Password
                                prefix={<LockOutlined className="text-gray-500" />}
                                placeholder="Create a password"
                                className="rounded-lg"
                            />
                        </Form.Item>

                        <Form.Item
                            name="confirmPassword"
                            label="Confirm Password"
                            dependencies={['password']}
                            hasFeedback
                            rules={[
                                { required: true, message: 'Please confirm your password!' },
                                ({ getFieldValue }) => ({
                                    validator(_, value) {
                                        if (!value || getFieldValue('password') === value) {
                                            return Promise.resolve();
                                        }
                                        return Promise.reject(
                                            new Error('Passwords do not match!')
                                        );
                                    },
                                }),
                            ]}
                        >
                            <Input.Password
                                prefix={<LockOutlined className="text-gray-500" />}
                                placeholder="Confirm your password"
                                className="rounded-lg"
                            />
                        </Form.Item>

                        <Form.Item>
                            <Button
                                type="primary"
                                htmlType="submit"
                                block
                                loading={loading}
                                className="rounded-lg h-11"
                            >
                                Complete Registration
                            </Button>
                        </Form.Item>

                        <div className="text-center">
                            <Button
                                type="link"
                                onClick={() => handleSendOTP({ email })}
                                className="!p-0 text-blue-600"
                            >
                                Resend OTP
                            </Button>
                        </div>
                    </Form>
                )}
            </Card>
        </div>
    );
};

export default Signup;
