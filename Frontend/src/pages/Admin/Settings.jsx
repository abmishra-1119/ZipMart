// components/admin/Settings.jsx
import React, { useState } from 'react';
import {
    Card,
    Form,
    Input,
    Button,
    Switch,
    Select,
    Divider,
    message,
    Row,
    Col,
    Typography,
    Upload
} from 'antd';
import {
    SaveOutlined,
    UploadOutlined,
    NotificationOutlined,
    GlobalOutlined
} from '@ant-design/icons';

const { Title, Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;

const Settings = () => {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);

    const onFinish = async (values) => {
        setLoading(true);
        try {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1000));
            message.success('Settings saved successfully');
        } catch (error) {
            message.error('Failed to save settings');
        } finally {
            setLoading(false);
        }
    };

    const notificationSettings = [
        { name: 'emailNotifications', label: 'Email Notifications', default: true },
        { name: 'orderAlerts', label: 'Order Alerts', default: true },
        { name: 'inventoryAlerts', label: 'Low Stock Alerts', default: true },
        { name: 'userRegistrations', label: 'New User Registrations', default: false },
    ];

    return (
        <div>
            <div className="mb-6">
                <Title level={2}>Settings</Title>
                <Text type="secondary">Manage your admin panel preferences and system settings</Text>
            </div>

            <Form
                form={form}
                layout="vertical"
                onFinish={onFinish}
                initialValues={{
                    siteName: 'Admin Panel',
                    siteDescription: 'E-commerce Administration System',
                    currency: 'USD',
                    timezone: 'UTC',
                    maintenanceMode: false,
                    ...notificationSettings.reduce((acc, setting) => ({
                        ...acc,
                        [setting.name]: setting.default
                    }), {})
                }}
            >
                {/* General Settings */}
                <Card title="General Settings" className="mb-6">
                    <Row gutter={[16, 0]}>
                        <Col xs={24} md={12}>
                            <Form.Item
                                label="Site Name"
                                name="siteName"
                                rules={[{ required: true, message: 'Please enter site name' }]}
                            >
                                <Input size="large" placeholder="Enter site name" />
                            </Form.Item>
                        </Col>
                        <Col xs={24} md={12}>
                            <Form.Item
                                label="Default Currency"
                                name="currency"
                                rules={[{ required: true, message: 'Please select currency' }]}
                            >
                                <Select size="large">
                                    <Option value="USD">USD ($)</Option>
                                    <Option value="EUR">EUR (€)</Option>
                                    <Option value="GBP">GBP (£)</Option>
                                    <Option value="INR">INR (₹)</Option>
                                </Select>
                            </Form.Item>
                        </Col>
                    </Row>

                    <Form.Item
                        label="Site Description"
                        name="siteDescription"
                    >
                        <TextArea
                            rows={3}
                            placeholder="Enter site description"
                        />
                    </Form.Item>

                    <Form.Item
                        label="Timezone"
                        name="timezone"
                    >
                        <Select size="large">
                            <Option value="UTC">UTC</Option>
                            <Option value="EST">Eastern Time (EST)</Option>
                            <Option value="PST">Pacific Time (PST)</Option>
                            <Option value="GMT">Greenwich Mean Time (GMT)</Option>
                        </Select>
                    </Form.Item>
                </Card>

                {/* Notification Settings */}
                <Card title="Notification Settings" className="mb-6">
                    <div className="space-y-4">
                        {notificationSettings.map((setting) => (
                            <Form.Item
                                key={setting.name}
                                name={setting.name}
                                valuePropName="checked"
                                className="mb-0"
                            >
                                <div className="flex justify-between items-center">
                                    <div>
                                        <Text strong>{setting.label}</Text>
                                        <br />
                                        <Text type="secondary" className="text-sm">
                                            Receive notifications for {setting.label.toLowerCase()}
                                        </Text>
                                    </div>
                                    <Switch />
                                </div>
                            </Form.Item>
                        ))}
                    </div>
                </Card>

                {/* Security Settings */}
                <Card title="Security Settings" className="mb-6">
                    <Form.Item
                        label="Maintenance Mode"
                        name="maintenanceMode"
                        valuePropName="checked"
                    >
                        <div className="flex justify-between items-center">
                            <div>
                                <Text strong>Enable Maintenance Mode</Text>
                                <br />
                                <Text type="secondary" className="text-sm">
                                    Site will be unavailable to regular users
                                </Text>
                            </div>
                            <Switch />
                        </div>
                    </Form.Item>

                    <Form.Item
                        label="Session Timeout"
                        name="sessionTimeout"
                    >
                        <Select size="large" defaultValue="30">
                            <Option value="15">15 minutes</Option>
                            <Option value="30">30 minutes</Option>
                            <Option value="60">60 minutes</Option>
                            <Option value="120">2 hours</Option>
                        </Select>
                    </Form.Item>
                </Card>

                {/* Logo Upload */}
                <Card title="Branding" className="mb-6">
                    <Form.Item label="Site Logo">
                        <Upload
                            listType="picture"
                            maxCount={1}
                            beforeUpload={() => false} // Prevent auto upload
                        >
                            <Button icon={<UploadOutlined />}>Upload Logo</Button>
                        </Upload>
                        <Text type="secondary" className="text-sm block mt-2">
                            Recommended size: 200x50 pixels
                        </Text>
                    </Form.Item>

                    <Form.Item label="Favicon">
                        <Upload
                            listType="picture"
                            maxCount={1}
                            beforeUpload={() => false}
                        >
                            <Button icon={<UploadOutlined />}>Upload Favicon</Button>
                        </Upload>
                        <Text type="secondary" className="text-sm block mt-2">
                            Recommended size: 32x32 pixels
                        </Text>
                    </Form.Item>
                </Card>

                <Divider />

                <Form.Item>
                    <Button
                        type="primary"
                        htmlType="submit"
                        size="large"
                        icon={<SaveOutlined />}
                        loading={loading}
                    >
                        Save Settings
                    </Button>
                </Form.Item>
            </Form>
        </div>
    );
};

export default Settings;