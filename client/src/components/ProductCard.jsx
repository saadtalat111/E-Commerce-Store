import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext'; 
import { useAuth } from '../context/AuthContext'; 

function ProductCard({ product }) {
    const { addToCart } = useCart();
    const { user } = useAuth(); 
    const [buttonState, setButtonState] = useState({ text: 'Add to Cart', loading: false, error: null });

    if (!product) return null; 

    const imageUrl = product.image_url || 'https://via.placeholder.com/300x200.png?text=No+Image';
    const price = Number(product.price).toFixed(2);
    const isOutOfStock = product.stock_quantity <= 0;

    const handleImageError = (e) => {
        e.target.onerror = null; 
        e.target.src = 'https://via.placeholder.com/300x200.png?text=Image+Error';
    };

    const handleAddToCart = async () => {
        if (!user) {
            alert("Please log in to add items to your cart.");
            return;
        }
        if (isOutOfStock || buttonState.loading) return;

        setButtonState({ text: 'Adding...', loading: true, error: null });

        const result = await addToCart(product.product_id, 1);

        if (result.success) {
            setButtonState({ text: 'Added!', loading: false, error: null });
            setTimeout(() => setButtonState({ text: 'Add to Cart', loading: false, error: null }), 2500);
        } else {
            setButtonState({ text: 'Error', loading: false, error: result.message || 'Failed to add' });
            setTimeout(() => setButtonState({ text: 'Add to Cart', loading: false, error: null }), 3500);
        }
    };

    return (
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300 ease-in-out flex flex-col h-full"> 
            <div className="relative overflow-hidden group">
                <Link to={`/products/${product.product_id}`} className="block">
                    <img
                        src={imageUrl}
                        alt={product.name || 'Product Image'}
                        className="w-full h-48 object-cover transition-transform duration-500 group-hover:scale-105"
                        onError={handleImageError} 
                    />
                </Link>
                
                {/* Stock Indicator */}
                {isOutOfStock && (
                    <div className="absolute top-0 right-0 bg-red-500 text-white text-xs font-bold px-2 py-1 m-2 rounded-md">
                        Out of Stock
                    </div>
                )}
                
                {product.stock_quantity > 0 && product.stock_quantity <= 5 && (
                    <div className="absolute top-0 right-0 bg-yellow-500 text-white text-xs font-bold px-2 py-1 m-2 rounded-md">
                        Low Stock
                    </div>
                )}
            </div>

            {/* Product Info Section */}
            <div className="p-4 flex flex-col flex-grow"> 
                <div className="mb-2">
                    <div className="flex items-center justify-between">
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                            {product.category_name || 'Uncategorized'}
                        </span>
                        {product.stock_quantity > 0 && (
                            <span className="text-xs text-gray-500">{product.stock_quantity} in stock</span>
                        )}
                    </div>
                </div>

                <h3 className="font-semibold text-lg leading-tight mb-1 hover:text-blue-600 transition-colors duration-200">
                    <Link to={`/products/${product.product_id}`}>
                        {product.name || 'Unnamed Product'}
                    </Link>
                </h3>

                <p className="text-gray-600 text-sm mb-4 line-clamp-2 flex-grow">
                    {product.description?.substring(0, 80) || 'No description available'}
                    {product.description?.length > 80 ? '...' : ''}
                </p>

                {/* Price and Add to Cart Button */}
                <div className="mt-auto">
                    <div className="flex justify-between items-center mb-2">
                        <p className="text-xl font-bold text-blue-700">
                            ${price}
                        </p>
                        <button
                            className={`text-white font-medium py-2 px-3 rounded-lg transition duration-200 ease-in-out disabled:opacity-60 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-1 text-sm
                                ${isOutOfStock ? 'bg-gray-400 cursor-not-allowed' : ''}
                                ${buttonState.loading ? 'bg-blue-400 animate-pulse' : ''}
                                ${!isOutOfStock && !buttonState.loading && !buttonState.error ? 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-400' : ''}
                                ${buttonState.error ? 'bg-red-500 focus:ring-red-400' : ''}
                            `}
                            disabled={isOutOfStock || buttonState.loading} 
                            onClick={handleAddToCart}
                        >
                            {isOutOfStock ? 'Out of Stock' : buttonState.text}
                        </button>
                    </div>

                    {buttonState.error && (
                        <p className="text-xs text-red-600 text-right h-4"> 
                            {buttonState.error}
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
}

export default ProductCard;