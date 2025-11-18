import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Row, Col, Pagination, Spin, Empty, Alert } from "antd";
import {
  getAllProducts,
  getAllCategories,
  clearMessage,
} from "../features/product/productSlice";
import ProductCard from "../components/ProductCard";
import ProductFilters from "../components/ProductFilters";

const HomePage = () => {
  const dispatch = useDispatch();
  const { products, categories, isLoading, message, pagination } = useSelector(
    (state) => state.products
  );

  const [filters, setFilters] = useState({
    page: 1,
    limit: 8,
    category: "",
    brand: "",
    sortBy: "",
    order: "desc",
  });

  // Extract unique brands from products
  const brands = [...new Set(products.map((product) => product.brand))].filter(
    Boolean
  );

  useEffect(() => {
    // Load initial products and categories
    dispatch(getAllProducts(filters));
    dispatch(getAllCategories());
  }, [dispatch]);

  useEffect(() => {
    // Reload products when filters change
    dispatch(getAllProducts(filters));
  }, [filters, dispatch]);

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
      page: 1, // Reset to first page when filters change
    }));
  };

  const handlePageChange = (page, pageSize) => {
    setFilters((prev) => ({
      ...prev,
      page,
      limit: pageSize,
    }));
    // Scroll to top when page changes
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleResetFilters = () => {
    setFilters({
      page: 1,
      limit: 12,
      category: "",
      brand: "",
      sortBy: "",
      order: "desc",
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            Our Products
          </h1>
          <p className="text-gray-600 text-lg">
            Discover amazing products at great prices
          </p>
        </div>

        {/* Error Message */}
        {message && (
          <Alert
            message={message}
            type="error"
            closable
            onClose={() => dispatch(clearMessage())}
            className="mb-6"
          />
        )}

        <Row gutter={[24, 24]}>
          {/* Filters Sidebar */}
          <Col xs={24} lg={6}>
            <ProductFilters
              filters={filters}
              onFilterChange={handleFilterChange}
              categories={categories}
              brands={brands}
              onResetFilters={handleResetFilters}
            />
          </Col>

          {/* Products Grid */}
          <Col xs={24} lg={18}>
            {isLoading ? (
              <div className="flex justify-center items-center h-64">
                <Spin size="large" />
              </div>
            ) : (
              <>
                {/* Products Count and Active Filters */}
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <p className="text-gray-600">
                      Showing {products.length} of {pagination.totalProducts}{" "}
                      products
                    </p>
                    {(filters.category || filters.brand || filters.sortBy) && (
                      <div className="flex gap-2 mt-2">
                        {filters.category && (
                          <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                            Category: {filters.category}
                          </span>
                        )}
                        {filters.brand && (
                          <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                            Brand: {filters.brand}
                          </span>
                        )}
                        {filters.sortBy && (
                          <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded">
                            Sorted by: {filters.sortBy}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                  <p className="text-gray-500 text-sm">
                    Page {filters.page} of {pagination.totalPages}
                  </p>
                </div>

                {/* Products Grid */}
                {products.length > 0 ? (
                  <>
                    <Row gutter={[16, 16]}>
                      {products.map((product) => (
                        <Col
                          key={product._id}
                          xs={24}
                          sm={12}
                          xl={8}
                          className="flex"
                        >
                          <ProductCard product={product} />
                        </Col>
                      ))}
                    </Row>

                    {/* Pagination */}
                    {pagination.totalPages > 1 && (
                      <div className="flex justify-center mt-12">
                        <Pagination
                          current={filters.page}
                          total={pagination.totalProducts}
                          pageSize={filters.limit}
                          onChange={handlePageChange}
                          showSizeChanger
                          showQuickJumper
                          showTotal={(total, range) =>
                            `${range[0]}-${range[1]} of ${total} items`
                          }
                          pageSizeOptions={["12", "24", "36", "48"]}
                          className="pagination-custom"
                        />
                      </div>
                    )}
                  </>
                ) : (
                  <Empty
                    description="No products found matching your criteria"
                    className="flex flex-col items-center justify-center h-64"
                  />
                )}
              </>
            )}
          </Col>
        </Row>
      </div>
    </div>
  );
};

export default HomePage;
