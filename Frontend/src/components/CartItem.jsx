import React, { useState } from 'react';
import { Card, Button, InputNumber, Tag, message, Spin } from 'antd';
import { DeleteOutlined, PlusOutlined, MinusOutlined, ExclamationOutlined } from '@ant-design/icons';
import { useDispatch } from 'react-redux';
import { removeFromCart, updateCartItem } from '../features/auth/authSlice';

const CartItem = ({ item, product }) => {
    const dispatch = useDispatch();
    const [updating, setUpdating] = useState(false);
    const [removing, setRemoving] = useState(false);

    const handleQuantityChange = async (value) => {
        if (value < 1 || value > product.stock) return;

        setUpdating(true);
        try {
            await dispatch(updateCartItem({
                productId: item.productId,
                count: value
            })).unwrap();
        } catch (error) {
            message.error(error || 'Failed to update quantity');
        } finally {
            setUpdating(false);
        }
    };

    const handleRemove = async () => {
        setRemoving(true);
        try {
            await dispatch(removeFromCart(item.productId)).unwrap();
        } catch (error) {
            message.error(error || 'Failed to remove product');
            setRemoving(false);
        }
    };

    const incrementQuantity = () => {
        if (item.count < product.stock) {
            handleQuantityChange(item.count + 1);
        } else {
            message.warning(`Maximum available stock is ${product.stock}`);
        }
    };

    const decrementQuantity = () => {
        if (item.count > 1) {
            handleQuantityChange(item.count - 1);
        }
    };

    if (!product) {
        return (
            <Card className="mb-4 shadow-sm">
                <div className="flex items-center justify-center py-8 text-gray-500">
                    <Spin size="small" className="mr-2" />
                    Loading product...
                </div>
            </Card>
        );
    }

    const isOutOfStock = product.stock === 0;
    const isLowStock = product.stock > 0 && product.stock < 10;

    return (
        <Card className="mb-4 shadow-sm hover:shadow-md transition-shadow border-l-4 border-l-blue-500">
            <div className="flex flex-col md:flex-row gap-4">
                {/* Product Image */}
                <div className="flex-shrink-0 w-full md:w-32 h-32 bg-gray-100 rounded-lg overflow-hidden flex items-center justify-center">
                    <img
                        src={product.thumbnail || product.images?.[0]?.url || '/placeholder-image.jpg'}
                        alt={product.title}
                        className="w-full h-full object-scale-down p-2"
                        onError={(e) => {
                            e.target.src = '/placeholder-image.jpg';
                            e.target.className = 'w-full h-full object-scale-down p-2';
                        }}
                    />
                </div>

                {/* Product Details */}
                <div className="flex-1 flex flex-col justify-between">
                    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                        {/* Product Info */}
                        <div className="flex-1">
                            <h3 className="text-lg font-semibold text-gray-800 mb-2 hover:text-blue-600 cursor-pointer"
                                onClick={() => window.open(`/products/${product._id}`, '_blank')}>
                                {product.title}
                            </h3>
                            <p className="text-gray-600 text-sm mb-2 line-clamp-2">
                                {product.description}
                            </p>
                            <div className="flex flex-wrap gap-2 mb-3">
                                <Tag color="blue">{product.brand}</Tag>
                                <Tag color="green">{product.category}</Tag>
                                {isOutOfStock && (
                                    <Tag color="red" icon={<ExclamationOutlined />}>
                                        Out of Stock
                                    </Tag>
                                )}
                                {isLowStock && !isOutOfStock && (
                                    <Tag color="orange">Only {product.stock} left</Tag>
                                )}
                            </div>
                        </div>

                        {/* Price */}
                        <div className="text-right">
                            <p className="text-2xl font-bold text-green-600 mb-2">
                                ₹{product.price}
                            </p>
                            <p className="text-gray-500 text-sm">
                                ₹{product.price} × {item.count} =
                                <span className="font-semibold text-gray-800 ml-1">
                                    ₹{(product.price * item.count).toFixed(2)}
                                </span>
                            </p>
                        </div>
                    </div>

                    {/* Quantity Controls and Actions */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mt-4 pt-4 border-t border-gray-200">
                        {/* Quantity Controls */}
                        <div className="flex items-center gap-3">
                            <span className="text-gray-700 font-medium">Quantity:</span>
                            <div className="flex items-center gap-1">
                                <Button
                                    icon={<MinusOutlined />}
                                    size="small"
                                    onClick={decrementQuantity}
                                    disabled={item.count <= 1 || updating || isOutOfStock}
                                    className="flex items-center justify-center w-8 h-8"
                                />
                                <div className="relative">
                                    <InputNumber
                                        min={1}
                                        max={product.stock}
                                        value={item.count}
                                        onChange={handleQuantityChange}
                                        controls={false}
                                        className="w-16 text-center"
                                        size="small"
                                        disabled={updating || isOutOfStock}
                                    />
                                    {updating && (
                                        <Spin size="small" className="absolute right-2 top-1/2 transform -translate-y-1/2" />
                                    )}
                                </div>
                                <Button
                                    icon={<PlusOutlined />}
                                    size="small"
                                    onClick={incrementQuantity}
                                    disabled={item.count >= product.stock || updating || isOutOfStock}
                                    className="flex items-center justify-center w-8 h-8"
                                />
                            </div>
                            <span className="text-gray-500 text-sm">
                                Max: {product.stock}
                            </span>
                        </div>

                        {/* Remove Button */}
                        <Button
                            type="text"
                            danger
                            icon={<DeleteOutlined />}
                            onClick={handleRemove}
                            loading={removing}
                            disabled={removing}
                            className="text-red-500 hover:text-red-700 hover:bg-red-50 px-3 py-1 rounded"
                        >
                            {removing ? 'Removing...' : 'Remove'}
                        </Button>
                    </div>
                </div>
            </div>
        </Card>
    );
};

export default CartItem;