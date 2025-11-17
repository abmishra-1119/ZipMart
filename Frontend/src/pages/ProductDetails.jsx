// pages/ProductDetails.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
    Row,
    Col,
    Image,
    Rate,
    Button,
    Tag,
    Card,
    Divider,
    Input,
    message,
    Spin,
    Alert
} from 'antd';
import {
    ShoppingCartOutlined,
    ArrowLeftOutlined,
    UserOutlined,
    MailOutlined
} from '@ant-design/icons';
import { addRating, getProductById } from '../features/product/productSlice';
import { addToCart } from '../features/auth/authSlice';
import { toast } from 'react-toastify';

const { TextArea } = Input;

const ProductDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const { product, isLoading, message: productMessage } = useSelector(state => state.products);
    const { user, isAuthenticated, cart, isLoading: authLoading } = useSelector(state => state.auth);

    const [selectedImage, setSelectedImage] = useState(0);
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState('');
    const [isAddingToCart, setIsAddingToCart] = useState(false);

    useEffect(() => {
        if (id) {
            dispatch(getProductById(id));
        }
    }, [id, dispatch]);

    // Check if user has already rated this product
    useEffect(() => {
        if (product && user) {
            const userRating = product.ratings.find(r => r.postedBy?._id === user._id);
            if (userRating) {
                setRating(userRating.star);
                setComment(userRating.comment || '');
            }
        }
    }, [product, user]);

    const handleAddToCart = async () => {
        console.log(isAuthenticated);

        if (!isAuthenticated) {
            toast.warning('Please login to add items to cart');
            return;
        }

        setIsAddingToCart(true);
        try {
            await dispatch(addToCart({ productId: id, count: 1 })).unwrap();
            toast.success('Product added to cart successfully!');
        } catch (error) {
            toast.error(error || 'Failed to add product to cart');
        } finally {
            setIsAddingToCart(false);
        }
    };

    const handleSubmitRating = async () => {
        if (!isAuthenticated) {
            toast.warning('Please login to rate this product');
            return;
        }

        if (rating === 0) {
            toast.warning('Please select a rating');
            return;
        }

        try {
            await dispatch(addRating({
                productId: id,
                ratingData: { star: rating, comment }
            })).unwrap();
            toast.success('Rating submitted successfully!');
            setComment('');
        } catch (error) {
            toast.error(error || 'Failed to submit rating');
        }
    };

    const isInCart = cart?.some(item => item.productId === id);

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Spin size="large" />
            </div>
        );
    }

    if (!product) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Alert
                    message="Product Not Found"
                    description="The product you're looking for doesn't exist."
                    type="error"
                    action={
                        <Button onClick={() => navigate('/')}>
                            Back to Home
                        </Button>
                    }
                />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="container mx-auto px-4">
                {/* Back Button */}
                <Button
                    icon={<ArrowLeftOutlined />}
                    onClick={() => navigate(-1)}
                    className="mb-6"
                >
                    Back
                </Button>

                {productMessage && (
                    <Alert
                        message={productMessage}
                        type="error"
                        closable
                        className="mb-6"
                    />
                )}

                <Row gutter={[32, 32]}>
                    {/* Product Images */}
                    <Col xs={24} lg={12}>
                        <Card className="shadow-sm">
                            <div className="flex flex-col items-center">
                                {/* Main Image - Fixed height issue */}
                                <div className="w-full max-h-96 mb-4 flex items-center justify-center bg-white rounded-lg overflow-hidden">
                                    <img
                                        src={product.images[selectedImage]?.url || product.thumbnail}
                                        alt={product.title}
                                        className="w-full h-auto max-h-96 object-scale-down"
                                        onError={(e) => {
                                            e.target.src = '/placeholder-image.jpg';
                                            e.target.className = 'w-full h-auto max-h-96 object-scale-down';
                                        }}
                                    />
                                </div>

                                {/* Thumbnail Images */}
                                <div className="flex gap-2 overflow-x-auto pb-2 w-full">
                                    {product.images.map((image, index) => (
                                        <div
                                            key={image._id}
                                            className={`flex-shrink-0 w-16 h-16 border-2 rounded cursor-pointer ${selectedImage === index
                                                ? 'border-blue-500'
                                                : 'border-gray-200'
                                                }`}
                                            onClick={() => setSelectedImage(index)}
                                        >
                                            <img
                                                src={image.url}
                                                alt={`${product.title} ${index + 1}`}
                                                className="w-full h-full object-scale-down rounded bg-gray-50"
                                                onError={(e) => {
                                                    e.target.src = '/placeholder-image.jpg';
                                                    e.target.className = 'w-full h-full object-scale-down rounded bg-gray-50';
                                                }}
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </Card>
                    </Col>

                    {/* Product Details - Rest remains the same */}
                    <Col xs={24} lg={12}>
                        <Card className="shadow-sm">
                            <div className="space-y-6">
                                {/* Title and Brand */}
                                <div>
                                    <h1 className="text-3xl font-bold text-gray-800 mb-2">
                                        {product.title}
                                    </h1>
                                    <div className="flex items-center gap-2">
                                        <Tag color="blue" className="text-sm">
                                            {product.brand}
                                        </Tag>
                                        <Tag color="green" className="text-sm">
                                            {product.category}
                                        </Tag>
                                    </div>
                                </div>

                                {/* Rating */}
                                <div className="flex items-center gap-4">
                                    <Rate
                                        value={product.totalRating}
                                        disabled
                                        allowHalf
                                    />
                                    <span className="text-gray-600">
                                        ({product.ratings?.length || 0} reviews)
                                    </span>
                                </div>

                                {/* Price */}
                                <div className="text-4xl font-bold text-green-600">
                                    ₹{product.price}
                                </div>

                                {/* Stock Status */}
                                <div>
                                    {product.stock > 0 ? (
                                        <Tag color="green" className="text-base">
                                            In Stock ({product.stock} available)
                                        </Tag>
                                    ) : (
                                        <Tag color="red" className="text-base">
                                            Out of Stock
                                        </Tag>
                                    )}
                                </div>

                                {/* Description */}
                                <div>
                                    <h3 className="text-lg font-semibold mb-2">Description</h3>
                                    <p className="text-gray-700 leading-relaxed">
                                        {product.description}
                                    </p>
                                </div>

                                {/* Seller Info */}
                                <div>
                                    <h3 className="text-lg font-semibold mb-2">Seller Information</h3>
                                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                                            <UserOutlined className="text-blue-600" />
                                        </div>
                                        <div>
                                            <p className="font-medium">{product.sellerId?.name}</p>
                                            <p className="text-gray-600 text-sm flex items-center gap-1">
                                                <MailOutlined />
                                                {product.sellerId?.email}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Add to Cart Button */}
                                <div className="pt-4">
                                    <Button
                                        type="primary"
                                        size="large"
                                        icon={<ShoppingCartOutlined />}
                                        loading={isAddingToCart || authLoading}
                                        onClick={handleAddToCart}
                                        disabled={product.stock === 0}
                                        className={`w-full h-12 text-lg ${isInCart
                                            ? 'bg-orange-500 hover:bg-orange-600'
                                            : 'bg-blue-600 hover:bg-blue-700'
                                            } border-none`}
                                    >
                                        {isInCart ? 'Added to Cart' : 'Add to Cart'}
                                    </Button>
                                    {product.stock === 0 && (
                                        <p className="text-red-500 text-center mt-2">
                                            This product is currently out of stock
                                        </p>
                                    )}
                                </div>
                            </div>
                        </Card>
                    </Col>
                </Row>

                <Divider />

                {/* Ratings and Reviews Section */}
                <Row gutter={[32, 32]}>
                    <Col xs={24} lg={12}>
                        {/* Add Rating Form */}
                        <Card title="Add Your Review" className="shadow-sm">
                            {isAuthenticated ? (
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium mb-2">
                                            Your Rating
                                        </label>
                                        <Rate
                                            value={rating}
                                            onChange={setRating}
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium mb-2">
                                            Your Comment (Optional)
                                        </label>
                                        <TextArea
                                            rows={4}
                                            value={comment}
                                            onChange={(e) => setComment(e.target.value)}
                                            placeholder="Share your experience with this product..."
                                        />
                                    </div>

                                    <Button
                                        type="primary"
                                        onClick={handleSubmitRating}
                                        disabled={rating === 0}
                                    >
                                        Submit Review
                                    </Button>
                                </div>
                            ) : (
                                <div className="text-center py-4">
                                    <p className="text-gray-600 mb-4">
                                        Please login to add a review
                                    </p>
                                    <Button
                                        type="primary"
                                        onClick={() => navigate('/login')}
                                    >
                                        Login Now
                                    </Button>
                                </div>
                            )}
                        </Card>
                    </Col>

                    <Col xs={24} lg={12}>
                        {/* Existing Reviews */}
                        <Card title={`Customer Reviews (${product.ratings?.length || 0})`} className="shadow-sm">
                            {product.ratings?.length > 0 ? (
                                <div className="space-y-4 max-h-96 overflow-y-auto">
                                    {product.ratings.map((ratingItem, index) => (
                                        <div key={index} className="border-b pb-4 last:border-b-0">
                                            <div className="flex justify-between items-start mb-2">
                                                <div>
                                                    <p className="font-medium">
                                                        {ratingItem.postedBy?.name || 'Anonymous'}
                                                    </p>
                                                    <Rate
                                                        value={ratingItem.star}
                                                        disabled
                                                        size="small"
                                                    />
                                                </div>
                                                <span className="text-gray-500 text-sm">
                                                    {new Date(ratingItem.createdAt).toLocaleDateString()}
                                                </span>
                                            </div>
                                            {ratingItem.comment && (
                                                <p className="text-gray-700 mt-2">
                                                    {ratingItem.comment}
                                                </p>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-8">
                                    <p className="text-gray-500">
                                        No reviews yet. Be the first to review this product!
                                    </p>
                                </div>
                            )}
                        </Card>
                    </Col>
                </Row>
            </div>
        </div>
    );
};

export default ProductDetails;