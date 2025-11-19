import React from "react";
import { Card, Select, Button, Rate, Divider } from "antd";
import { FilterOutlined, ReloadOutlined } from "@ant-design/icons";

const { Option } = Select;

const ProductFilters = ({
  filters,
  onFilterChange,
  categories = [],
  brands = [],
  onResetFilters,
}) => {
  return (
    <Card
      title={
        <div className="flex items-center gap-2">
          <FilterOutlined />
          <span>Filters</span>
        </div>
      }
      className="sticky top-4"
      extra={
        <Button
          type="link"
          icon={<ReloadOutlined />}
          onClick={onResetFilters}
          size="small"
        >
          Reset
        </Button>
      }
    >
      <div className="space-y-6">
        {/* Category Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Category
          </label>
          <Select
            placeholder="Select Category"
            value={filters.category || undefined}
            onChange={(value) => onFilterChange("category", value)}
            className="w-full"
            allowClear
          >
            {categories.map((category) => (
              <Option key={category} value={category}>
                {category}
              </Option>
            ))}
          </Select>
        </div>

        {/* Brand Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Brand
          </label>
          <Select
            placeholder="Select Brand"
            value={filters.brand || undefined}
            onChange={(value) => onFilterChange("brand", value)}
            className="w-full"
            allowClear
          >
            {brands.map((brand) => (
              <Option key={brand} value={brand}>
                {brand}
              </Option>
            ))}
          </Select>
        </div>

        <Divider className="my-4" />

        {/* Sort Options */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Sort By
          </label>
          <Select
            placeholder="Sort Products"
            value={filters.sortBy || undefined}
            onChange={(value) => onFilterChange("sortBy", value)}
            className="w-full"
            allowClear
          >
            <Option value="price">Price: Low to High</Option>
            <Option value="-price">Price: High to Low</Option>
            <Option value="createdAt">Newest First</Option>
            <Option value="-createdAt">Oldest First</Option>
            <Option value="totalRating">Highest Rated</Option>
            <Option value="-totalRating">Lowest Rated</Option>
            <Option value="title">Name: A to Z</Option>
            <Option value="-title">Name: Z to A</Option>
          </Select>
        </div>

        <Divider className="my-4" />

        {/* Order Direction */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Order
          </label>
          <Select
            value={filters.order || "desc"}
            onChange={(value) => onFilterChange("order", value)}
            className="w-full"
          >
            <Option value="asc">Ascending</Option>
            <Option value="desc">Descending</Option>
          </Select>
        </div>
      </div>
    </Card>
  );
};

export default ProductFilters;
