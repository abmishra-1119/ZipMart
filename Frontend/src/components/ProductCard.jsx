import React, { useState } from "react";
import { Card, Rate, Button, Tag } from "antd";
import { ShoppingCartOutlined, EyeOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { addToCart } from "../features/auth/authSlice";
import { toast } from "react-toastify";

const { Meta } = Card;

const ProductCard = ({ product }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { isAuthenticated, cart } = useSelector((state) => state.auth);
  const [isAddingToCart, setIsAddingToCart] = useState(false);

  const isInCart = cart?.some((item) => item.productId === product._id);

  const handleViewDetails = () => {
    navigate(`/products/${product._id}`);
  };

  const handleAddToCart = async (e) => {
    e.stopPropagation();

    if (!isAuthenticated) {
      toast.warning("Please login to add items to cart");
      return;
    }

    setIsAddingToCart(true);
    try {
      await dispatch(addToCart({ productId: product._id, count: 1 })).unwrap();
      toast.success("Product added to cart successfully!");
    } catch (error) {
      toast.error(error || "Failed to add product to cart");
    } finally {
      setIsAddingToCart(false);
    }
  };

  return (
    <Card
      hoverable
      className="w-full h-full border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300 cursor-pointer"
      onClick={handleViewDetails}
      cover={
        <div className="h-64 overflow-hidden flex items-center justify-center bg-white">
          <img
            alt={product.title}
            src={
              product.thumbnail ||
              product.images?.[0]?.url ||
              "/placeholder-image.jpg"
            }
            className="w-full h-full object-contain p-2"
            onError={(e) => {
              e.target.src = "/placeholder-image.jpg";
              e.target.className = "w-full h-full object-contain p-2";
            }}
          />
        </div>
      }
      actions={[
        <Button
          type="primary"
          icon={<ShoppingCartOutlined />}
          loading={isAddingToCart}
          onClick={handleAddToCart}
          className={`!border-none ${
            isInCart
              ? "!bg-orange-500 hover:!bg-orange-600"
              : "!bg-blue-600 hover:!bg-blue-700"
          }`}
        >
          {isInCart ? "Added" : "Add to Cart"}
        </Button>,
        <Button
          icon={<EyeOutlined />}
          onClick={handleViewDetails}
          className="!text-gray-600 hover:!text-blue-600"
        >
          View
        </Button>,
      ]}
    >
      <Meta
        title={
          <div className="flex justify-between items-start">
            <span className="text-lg font-semibold text-gray-800 line-clamp-2">
              {product.title}
            </span>
          </div>
        }
        description={
          <div className="space-y-2">
            <p className="text-gray-600 text-sm line-clamp-2 min-h-[40px]">
              {product.description}
            </p>

            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold text-green-600">
                ₹{product.price}
              </span>
              {product.stock < 10 ? (
                <Tag color="red" className="!text-xs">
                  Low Stock
                </Tag>
              ) : (
                <Tag color="green" className="!text-xs">
                  In Stock
                </Tag>
              )}
            </div>

            <div className="flex items-center justify-between">
              <Rate
                disabled
                value={product.totalRating || 0}
                className="text-sm"
                allowHalf
              />
              <span className="text-xs text-gray-500">
                {product.ratings?.length || 0} reviews
              </span>
            </div>

            <div className="flex flex-wrap gap-1">
              <Tag color="blue" className="text-xs">
                {product.brand}
              </Tag>
              <Tag color="green" className="text-xs">
                {product.category}
              </Tag>
            </div>
          </div>
        }
      />
    </Card>
  );
};

export default ProductCard;
