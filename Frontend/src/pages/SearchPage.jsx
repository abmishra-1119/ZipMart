// pages/SearchPage.jsx
import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
    Row,
    Col,
    Pagination,
    Spin,
    Empty,
    Alert,
    Card,
    Input,
    Button,
    Tag
} from 'antd';
import { SearchOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import { searchProduct } from '../features/product/productSlice';
import ProductCard from '../components/ProductCard';

const { Search } = Input;

const SearchPage = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const { searchResults, isLoading, message, pagination } = useSelector(state => state.products);

    const [localSearchQuery, setLocalSearchQuery] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(12);

    const query = searchParams.get('q') || '';

    useEffect(() => {
        if (query) {
            setLocalSearchQuery(query);
            dispatch(searchProduct({
                query,
                page: currentPage,
                limit: pageSize
            }));
        }
    }, [query, currentPage, pageSize, dispatch]);

    const handleSearch = (value) => {
        if (value.trim()) {
            setSearchParams({ q: value.trim() });
            setCurrentPage(1); // Reset to first page on new search
        }
    };

    const handlePageChange = (page, size) => {
        setCurrentPage(page);
        setPageSize(size);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleAddToCart = (product) => {
        console.log('Add to cart:', product);
        // Implement add to cart functionality
    };

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="container mx-auto px-4">
                {/* Header */}
                <div className="mb-8">
                    <Button
                        icon={<ArrowLeftOutlined />}
                        onClick={() => navigate(-1)}
                        className="mb-4"
                    >
                        Back
                    </Button>

                    <div className="text-center mb-6">
                        <h1 className="text-3xl font-bold text-gray-800 mb-4">
                            Search Products
                        </h1>

                        {/* Search Bar */}
                        <div className="max-w-2xl mx-auto">
                            <Search
                                size="large"
                                placeholder="Search for products..."
                                value={localSearchQuery}
                                onChange={(e) => setLocalSearchQuery(e.target.value)}
                                onSearch={handleSearch}
                                enterButton={<SearchOutlined />}
                            />
                        </div>
                    </div>

                    {/* Search Info */}
                    {query && (
                        <Card className="mb-6">
                            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                                <div>
                                    <h2 className="text-lg font-semibold text-gray-800">
                                        Search Results for: "{query}"
                                    </h2>
                                    {searchResults.length > 0 && (
                                        <p className="text-gray-600 mt-1">
                                            Found {pagination.totalProducts} product(s)
                                        </p>
                                    )}
                                </div>

                                {searchResults.length > 0 && (
                                    <Tag color="blue" className="text-base">
                                        Page {currentPage} of {pagination.totalPages}
                                    </Tag>
                                )}
                            </div>
                        </Card>
                    )}
                </div>

                {/* Error Message */}
                {message && (
                    <Alert
                        message={message}
                        type="error"
                        closable
                        className="mb-6"
                    />
                )}

                {/* Loading State */}
                {isLoading ? (
                    <div className="flex justify-center items-center h-64">
                        <Spin size="large" />
                    </div>
                ) : (
                    <>
                        {/* Search Results */}
                        {query ? (
                            searchResults.length > 0 ? (
                                <>
                                    {/* Products Grid */}
                                    <Row gutter={[16, 16]}>
                                        {searchResults.map(product => (
                                            <Col
                                                key={product._id}
                                                xs={24}
                                                sm={12}
                                                lg={8}
                                                xl={6}
                                                className="flex"
                                            >
                                                <ProductCard
                                                    product={product}
                                                    onAddToCart={handleAddToCart}
                                                />
                                            </Col>
                                        ))}
                                    </Row>

                                    {/* Pagination */}
                                    {pagination.totalPages > 1 && (
                                        <div className="flex justify-center mt-12">
                                            <Pagination
                                                current={currentPage}
                                                total={pagination.totalProducts}
                                                pageSize={pageSize}
                                                onChange={handlePageChange}
                                                showSizeChanger
                                                showQuickJumper
                                                showTotal={(total, range) =>
                                                    `${range[0]}-${range[1]} of ${total} items`
                                                }
                                                pageSizeOptions={['12', '24', '36', '48']}
                                                className="pagination-custom"
                                            />
                                        </div>
                                    )}
                                </>
                            ) : (
                                <Empty
                                    description={
                                        <div className="space-y-4">
                                            <p className="text-lg text-gray-600">
                                                No products found for "{query}"
                                            </p>
                                            <p className="text-gray-500">
                                                Try adjusting your search terms or browse all products
                                            </p>
                                            <Button
                                                type="primary"
                                                onClick={() => navigate('/products')}
                                            >
                                                Browse All Products
                                            </Button>
                                        </div>
                                    }
                                    className="flex flex-col items-center justify-center h-64"
                                />
                            )
                        ) : (
                            /* Initial State - No search query */
                            <Card className="text-center py-12">
                                <div className="space-y-4">
                                    <SearchOutlined className="text-6xl text-gray-300" />
                                    <h3 className="text-xl font-semibold text-gray-600">
                                        Search for Products
                                    </h3>
                                    <p className="text-gray-500 max-w-md mx-auto">
                                        Enter keywords in the search bar above to find products by name, description, or features.
                                    </p>
                                </div>
                            </Card>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default SearchPage;