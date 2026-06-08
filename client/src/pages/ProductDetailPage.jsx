import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom'; 
import { useCart } from '../context/CartContext'; 
import { useAuth } from '../context/AuthContext'; 

function ProductDetailPage() {
    const { id } = useParams(); 
    const navigate = useNavigate();
    const [product, setProduct] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [quantity, setQuantity] = useState(1);
    const { addToCart } = useCart();  
    const { user } = useAuth(); 
    const [buttonState, setButtonState] = useState({ text: 'Add to Cart', loading: false, error: null }); 

    useEffect(() => {
        const fetchProduct = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const response = await fetch(`http://localhost:5000/api/products/${id}`);
                if (!response.ok) {
                    if (response.status === 404) {
                        throw new Error('Product not found.');
                    }
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const data = await response.json();
                setProduct(data);
            } catch (err) {
                console.error("Failed to fetch product:", err);
                setError(err.message || 'Failed to load product details.');
            } finally {
                setIsLoading(false);
            }
        };

        fetchProduct();
    }, [id]); 

    const handleQuantityChange = (e) => {
        const newQuantity = parseInt(e.target.value);
        if (newQuantity > 0 && newQuantity <= (product?.stock_quantity || 0)) {
            setQuantity(newQuantity);
        }
    };

    const handleAddToCart = async () => {
        if (!user) {
            alert("Please log in to add items to your cart.");
            return;
        }
        if (product.stock_quantity <= 0 || buttonState.loading) return;

        setButtonState({ text: 'Adding...', loading: true, error: null });
        const result = await addToCart(product.product_id, quantity); 

        if (result.success) {
            setButtonState({ text: 'Added to Cart!', loading: false, error: null });
            setTimeout(() => setButtonState({ text: 'Add to Cart', loading: false, error: null }), 2500);
        } else {
            setButtonState({ text: 'Error', loading: false, error: result.message });
            setTimeout(() => setButtonState({ text: 'Add to Cart', loading: false, error: null }), 3000);
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center bg-gray-50">
                <div className="bg-white p-8 rounded-xl shadow-md">
                    <div className="flex items-center justify-center space-x-2">
                        <div className="w-4 h-4 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-4 h-4 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                        <div className="w-4 h-4 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.3s' }}></div>
                    </div>
                    <p className="text-gray-600 mt-3">Loading product details...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center bg-gray-50">
                <div className="bg-white p-8 rounded-xl shadow-md max-w-lg w-full">
                    <div className="text-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-red-500 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <h2 className="text-2xl font-bold text-gray-800 mb-2">Error Loading Product</h2>
                        <p className="text-red-600 mb-6">{error}</p>
                        <button 
                            onClick={() => navigate('/products')}
                            className="px-4 py-2 bg-blue-50 text-blue-700 border border-blue-200 rounded-lg hover:bg-blue-100 transition duration-200"
                        >
                            Back to Products
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    if (!product) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center bg-gray-50">
                <div className="bg-white p-8 rounded-xl shadow-md max-w-lg w-full">
                    <div className="text-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-yellow-500 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <h2 className="text-2xl font-bold text-gray-800 mb-2">Product Not Found</h2>
                        <p className="text-gray-600 mb-6">The product you're looking for doesn't exist or has been removed.</p>
                        <button 
                            onClick={() => navigate('/products')}
                            className="px-4 py-2 bg-blue-50 text-blue-700 border border-blue-200 rounded-lg hover:bg-blue-100 transition duration-200"
                        >
                            Browse Products
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    const imageUrl = product.image_url || 'https://via.placeholder.com/600x400.png?text=No+Image';
    const price = Number(product.price).toFixed(2);
    const isOutOfStock = product.stock_quantity <= 0;

    return (
        <div className="container mx-auto px-4 py-8 bg-gray-50">
            {/* Breadcrumb Navigation */}
            <div className="mb-6">
                <nav className="flex" aria-label="Breadcrumb">
                    <ol className="inline-flex items-center space-x-1 md:space-x-3">
                        <li className="inline-flex items-center">
                            <Link to="/" className="text-sm text-gray-500 hover:text-blue-600">
                                Home
                            </Link>
                        </li>
                        <li>
                            <div className="flex items-center">
                                <svg className="w-3 h-3 text-gray-400 mx-1" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 6 10">
                                    <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 9 4-4-4-4"/>
                                </svg>
                                <Link to="/products" className="text-sm text-gray-500 hover:text-blue-600 ml-1 md:ml-2">
                                    Products
                                </Link>
                            </div>
                        </li>
                        <li aria-current="page">
                            <div className="flex items-center">
                                <svg className="w-3 h-3 text-gray-400 mx-1" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 6 10">
                                    <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 9 4-4-4-4"/>
                                </svg>
                                <span className="text-sm text-gray-700 ml-1 md:ml-2 truncate max-w-[200px]">
                                    {product.name}
                                </span>
                            </div>
                        </li>
                    </ol>
                </nav>
            </div>

            {/* Product Details Card */}
            <div className="bg-white shadow-lg rounded-xl overflow-hidden md:flex border border-gray-100">
                {/* Product Image */}
                <div className="md:w-1/2 relative flex items-center justify-center">
                    <div className="w-full h-full max-h-[500px] overflow-hidden flex items-center justify-center">
                        <img 
                            src={imageUrl} 
                            alt={product.name} 
                            className="w-full h-auto object-contain max-h-[500px]" 
                            onError={(e) => { e.target.onerror = null; e.target.src='https://via.placeholder.com/600x400.png?text=Image+Error'; }} 
                        />
                    </div>
                    
                    {/* Category Badge */}
                    <div className="absolute top-4 left-4">
                        <span className="px-3 py-1 bg-blue-50 text-blue-700 text-sm font-medium rounded-full border border-blue-200">
                            {product.category_name || 'Uncategorized'}
                        </span>
                    </div>
                </div>

                {/* Product Details */}
                <div className="p-6 md:w-1/2 flex flex-col justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-800 mb-2">{product.name}</h1>
                        
                        {/* Stock Status Badge */}
                        <div className="mb-4">
                            {isOutOfStock ? (
                                <span className="inline-block px-3 py-1 bg-red-50 text-red-700 rounded-full text-sm font-medium border border-red-200">
                                    Out of Stock
                                </span>
                            ) : product.stock_quantity <= 5 ? (
                                <span className="inline-block px-3 py-1 bg-yellow-50 text-yellow-700 rounded-full text-sm font-medium border border-yellow-200">
                                    Only {product.stock_quantity} left
                                </span>
                            ) : (
                                <span className="inline-block px-3 py-1 bg-green-50 text-green-700 rounded-full text-sm font-medium border border-green-200">
                                    In Stock ({product.stock_quantity} available)
                                </span>
                            )}
                        </div>
                        
                        <div className="border-t border-b border-gray-200 py-4 mb-4">
                            <p className="text-gray-700 leading-relaxed">{product.description}</p>
                        </div>
                    </div>

                    {/* Price and Action */}
                    <div className="mt-auto">
                        <div className="flex items-end mb-4">
                            <p className="text-3xl font-bold text-blue-700">${price}</p>
                            {!isOutOfStock && (
                                <div className="ml-auto flex items-center">
                                    <label htmlFor="quantity" className="text-sm font-medium text-gray-700 mr-2">
                                        Quantity:
                                    </label>
                                    <select
                                        id="quantity"
                                        name="quantity"
                                        value={quantity}
                                        onChange={handleQuantityChange}
                                        className="rounded-md border border-gray-300 py-1.5 bg-white text-gray-700 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                        disabled={isOutOfStock}
                                    >
                                        {[...Array(Math.min(product.stock_quantity, 10)).keys()].map(i => (
                                            <option key={i + 1} value={i + 1}>
                                                {i + 1}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            )}
                        </div>
                        
                        <button
                            className={`w-full font-medium py-3 px-4 rounded-lg transition duration-200 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-1 border
                                ${isOutOfStock ? 'bg-gray-100 text-gray-500 border-gray-300' : ''}
                                ${buttonState.loading ? 'bg-blue-100 text-blue-500 border-blue-200' : ''}
                                ${!isOutOfStock && !buttonState.loading && !buttonState.error ? 'bg-blue-50 text-blue-700 hover:bg-blue-100 border-blue-200 focus:ring-blue-400' : ''}
                                ${buttonState.error ? 'bg-red-50 text-red-700 border-red-200 focus:ring-red-400' : ''}
                            `}
                            disabled={isOutOfStock || buttonState.loading}
                            onClick={handleAddToCart}
                        >
                            {isOutOfStock ? 'Out of Stock' : buttonState.text}
                        </button>
                        
                        {buttonState.error && (
                            <p className="text-sm text-red-600 mt-2">{buttonState.error}</p>
                        )}
                        
                        {/* Additional Info */}
                        <div className="mt-6 grid grid-cols-2 gap-4 text-sm text-gray-600">
                            <div className="flex items-center">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                                <span>Secure Checkout</span>
                            </div>
                            <div className="flex items-center">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                                </svg>
                                <span>Multiple Payment Methods</span>
                            </div>
                            <div className="flex items-center">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                                </svg>
                                <span>Fast Shipping</span>
                            </div>
                            <div className="flex items-center">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2v-8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                </svg>
                                <span>Satisfaction Guarantee</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ProductDetailPage;