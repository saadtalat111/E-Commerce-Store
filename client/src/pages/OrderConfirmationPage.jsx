// filepath: c:\Users\aimra\Desktop\MusaProject\client\src\pages\OrderConfirmationPage.jsx
import React, { useEffect } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';

function OrderConfirmationPage() {
    const location = useLocation();
    const navigate = useNavigate();
    const orderDetails = location.state?.order; 

    useEffect(() => {
        if (!orderDetails) {
            navigate('/'); 
        }
    }, [orderDetails, navigate]);

    if (!orderDetails) {
        return null;
    }

    return (
        <div className="container mx-auto px-4 py-12 text-center">
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-6 rounded-lg shadow-md max-w-lg mx-auto">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-green-500 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h1 className="text-2xl font-bold mb-3">Thank You For Your Order!</h1>
                <p className="text-lg mb-4">Your order has been placed successfully.</p>
                <p className="mb-2">Order ID: <span className="font-semibold">{orderDetails.orderId}</span></p>
                <p className="mb-2">Order Total: <span className="font-semibold">${orderDetails.totalAmount}</span></p>

                <div className="space-y-3 md:space-y-0 md:space-x-4">
                     <Link
                        to="/orders" // Link to order history page
                        className="inline-block bg-blue-500 hover:bg-blue-700 text-white font-semibold py-2 px-5 rounded transition duration-150"
                    >
                        View My Orders
                    </Link>
                     <Link
                        to="/products"
                        className="inline-block bg-gray-500 hover:bg-gray-700 text-white font-semibold py-2 px-5 rounded transition duration-150"
                    >
                        Continue Shopping
                    </Link>
                </div>
            </div>
        </div>
    );
}

export default OrderConfirmationPage;