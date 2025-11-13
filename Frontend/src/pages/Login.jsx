import { useState } from 'react';
import { Form, Input, Button, Checkbox, Typography } from 'antd';
import { MailOutlined, LockOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { loginUser } from '../features/auth/authSlice';
import { toast } from 'react-toastify';

const { Title, Text } = Typography;

const Login = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const [loading, setLoading] = useState(false);
    const { isLoading } = useSelector((state) => state.auth);

    const onFinish = async (values) => {
        setLoading(true);
        try {
            const response = await dispatch(
                loginUser({ email: values.email, password: values.password })
            ).unwrap()

            toast.success('Login successful!');

            const role = response.user.role;
            if (role === 'admin') navigate('/admin/dashboard');
            else if (role === 'seller') navigate('/seller/dashboard');
            else navigate('/');
        } catch (error) {
            toast.error(error || 'Login failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex justify-center items-center min-h-screen bg-gray-100 px-4">
            <div className="bg-white shadow-xl rounded-2xl w-full max-w-md p-8">
                <div className="text-center mb-6">
                    <Title level={2} className="!mb-1">Welcome Back</Title>
                    <Text type="secondary">Login to your account</Text>
                </div>

                <Form
                    name="login"
                    initialValues={{ remember: true }}
                    onFinish={onFinish}
                    layout="vertical"
                    size="large"
                    className={loading || isLoading ? 'opacity-70 pointer-events-none' : ''}
                >
                    {/* Email */}
                    <Form.Item
                        name="email"
                        rules={[
                            { required: true, message: 'Please input your email!' },
                            { type: 'email', message: 'Please enter a valid email!' },
                        ]}
                    >
                        <Input
                            prefix={<MailOutlined className="text-gray-500" />}
                            placeholder="Email"
                            className="rounded-lg"
                        />
                    </Form.Item>

                    {/* Password */}
                    <Form.Item
                        name="password"
                        rules={[{ required: true, message: 'Please input your password!' }]}
                    >
                        <Input.Password
                            prefix={<LockOutlined className="text-gray-500" />}
                            placeholder="Password"
                            className="rounded-lg"
                        />
                    </Form.Item>

                    {/* Remember + Forgot */}
                    <div className="flex items-center justify-between mb-4">
                        <Form.Item name="remember" valuePropName="checked" noStyle>
                            <Checkbox>Remember me</Checkbox>
                        </Form.Item>
                        <a
                            href="/forgot-password"
                            className="text-blue-600 hover:underline text-sm"
                        >
                            Forgot password?
                        </a>
                    </div>

                    {/* Submit Button */}
                    <Form.Item>
                        <Button
                            type="primary"
                            htmlType="submit"
                            block
                            loading={loading || isLoading}
                            className="rounded-lg h-11"
                        >
                            {loading || isLoading ? 'Logging in...' : 'Log in'}
                        </Button>
                    </Form.Item>

                    {/* Signup Link */}
                    <div className="text-center text-sm text-gray-600">
                        Don't have an account?{' '}
                        <a href="/signup" className="text-blue-600 hover:underline">
                            Sign up now
                        </a>
                    </div>
                </Form>
            </div>
        </div>
    );
};

export default Login;
