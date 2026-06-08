import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext'; 

function CartPage() {
    const {
        cartItems,
        cartItemCount,
        cartSubtotal,
        updateCartItemQuantity,
        removeFromCart,
        placeOrder,
        isLoading,
        error: cartError 
    } = useCart();
    const { user } = useAuth();
    const navigate = useNavigate();

    const [quantityInputs, setQuantityInputs] = useState({});
    const [checkoutError, setCheckoutError] = useState(null); 

    // Initialize local state when cartItems load or change
    useEffect(() => {
        const initialQuantities = {};
        cartItems.forEach(item => {
            initialQuantities[item.cart_item_id] = item.quantity;
        });
        setQuantityInputs(initialQuantities);
    }, [cartItems]);

    const handleQuantityInputChange = (itemId, value) => {
        // Allow only positive integers
        const newQuantity = value === '' ? '' : Math.max(1, parseInt(value, 10) || 1);
        setQuantityInputs(prev => ({ ...prev, [itemId]: newQuantity }));
    };

    const handleUpdateQuantity = async (itemId) => {
        const newQuantity = quantityInputs[itemId];
        if (newQuantity === '' || newQuantity <= 0) {
            alert("Please enter a valid quantity greater than 0.");
            return;
        }
        // Find original quantity to prevent unnecessary API calls if unchanged
        const originalItem = cartItems.find(item => item.cart_item_id === itemId);
        if (originalItem && originalItem.quantity === newQuantity) {
            return; // No change, do nothing
        }

        const result = await updateCartItemQuantity(itemId, newQuantity);
        if (!result.success) {
            alert(`Error updating quantity: ${result.message}`);
            setQuantityInputs(prev => ({ ...prev, [itemId]: originalItem?.quantity || 1 }));
        }
        // Context handles refetching and updating cartItems state
    };

    const handleRemoveItem = async (itemId) => {
        if (window.confirm('Are you sure you want to remove this item from your cart?')) {
            const result = await removeFromCart(itemId);
            if (!result.success) {
                alert(`Error removing item: ${result.message}`);
            }
        }
    };

    const handleCheckout = async () => {
        setCheckoutError(null); // Clear previous checkout errors
        if (!window.confirm('Are you sure you want to place this order?')) {
            return;
        }

        const result = await placeOrder(); 

        if (result.success) {
            // Order placed! Navigate to a confirmation page 
            navigate('/order-confirmation', { state: { order: result.order } });
        } else {
            // Show error message specific to checkout failure
            setCheckoutError(result.message || 'An unexpected error occurred during checkout.');
        }
    };

    // Ensure user is logged in 
    if (!user) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center bg-gray-50 px-4">
                <div className="bg-white p-8 rounded-xl shadow-md max-w-md w-full text-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-blue-500 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">Sign In Required</h2>
                    <p className="text-gray-600 mb-6">Please log in to view your shopping cart and complete your purchase.</p>
                    <Link 
                        to="/login" 
                        className="inline-block bg-blue-50 text-blue-700 hover:bg-blue-100 font-medium py-2 px-6 rounded-lg transition duration-200 border border-blue-200"
                    >
                        Sign In to Continue
                    </Link>
                </div>
            </div>
        );
    }

    if (isLoading && cartItems.length === 0) { 
        return (
            <div className="min-h-[60vh] flex items-center justify-center bg-gray-50">
                <div className="bg-white p-8 rounded-xl shadow-md">
                    <div className="flex items-center justify-center space-x-2">
                        <div className="w-4 h-4 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-4 h-4 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                        <div className="w-4 h-4 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.3s' }}></div>
                    </div>
                    <p className="text-gray-600 mt-3">Loading your cart...</p>
                </div>
            </div>
        );
    }

    if (cartError) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center bg-gray-50 px-4">
                <div className="bg-white p-8 rounded-xl shadow-md max-w-md w-full">
                    <div className="text-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-red-500 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <h2 className="text-2xl font-bold text-gray-800 mb-2">Error Loading Cart</h2>
                        <p className="text-red-600 mb-6">{cartError}</p>
                        <button 
                            onClick={() => window.location.reload()}
                            className="px-4 py-2 bg-blue-50 text-blue-700 border border-blue-200 rounded-lg hover:bg-blue-100 transition duration-200"
                        >
                            Try Again
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    if (cartItems.length === 0) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center bg-gray-50 px-4">
                <div className="bg-white p-8 rounded-xl shadow-md max-w-md w-full text-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-gray-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">Your Shopping Cart is Empty</h2>
                    <p className="text-gray-600 mb-6">Looks like you haven't added any products to your cart yet.</p>
                    <Link 
                        to="/products" 
                        className="inline-block bg-blue-50 text-blue-700 hover:bg-blue-100 font-medium py-2 px-6 rounded-lg transition duration-200 border border-blue-200"
                    >
                        Browse Products
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8 bg-gray-50 min-h-screen">
            {/* Breadcrumb Navigation */}
            <div className="mb-4">
                <nav className="flex" aria-label="Breadcrumb">
                    <ol className="inline-flex items-center space-x-1 md:space-x-3">
                        <li className="inline-flex items-center">
                            <Link to="/" className="text-sm text-gray-500 hover:text-blue-600">
                                Home
                            </Link>
                        </li>
                        <li aria-current="page">
                            <div className="flex items-center">
                                <svg className="w-3 h-3 text-gray-400 mx-1" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 6 10">
                                    <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 9 4-4-4-4"/>
                                </svg>
                                <span className="text-sm text-gray-700 ml-1 md:ml-2">Shopping Cart</span>
                            </div>
                        </li>
                    </ol>
                </nav>
            </div>

            {/* Cart Header */}
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Shopping Cart ({cartItemCount} {cartItemCount === 1 ? 'item' : 'items'})</h1>
                <Link to="/products" className="text-blue-600 hover:text-blue-800 text-sm flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 17l-5-5m0 0l5-5m-5 5h12" />
                    </svg>
                    Continue Shopping
                </Link>
            </div>

            {/* Cart Items and Summary Card */}
            <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100">
                {/* Cart Items Table */}
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Product
                                </th>
                                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Price
                                </th>
                                <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Quantity
                                </th>
                                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Total
                                </th>
                                <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Action
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {cartItems.map((item) => (
                                <tr key={item.cart_item_id} className="hover:bg-gray-50 transition-colors duration-150">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center">
                                            <div className="flex-shrink-0 h-20 w-20 rounded-md overflow-hidden border border-gray-200">
                                                <img
                                                    className="h-full w-full object-cover"
                                                    src={item.image_url || 'https://via.placeholder.com/100?text=No+Image'}
                                                    alt={item.name}
                                                    onError={(e) => { e.target.onerror = null; e.target.src='https://via.placeholder.com/100?text=Error'; }}
                                                />
                                            </div>
                                            <div className="ml-4">
                                                <Link to={`/products/${item.product_id}`} className="text-sm font-medium text-blue-600 hover:text-blue-800 hover:underline">{item.name}</Link>
                                                {item.quantity > item.stock_quantity ? (
                                                    <div className="text-xs mt-1 text-red-600 font-medium">
                                                        Only {item.stock_quantity} in stock!
                                                    </div>
                                                ) : (
                                                    <div className="text-xs mt-1 text-gray-500">
                                                        In Stock: {item.stock_quantity}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-700 font-medium">
                                        ${Number(item.price).toFixed(2)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center justify-center space-x-1">
                                            <button
                                                onClick={() => {
                                                    const newQty = Math.max(1, (quantityInputs[item.cart_item_id] || 0) - 1);
                                                    handleQuantityInputChange(item.cart_item_id, newQty);
                                                    handleUpdateQuantity(item.cart_item_id);
                                                }}
                                                className="text-gray-500 hover:text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md p-1"
                                                disabled={quantityInputs[item.cart_item_id] <= 1}
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                                                </svg>
                                            </button>
                                            <input
                                                type="number"
                                                min="1"
                                                max={item.stock_quantity} 
                                                value={quantityInputs[item.cart_item_id] || ''}
                                                onChange={(e) => handleQuantityInputChange(item.cart_item_id, e.target.value)}
                                                onBlur={() => handleUpdateQuantity(item.cart_item_id)} 
                                                className="w-14 border border-gray-300 rounded px-2 py-1 text-center text-gray-700 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                                                aria-label={`Quantity for ${item.name}`}
                                            />
                                            <button
                                                onClick={() => {
                                                    const newQty = Math.min(item.stock_quantity, (quantityInputs[item.cart_item_id] || 0) + 1);
                                                    handleQuantityInputChange(item.cart_item_id, newQty);
                                                    handleUpdateQuantity(item.cart_item_id);
                                                }}
                                                className="text-gray-500 hover:text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md p-1"
                                                disabled={quantityInputs[item.cart_item_id] >= item.stock_quantity}
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                                </svg>
                                            </button>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium text-gray-900">
                                        ${(Number(item.price) * (quantityInputs[item.cart_item_id] || 0)).toFixed(2)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                                        <button
                                            onClick={() => handleRemoveItem(item.cart_item_id)}
                                            className="text-red-600 hover:text-red-800 bg-red-50 hover:bg-red-100 px-2 py-1 rounded-md text-sm border border-red-100 transition-colors duration-150"
                                        >
                                            Remove
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Cart Summary */}
                <div className="border-t border-gray-200 p-6">
                    <div className="flex flex-col md:flex-row md:justify-between md:items-center">
                        <div className="mb-4 md:mb-0">
                            <p className="text-sm text-gray-600">
                                Prices are subject to change based on availability and promotions.
                            </p>
                        </div>
                        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 md:w-72">
                            <div className="flex justify-between mb-2">
                                <span className="text-gray-600">Subtotal</span>
                                <span className="font-medium text-gray-800">${cartSubtotal.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between mb-2">
                                <span className="text-gray-600">Shipping</span>
                                <span className="font-medium text-gray-800">Free</span>
                            </div>
                            <div className="border-t border-gray-200 my-2 pt-2"></div>
                            <div className="flex justify-between mb-4">
                                <span className="text-gray-800 font-semibold">Total</span>
                                <span className="font-bold text-blue-700">${cartSubtotal.toFixed(2)}</span>
                            </div>
                            <button
                                onClick={handleCheckout}
                                className={`w-full py-2 px-4 rounded-lg text-center border border-transparent focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500
                                    ${isLoading || cartItems.some(item => item.quantity > item.stock_quantity)
                                    ? 'bg-gray-100 text-gray-500 cursor-not-allowed border-gray-200'
                                    : 'bg-green-50 text-green-700 hover:bg-green-100 border-green-200 transition-colors duration-200'
                                }`}
                                disabled={isLoading || cartItems.some(item => item.quantity > item.stock_quantity)}
                            >
                                {isLoading ? 'Processing...' : 'Place Order'}
                            </button>
                            
                            {/* Display checkout errors */}
                            {checkoutError && (
                                <p className="text-xs text-red-600 mt-2 text-center">{checkoutError}</p>
                            )}
                            
                            {/* Display stock warnings */}
                            {cartItems.some(item => item.quantity > item.stock_quantity) && (
                                <p className="text-xs text-red-600 mt-2 text-center">
                                    Some items exceed available stock. Please adjust quantities.
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default CartPage;