import React, { useState, useEffect, useCallback } from 'react';
import ProductCard from '../components/ProductCard';
import { Link } from 'react-router-dom';
import { debounce } from 'lodash';

// HomePage Component: Displays products with filtering and sorting options
function HomePage() {
    // State for products, loading status, errors, and categories
    const [products, setProducts] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [categories, setCategories] = useState([]);

    // State for filter and sort controls
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('');
    const [minPrice, setMinPrice] = useState('');
    const [maxPrice, setMaxPrice] = useState('');
    const [sortBy, setSortBy] = useState('created_at');
    const [sortOrder, setSortOrder] = useState('DESC');

    // Effect hook to fetch categories for the filter dropdown
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await fetch('http://localhost:5000/api/categories');
                if (!response.ok) throw new Error('Failed to fetch categories');
                const data = await response.json();
                setCategories(data);
            } catch (err) {
                console.error("Error fetching categories for filter:", err);
            }
        };
        fetchCategories();
    }, []);

    // Callback hook to fetch products based on current filter/sort state
    const fetchProducts = useCallback(async () => {
        setIsLoading(true);
        setError(null);

        const params = new URLSearchParams();
        if (searchTerm) params.append('search', searchTerm);
        if (selectedCategory) params.append('category', selectedCategory);
        if (minPrice) params.append('minPrice', minPrice);
        if (maxPrice) params.append('maxPrice', maxPrice);
        if (sortBy) params.append('sortBy', sortBy);
        if (sortOrder) params.append('order', sortOrder);

        const queryString = params.toString();
        const apiUrl = `http://localhost:5000/api/products${queryString ? `?${queryString}` : ''}`;

        console.log("Fetching products from:", apiUrl);

        try {
            const response = await fetch(apiUrl);
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            setProducts(data);
        } catch (err) {
            console.error("Failed to fetch products:", err);
            setError(err.message || 'Failed to load products.');
            setProducts([]);
        } finally {
            setIsLoading(false);
        }
    }, [searchTerm, selectedCategory, minPrice, maxPrice, sortBy, sortOrder]);

    // Debounced version of fetchProducts for search input
    // eslint-disable-next-line react-hooks/exhaustive-deps
    const debouncedFetch = useCallback(debounce(fetchProducts, 500), [fetchProducts]);

    // Effect hook to trigger fetch when filters (excluding search term) change
    useEffect(() => {
        if (searchTerm === '') {
             fetchProducts();
        }
    }, [selectedCategory, minPrice, maxPrice, sortBy, sortOrder, fetchProducts, searchTerm]);


    // Effect hook for initial product fetch on component mount
    useEffect(() => {
        fetchProducts();
    }, [fetchProducts]);

    // Handler for search input changes (uses debounced fetch)
    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
        debouncedFetch();
    };

    // Handler to reset all filters to default values
    const handleResetFilters = () => {
        setSearchTerm('');
        setSelectedCategory('');
        setMinPrice('');
        setMaxPrice('');
        setSortBy('created_at');
        setSortOrder('DESC');
    };

    const lightInputSelectClasses = "w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900 placeholder-gray-500";

    // Render the HomePage UI
    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-6 text-center">Our Products</h1>

            {/* Filter and Search Controls Section */}
            <div className="bg-gray-100 p-4 rounded-lg mb-8 shadow grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
                {/* Search Input */}
                <div>
                    <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">Search</label>
                    <input
                        type="text"
                        id="search"
                        placeholder="Search by name or description..."
                        value={searchTerm}
                        onChange={handleSearchChange}
                        className={lightInputSelectClasses}
                    />
                </div>

                {/* Category Select */}
                <div>
                    <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                    <select
                        id="category"
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        className={lightInputSelectClasses}
                    >
                        <option value="">All Categories</option>
                        {categories.map(cat => (
                            <option key={cat.category_id} value={cat.name}>
                                {cat.name}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Price Range Inputs */}
                <div className="grid grid-cols-2 gap-2">
                     <div>
                        <label htmlFor="minPrice" className="block text-sm font-medium text-gray-700 mb-1">Min Price</label>
                        <input
                            type="number"
                            id="minPrice"
                            placeholder="Min $"
                            value={minPrice}
                            onChange={(e) => setMinPrice(e.target.value)}
                            min="0"
                            step="0.01"
                            className={lightInputSelectClasses}
                        />
                    </div>
                     <div>
                        <label htmlFor="maxPrice" className="block text-sm font-medium text-gray-700 mb-1">Max Price</label>
                        <input
                            type="number"
                            id="maxPrice"
                            placeholder="Max $"
                            value={maxPrice}
                            onChange={(e) => setMaxPrice(e.target.value)}
                            min="0"
                            step="0.01"
                            className={lightInputSelectClasses}
                        />
                    </div>
                </div>

                 {/* Sort By & Order Selects */}
                 <div className="grid grid-cols-2 gap-2">
                     <div>
                        <label htmlFor="sortBy" className="block text-sm font-medium text-gray-700 mb-1">Sort By</label>
                        <select
                            id="sortBy"
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                            className={lightInputSelectClasses}
                        >
                            <option value="created_at">Date Added</option>
                            <option value="price">Price</option>
                            <option value="name">Name</option>
                        </select>
                    </div>
                     <div>
                        <label htmlFor="sortOrder" className="block text-sm font-medium text-gray-700 mb-1">Order</label>
                        <select
                            id="sortOrder"
                            value={sortOrder}
                            onChange={(e) => setSortOrder(e.target.value)}
                            className={lightInputSelectClasses}
                        >
                            <option value="DESC">Descending</option>
                            <option value="ASC">Ascending</option>
                        </select>
                    </div>
                </div>

                {/* Reset Filters Button */}
                <div className="md:col-span-2 lg:col-span-4 flex justify-end pt-2">
                     <button
                        onClick={handleResetFilters}
                        className="text-sm text-blue-600 hover:text-blue-800 hover:underline focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded"
                     >
                        Reset Filters
                     </button>
                </div>

            </div>

            {/* Product Display Area */}
            {isLoading ? (
                <div className="text-center py-10"><p>Loading products...</p></div>
            ) : error ? (
                <div className="text-center py-10 px-4">
                    <p className="text-red-600 bg-red-100 p-3 rounded">Error: {error}</p>
                </div>
            ) : products.length === 0 ? (
                <div className="text-center py-10">
                    <p className="text-gray-600">No products found matching your criteria.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {products.map(product => (
                        <Link key={product.product_id} to={`/products/${product.product_id}`}>
                            <ProductCard product={product} />
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}

// Export the HomePage component
export default HomePage;