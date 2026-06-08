// filepath: c:\Users\aimra\Desktop\MusaProject\client\src\pages\ProductsPage.jsx
import React, { useState, useEffect } from 'react';
import ProductCard from '../components/ProductCard';

function ProductsPage() {
    const [products, setProducts] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchProducts = async () => {
            setIsLoading(true);
            setError(null); 
            try {
                const response = await fetch('http://localhost:5000/api/products');
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const data = await response.json();
                setProducts(data);
            } catch (err) {
                console.error("Failed to fetch products:", err);
                setError(err.message || 'Failed to load products. Please try again later.');
            } finally {
                setIsLoading(false);
            }
        };

        fetchProducts();
    }, []); 

    return (
        <div>
            <h1 className="text-3xl font-bold text-center mb-8">Our Products</h1>

            {isLoading && (
                <div className="text-center py-10">
                    <p className="text-lg text-gray-600">Loading products...</p>
                </div>
            )}

            {error && (
                 <div className="text-center py-10 px-4">
                    <p className="text-lg text-red-600 bg-red-100 p-4 rounded border border-red-300">Error: {error}</p>
                </div>
            )}

            {!isLoading && !error && products.length === 0 && (
                 <div className="text-center py-10">
                    <p className="text-lg text-gray-600">No products found.</p>
                </div>
            )}

            {!isLoading && !error && products.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {products.map((product) => (
                        <ProductCard key={product.product_id} product={product} />
                    ))}
                </div>
            )}
        </div>
    );
}

export default ProductsPage;