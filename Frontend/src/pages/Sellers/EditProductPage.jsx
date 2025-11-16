// pages/seller/EditProductPage.jsx
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
    Card,
    Form,
    Input,
    InputNumber,
    Select,
    Upload,
    Button,
    Row,
    Col,
    message,
    Spin,
    Image,
    Space
} from 'antd';
import {
    ArrowLeftOutlined,
    SaveOutlined,
    DeleteOutlined,
    EyeOutlined
} from '@ant-design/icons';
import { getMyProducts, updateMyProduct } from '../../features/seller/sellerSlice';

const { Option } = Select;
const { TextArea } = Input;

const EditProductPage = () => {
    const { id } = useParams();
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [form] = Form.useForm();

    const { products, isLoading } = useSelector(state => state.seller);

    const [product, setProduct] = useState(null);
    const [imageList, setImageList] = useState([]);
    const [loading, setLoading] = useState(true);

    const categories = [
        'Electronics', 'Clothing', 'Books', 'Home & Kitchen',
        'Beauty', 'Sports', 'Toys', 'Automotive'
    ];

    const brands = [
        'Apple', 'Samsung', 'Nike', 'Adidas', 'Sony', 'LG',
        'Microsoft', 'Dell', 'HP', 'Canon', 'Nikon'
    ];

    useEffect(() => {
        dispatch(getMyProducts({ page: 1, limit: 100 })).then(() => {
            setLoading(false);
        });
    }, [dispatch]);

    useEffect(() => {
        if (products.length > 0 && id) {
            const foundProduct = products.find(p => p._id === id);
            if (foundProduct) {
                setProduct(foundProduct);
                form.setFieldsValue({
                    title: foundProduct.title,
                    description: foundProduct.description,
                    price: foundProduct.price,
                    stock: foundProduct.stock,
                    category: foundProduct.category,
                    brand: foundProduct.brand,
                });
                setImageList(foundProduct.images.map(img => ({
                    url: img.url,
                    uid: img._id,
                    name: 'product-image'
                })));
            } else {
                message.error('Product not found');
                navigate('/seller/products');
            }
        }
    }, [products, id, form, navigate]);

    const handleSubmit = async (values) => {
        try {
            await dispatch(updateMyProduct({
                productId: id,
                productData: values
            })).unwrap();
            message.success('Product updated successfully!');
            navigate('/seller/products');
        } catch (error) {
            message.error(error || 'Failed to update product');
        }
    };

    const handleViewProduct = () => {
        window.open(`/products/${id}`, '_blank');
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <Spin size="large" />
            </div>
        );
    }

    if (!product) {
        return (
            <div className="text-center py-12">
                <p className="text-gray-500">Product not found</p>
                <Button onClick={() => navigate('/seller/products')}>
                    Back to Products
                </Button>
            </div>
        );
    }

    return (
        <div>
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center">
                    <Button
                        icon={<ArrowLeftOutlined />}
                        onClick={() => navigate('/seller/products')}
                        className="mr-4"
                    >
                        Back
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800">Edit Product</h1>
                        <p className="text-gray-600">Update product information</p>
                    </div>
                </div>
                <Space>
                    <Button icon={<EyeOutlined />} onClick={handleViewProduct}>
                        View Product
                    </Button>
                </Space>
            </div>

            <Form
                form={form}
                layout="vertical"
                onFinish={handleSubmit}
            >
                <Row gutter={[24, 24]}>
                    {/* Product Images */}
                    <Col xs={24} lg={12}>
                        <Card title="Product Images" className="h-full">
                            <div className="space-y-4">
                                {product.images.map((image, index) => (
                                    <div key={image._id} className="border rounded-lg p-2">
                                        <Image
                                            src={image.url}
                                            alt={`Product ${index + 1}`}
                                            className="w-full h-32 object-cover rounded"
                                            preview={{
                                                mask: <EyeOutlined />,
                                            }}
                                        />
                                    </div>
                                ))}
                            </div>
                            <p className="text-gray-500 text-sm mt-4">
                                Note: Image updates require separate upload functionality
                            </p>
                        </Card>
                    </Col>

                    {/* Basic Information */}
                    <Col xs={24} lg={12}>
                        <Card title="Basic Information" className="h-full">
                            <Row gutter={16}>
                                <Col xs={24}>
                                    <Form.Item
                                        name="title"
                                        label="Product Title"
                                        rules={[{ required: true, message: 'Please enter product title' }]}
                                    >
                                        <Input placeholder="Enter product title" />
                                    </Form.Item>
                                </Col>
                                <Col xs={24}>
                                    <Form.Item
                                        name="description"
                                        label="Description"
                                        rules={[{ required: true, message: 'Please enter product description' }]}
                                    >
                                        <TextArea
                                            rows={4}
                                            placeholder="Enter product description"
                                        />
                                    </Form.Item>
                                </Col>
                            </Row>
                        </Card>
                    </Col>

                    {/* Pricing & Inventory */}
                    <Col xs={24} lg={12}>
                        <Card title="Pricing & Inventory">
                            <Row gutter={16}>
                                <Col xs={12}>
                                    <Form.Item
                                        name="price"
                                        label="Price ($)"
                                        rules={[{ required: true, message: 'Please enter price' }]}
                                    >
                                        <InputNumber
                                            min={0}
                                            step={0.01}
                                            style={{ width: '100%' }}
                                            placeholder="0.00"
                                        />
                                    </Form.Item>
                                </Col>
                                <Col xs={12}>
                                    <Form.Item
                                        name="stock"
                                        label="Stock Quantity"
                                        rules={[{ required: true, message: 'Please enter stock quantity' }]}
                                    >
                                        <InputNumber
                                            min={0}
                                            style={{ width: '100%' }}
                                            placeholder="0"
                                        />
                                    </Form.Item>
                                </Col>
                            </Row>
                        </Card>
                    </Col>

                    {/* Categories & Brand */}
                    <Col xs={24} lg={12}>
                        <Card title="Categories & Brand">
                            <Row gutter={16}>
                                <Col xs={24} md={12}>
                                    <Form.Item
                                        name="category"
                                        label="Category"
                                        rules={[{ required: true, message: 'Please select category' }]}
                                    >
                                        <Select placeholder="Select category">
                                            {categories.map(category => (
                                                <Option key={category} value={category}>
                                                    {category}
                                                </Option>
                                            ))}
                                        </Select>
                                    </Form.Item>
                                </Col>
                                <Col xs={24} md={12}>
                                    <Form.Item
                                        name="brand"
                                        label="Brand"
                                        rules={[{ required: true, message: 'Please select brand' }]}
                                    >
                                        <Select placeholder="Select brand">
                                            {brands.map(brand => (
                                                <Option key={brand} value={brand}>
                                                    {brand}
                                                </Option>
                                            ))}
                                        </Select>
                                    </Form.Item>
                                </Col>
                            </Row>
                        </Card>
                    </Col>

                    {/* Product Stats */}
                    <Col xs={24}>
                        <Card title="Product Statistics">
                            <Row gutter={[16, 16]}>
                                <Col xs={12} md={6}>
                                    <div className="text-center">
                                        <p className="text-2xl font-bold text-blue-600">{product.totalRating || 0}</p>
                                        <p className="text-gray-600">Average Rating</p>
                                    </div>
                                </Col>
                                <Col xs={12} md={6}>
                                    <div className="text-center">
                                        <p className="text-2xl font-bold text-green-600">{product.ratings?.length || 0}</p>
                                        <p className="text-gray-600">Total Reviews</p>
                                    </div>
                                </Col>
                                <Col xs={12} md={6}>
                                    <div className="text-center">
                                        <p className="text-2xl font-bold text-purple-600">{product.ordersCount || 0}</p>
                                        <p className="text-gray-600">Times Ordered</p>
                                    </div>
                                </Col>
                                <Col xs={12} md={6}>
                                    <div className="text-center">
                                        <p className="text-2xl font-bold text-orange-600">
                                            ${((product.price || 0) * (product.ordersCount || 0)).toFixed(2)}
                                        </p>
                                        <p className="text-gray-600">Total Revenue</p>
                                    </div>
                                </Col>
                            </Row>
                        </Card>
                    </Col>

                    {/* Submit Button */}
                    <Col xs={24}>
                        <Card>
                            <div className="flex justify-between">
                                <Button
                                    danger
                                    icon={<DeleteOutlined />}
                                    onClick={() => navigate('/seller/products')}
                                >
                                    Delete Product
                                </Button>
                                <Space>
                                    <Button
                                        size="large"
                                        onClick={() => navigate('/seller/products')}
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        type="primary"
                                        size="large"
                                        icon={<SaveOutlined />}
                                        htmlType="submit"
                                        loading={isLoading}
                                    >
                                        Update Product
                                    </Button>
                                </Space>
                            </div>
                        </Card>
                    </Col>
                </Row>
            </Form>
        </div>
    );
};

export default EditProductPage;