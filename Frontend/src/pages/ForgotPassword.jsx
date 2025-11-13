import React, { useState } from 'react';
import {
    Form,
    Input,
    Button,
    Card,
    Typography,
    Steps,
    Result
} from 'antd';
import {
    MailOutlined,
    LockOutlined,
    SafetyOutlined,
    CheckCircleOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { forgotPassword, resetPassword } from '../features/auth/authSlice';
import { toast } from 'react-toastify';

const { Title, Text } = Typography;

const ForgotPassword = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [form] = Form.useForm();

    const [currentStep, setCurrentStep] = useState(0);
    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState('');
    const [passwordReset, setPasswordReset] = useState(false);

    // Step 1: Send OTP
    const handleSendOTP = async (values) => {
        setLoading(true);
        try {
            await dispatch(forgotPassword(values.email)).unwrap();
            setEmail(values.email);
            setCurrentStep(1);
            toast.success('OTP sent to your email successfully!');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to send OTP');
        } finally {
            setLoading(false);
        }
    };

    // Step 2: Reset Password
    const handleResetPassword = async (values) => {
        setLoading(true);
        try {
            await dispatch(resetPassword({
                email,
                otp: values.otp,
                password: values.newPassword
            })).unwrap();

            setPasswordReset(true);
            setCurrentStep(2);
            toast.success('Password reset successfully!');
            setTimeout(() => navigate('/login'), 3000);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to reset password');
        } finally {
            setLoading(false);
        }
    };

    // Resend OTP
    const handleResendOTP = async () => {
        setLoading(true);
        try {
            await dispatch(forgotPassword(email)).unwrap();
            toast.success('OTP resent to your email!');
        } catch {
            toast.error('Failed to resend OTP');
        } finally {
            setLoading(false);
        }
    };

    const steps = [
        { title: 'Enter Email', icon: <MailOutlined /> },
        { title: 'Reset Password', icon: <LockOutlined /> },
        { title: 'Complete', icon: <CheckCircleOutlined /> }
    ];

    return (
        <div className="flex justify-center items-center min-h-screen bg-gray-100 p-4">
            <Card className="w-full max-w-xl shadow-lg rounded-2xl">
                <div className="text-center mb-6">
                    <Title level={2}>Forgot Password</Title>
                    <Text type="secondary">
                        {currentStep === 0 && "Enter your email to receive OTP"}
                        {currentStep === 1 && "Verify OTP and set new password"}
                        {currentStep === 2 && "Password reset complete"}
                    </Text>
                </div>

                <Steps
                    current={currentStep}
                    items={steps}
                    className="mb-8"
                />

                {/* Step 1: Enter Email */}
                {currentStep === 0 && !passwordReset && (
                    <Form
                        form={form}
                        name="forgot-password"
                        onFinish={handleSendOTP}
                        layout="vertical"
                        size="large"
                    >
                        <Form.Item
                            name="email"
                            label="Email Address"
                            rules={[
                                { required: true, message: 'Please input your email!' },
                                { type: 'email', message: 'Enter a valid email!' }
                            ]}
                        >
                            <Input
                                prefix={<MailOutlined />}
                                placeholder="Enter your registered email"
                            />
                        </Form.Item>

                        <Form.Item>
                            <Button
                                type="primary"
                                htmlType="submit"
                                block
                                loading={loading}
                                className="bg-blue-600 hover:bg-blue-700"
                            >
                                Send OTP
                            </Button>
                        </Form.Item>

                        <p className="text-center text-gray-600">
                            Remember your password?{' '}
                            <a href="/login" className="text-blue-600 hover:underline">
                                Back to Login
                            </a>
                        </p>
                    </Form>
                )}

                {/* Step 2: OTP + Reset Password */}
                {currentStep === 1 && !passwordReset && (
                    <Form
                        form={form}
                        name="reset-password"
                        onFinish={handleResetPassword}
                        layout="vertical"
                        size="large"
                    >
                        <Form.Item
                            name="otp"
                            label="Enter OTP"
                            rules={[
                                { required: true, message: 'Please enter the OTP!' },
                                { len: 6, message: 'OTP must be 6 digits!' },
                                { pattern: /^[0-9]+$/, message: 'OTP must contain only numbers!' }
                            ]}
                        >
                            <Input
                                prefix={<SafetyOutlined />}
                                placeholder="Enter 6-digit OTP"
                                maxLength={6}
                            />
                        </Form.Item>

                        <div className="flex justify-between items-center mb-4">
                            <Text type="secondary">OTP sent to: <strong>{email}</strong></Text>
                            <Button
                                type="link"
                                size="small"
                                onClick={() => {
                                    setCurrentStep(0);
                                    form.resetFields();
                                }}
                            >
                                Change Email
                            </Button>
                        </div>

                        <Form.Item
                            name="newPassword"
                            label="New Password"
                            rules={[
                                { required: true, message: 'Enter your new password!' },
                                { min: 8, message: 'Password must be at least 8 characters!' }
                            ]}
                            hasFeedback
                        >
                            <Input.Password
                                prefix={<LockOutlined />}
                                placeholder="Enter new password"
                            />
                        </Form.Item>

                        <Form.Item
                            name="confirmPassword"
                            label="Confirm New Password"
                            dependencies={['newPassword']}
                            hasFeedback
                            rules={[
                                { required: true, message: 'Please confirm your password!' },
                                ({ getFieldValue }) => ({
                                    validator(_, value) {
                                        if (!value || getFieldValue('newPassword') === value) {
                                            return Promise.resolve();
                                        }
                                        return Promise.reject(new Error('Passwords do not match!'));
                                    },
                                }),
                            ]}
                        >
                            <Input.Password
                                prefix={<LockOutlined />}
                                placeholder="Confirm new password"
                            />
                        </Form.Item>

                        <Form.Item>
                            <Button
                                type="primary"
                                htmlType="submit"
                                block
                                loading={loading}
                                className="bg-blue-600 hover:bg-blue-700"
                            >
                                Reset Password
                            </Button>
                        </Form.Item>

                        <div className="text-center">
                            <Text type="secondary">Didn’t receive OTP?</Text>
                            <Button
                                type="link"
                                onClick={handleResendOTP}
                                loading={loading}
                                className="ml-1"
                            >
                                Resend OTP
                            </Button>
                        </div>
                    </Form>
                )}

                {/* Step 3: Success */}
                {passwordReset && currentStep === 2 && (
                    <Result
                        status="success"
                        title="Password Reset Successfully!"
                        subTitle="You’ll be redirected to the login page shortly."
                        extra={[
                            <Button
                                type="primary"
                                key="login"
                                onClick={() => navigate('/login')}
                                className="bg-blue-600 hover:bg-blue-700"
                            >
                                Go to Login
                            </Button>
                        ]}
                    />
                )}
            </Card>
        </div>
    );
};

export default ForgotPassword;
