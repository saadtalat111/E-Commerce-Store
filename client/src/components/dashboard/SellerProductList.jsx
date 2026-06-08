import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom'; 
import { useAuth } from '../../context/AuthContext';

function SellerProductList() {
    const [products, setProducts] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const { token, user } = useAuth(); 
    const isAdmin = user?.role === 'admin'; 

    const fetchProducts = async () => {
        if (!token || !user) return;

        setIsLoading(true);
        setError(null);
        try {
            const response = await fetch('http://localhost:5000/api/products');
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const allProducts = await response.json();

            const sellerProducts = user.role === 'admin'
                ? allProducts
                : allProducts.filter(p => String(p.seller_id) === String(user.userId));
                
            setProducts(sellerProducts);
        } catch (err) {
            console.error("Failed to fetch seller products:", err);
            setError(err.message || 'Failed to load your products.');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchProducts();
    }, [token, user]); 

    const handleDelete = async (productId, productName) => {
        if (!window.confirm(`Are you sure you want to delete "${productName}"? This cannot be undone.`)) {
            return;
        }
        
        setError(null);
        setSuccess(null);

        try {
            const response = await fetch(`http://localhost:5000/api/products/${productId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                const data = await response.json().catch(() => ({})); 
                throw new Error(data.message || `HTTP error! status: ${response.status}`);
            }

            setProducts(prevProducts => prevProducts.filter(p => p.product_id !== productId));
            setSuccess(`Product "${productName}" was deleted successfully.`);
            
            // Auto-dismiss success message after 3 seconds
            setTimeout(() => setSuccess(null), 3000);

        } catch (err) {
            console.error("Failed to delete product:", err);
            setError(err.message || 'Failed to delete product.');
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString();
    };

    const getStockStatusClass = (quantity) => {
        if (quantity <= 0) return 'bg-red-100 text-red-800';
        if (quantity <= 5) return 'bg-yellow-100 text-yellow-800';
        return 'bg-green-100 text-green-800';
    };

    if (isLoading) {
        return (
            <div className="bg-white rounded-xl shadow-md p-8 text-center">
                <div className="flex justify-center items-center space-x-2">
                    <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.3s' }}></div>
                </div>
                <p className="text-gray-600 mt-3">Loading products...</p>
            </div>
        );
    }

    return (
        <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-semibold text-gray-800">
                    {isAdmin ? 'All Products (Admin View)' : 'My Products'}
                </h2>
                <div className="flex space-x-2">
                    <button 
                        onClick={fetchProducts} 
                        className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition duration-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-gray-300 flex items-center"
                    >
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
                        </svg>
                        Refresh
                    </button>
                    
                    <Link
                        to="/dashboard/products/add"
                        className="px-4 py-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg transition duration-200 text-sm font-medium border border-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-300 flex items-center"
                    >
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path>
                        </svg>
                        Add New Product
                    </Link>
                </div>
            </div>

            {/* Notifications */}
            {error && (
                <div className="mb-4 p-4 bg-red-50 text-red-700 border border-red-200 rounded-lg">
                    <p className="flex items-center">
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                        </svg>
                        {error}
                    </p>
                </div>
            )}

            {success && (
                <div className="mb-4 p-4 bg-green-50 text-green-700 border border-green-200 rounded-lg">
                    <p className="flex items-center">
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                        </svg>
                        {success}
                    </p>
                </div>
            )}

            {products.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
                    <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"></path>
                    </svg>
                    <p className="mt-2 text-gray-600">
                        {isAdmin ? 'No products found in the system.' : 'You haven\'t added any products yet.'}
                    </p>
                    <Link
                        to="/dashboard/products/add"
                        className="mt-4 inline-flex items-center px-4 py-2 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg transition duration-200 text-sm font-medium border border-blue-200"
                    >
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path>
                        </svg>
                        Add Your First Product
                    </Link>
                </div>
            ) : (
                <div className="overflow-x-auto rounded-lg border border-gray-200">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                                {/* Conditionally show Seller column for Admin */}
                                {isAdmin && (
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Seller</th>
                                )}
                                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Stock</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date Added</th>
                                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {products.map((product) => (
                                <tr key={product.product_id} className="hover:bg-gray-50 transition-colors duration-150 ease-in-out">
                                    <td className="px-4 py-3 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <div className="flex-shrink-0 h-10 w-10">
                                                <img 
                                                    className="h-10 w-10 rounded-md object-cover" 
                                                    src={product.image_url || 'https://via.placeholder.com/40x40.png?text=No+Image'} 
                                                    alt=""
                                                    onError={(e) => { e.target.onerror = null; e.target.src = 'https://via.placeholder.com/40x40.png?text=Error'; }}
                                                />
                                            </div>
                                            <div className="ml-4">
                                                <div className="text-sm font-medium text-gray-900">{product.name}</div>
                                                <div className="text-xs text-gray-500">ID: {product.product_id}</div>
                                            </div>
                                        </div>
                                    </td>
                                    
                                    {/* Conditionally show Seller data for Admin */}
                                    {isAdmin && (
                                        <td className="px-4 py-3 whitespace-nowrap">
                                            <div className="text-sm text-gray-900">{product.seller_username || 'Unknown'}</div>
                                            <div className="text-xs text-gray-500">ID: {product.seller_id || 'N/A'}</div>
                                        </td>
                                    )}
                                    
                                    <td className="px-4 py-3 whitespace-nowrap text-right text-sm font-medium text-gray-900">
                                        ${Number(product.price).toFixed(2)}
                                    </td>
                                    
                                    <td className="px-4 py-3 whitespace-nowrap text-center">
                                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-medium rounded-full ${getStockStatusClass(product.stock_quantity)}`}>
                                            {product.stock_quantity > 0 ? product.stock_quantity : 'Out of stock'}
                                        </span>
                                    </td>
                                    
                                    <td className="px-4 py-3 whitespace-nowrap">
                                        <span className="px-2 py-1 inline-flex text-xs leading-5 font-medium rounded-full bg-blue-100 text-blue-800">
                                            {product.category_name || 'Uncategorized'}
                                        </span>
                                    </td>
                                    
                                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                                        {formatDate(product.created_at)}
                                    </td>
                                    
                                    <td className="px-4 py-3 whitespace-nowrap text-right text-sm font-medium">
                                        <div className="flex justify-end space-x-2">
                                            <Link 
                                                to={`/dashboard/products/edit/${product.product_id}`} 
                                                className="text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-2 py-1 rounded-md text-sm font-medium transition-colors duration-150 border border-blue-100"
                                            >
                                                Edit
                                            </Link>
                                            <button
                                                onClick={() => handleDelete(product.product_id, product.name)}
                                                className="text-red-600 hover:text-red-800 bg-red-50 hover:bg-red-100 px-2 py-1 rounded-md text-sm font-medium transition-colors duration-150 border border-red-100"
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}

export default SellerProductList;