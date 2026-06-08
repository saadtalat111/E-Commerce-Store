// filepath: c:\Users\aimra\Desktop\MusaProject\client\src\pages\OrderDetailPage.jsx
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function OrderDetailPage() {
    const { orderId } = useParams();
    const [order, setOrder] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const { token } = useAuth();

    useEffect(() => {
        const fetchOrderDetails = async () => {
            if (!token || !orderId) return;

            setIsLoading(true);
            setError(null);
            try {
                const response = await fetch(`http://localhost:5000/api/orders/${orderId}`, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                    },
                });
                if (!response.ok) {
                     if (response.status === 404) {
                        throw new Error('Order not found.');
                    }
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const data = await response.json();
                setOrder(data);
            } catch (err) {
                console.error("Failed to fetch order details:", err);
                setError(err.message || 'Failed to load order details.');
            } finally {
                setIsLoading(false);
            }
        };

        fetchOrderDetails();
    }, [token, orderId]);

     const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleString('en-US', {
            year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
        });
    };


    if (isLoading) {
        return <div className="text-center py-10"><p>Loading order details...</p></div>;
    }

    if (error) {
        return (
             <div className="text-center py-10 px-4">
                <p className="text-red-600 bg-red-100 p-3 rounded mb-4">Error: {error}</p>
                <Link to="/orders" className="text-blue-600 hover:underline">Back to Order History</Link>
            </div>
        );
    }

    if (!order) {
         return <div className="text-center py-10"><p>Order details not available.</p></div>;
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="mb-6">
                 <Link to="/orders" className="text-blue-600 hover:underline">&larr; Back to Order History</Link>
            </div>

            <div className="bg-white shadow-lg rounded-lg p-6 mb-8">
                <h1 className="text-2xl font-bold mb-4">Order Details</h1>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div><strong>Order ID:</strong> #{order.order_id}</div>
                    <div><strong>Date Placed:</strong> {formatDate(order.created_at)}</div>
                    <div><strong>Status:</strong> <span className="font-semibold capitalize">{order.status}</span></div>
                    <div><strong>Order Total:</strong> <span className="font-semibold">${Number(order.total_amount).toFixed(2)}</span></div>
                </div>
            </div>

            <h2 className="text-xl font-semibold mb-4">Items in this Order</h2>
            <div className="space-y-4">
                {order.items && order.items.map((item) => (
                    <div key={item.order_item_id} className="bg-white shadow rounded-lg p-4 flex items-center space-x-4">
                        <img
                            src={item.product_image_url || 'https://via.placeholder.com/100?text=No+Image'}
                            alt={item.product_name}
                            className="h-20 w-20 rounded object-cover flex-shrink-0"
                            onError={(e) => { e.target.onerror = null; e.target.src='https://via.placeholder.com/100?text=Error'; }}
                        />
                        <div className="flex-grow">
                            <h3 className="text-md font-medium text-gray-900">{item.product_name}</h3>
                            <p className="text-sm text-gray-500">Product ID: {item.product_id}</p>
                        </div>
                        <div className="text-right text-sm">
                            <p>Qty: {item.quantity}</p>
                            <p>Price Paid: ${Number(item.price_at_purchase).toFixed(2)}</p>
                            <p className="font-semibold">Subtotal: ${(Number(item.price_at_purchase) * item.quantity).toFixed(2)}</p>
                        </div>
                    </div>
                ))}
                 {!order.items || order.items.length === 0 && (
                    <p className="text-gray-600">No item details available for this order.</p>
                )}
            </div>
        </div>
    );
}

export default OrderDetailPage;