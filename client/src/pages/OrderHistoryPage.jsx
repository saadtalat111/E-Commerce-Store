// filepath: c:\Users\aimra\Desktop\MusaProject\client\src\pages\OrderHistoryPage.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function OrderHistoryPage() {
    const [orders, setOrders] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const { token } = useAuth();

    useEffect(() => {
        const fetchOrders = async () => {
            if (!token) return; 
            setIsLoading(true);
            setError(null);
            try {
                const response = await fetch('http://localhost:5000/api/orders', {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                    },
                });
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const data = await response.json();
                setOrders(data);
            } catch (err) {
                console.error("Failed to fetch orders:", err);
                setError(err.message || 'Failed to load order history.');
            } finally {
                setIsLoading(false);
            }
        };

        fetchOrders();
    }, [token]);

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric', month: 'long', day: 'numeric'
        });
    };

    if (isLoading) {
        return <div className="text-center py-10"><p>Loading order history...</p></div>;
    }

    if (error) {
        return <div className="text-center py-10 px-4"><p className="text-red-600 bg-red-100 p-3 rounded">Error: {error}</p></div>;
    }

    if (orders.length === 0) {
        return (
            <div className="text-center py-10">
                <h1 className="text-2xl font-bold mb-4">No Orders Found</h1>
                <p className="text-gray-600 mb-6">You haven't placed any orders yet.</p>
                <Link to="/products" className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
                    Start Shopping
                </Link>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-6">My Orders</h1>
            <div className="bg-white shadow-md rounded-lg overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order ID</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date Placed</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                            <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                            <th scope="col" className="relative px-6 py-3"><span className="sr-only">View Details</span></th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {orders.map((order) => (
                            <tr key={order.order_id}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">#{order.order_id}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDate(order.created_at)}</td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    {/* Basic status styling - can be enhanced */}
                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                        order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                                        order.status === 'shipped' ? 'bg-blue-100 text-blue-800' :
                                        order.status === 'processing' ? 'bg-yellow-100 text-yellow-800' :
                                        order.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                                        'bg-gray-100 text-gray-800' 
                                    }`}>
                                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)} {}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-900">${Number(order.total_amount).toFixed(2)}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <Link to={`/orders/${order.order_id}`} className="text-blue-600 hover:text-blue-900">
                                        View Details
                                    </Link>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default OrderHistoryPage;