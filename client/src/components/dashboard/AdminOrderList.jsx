import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

function AdminOrderList() {
    const [orders, setOrders] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const { token } = useAuth();

    const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];

    const fetchAllOrders = async () => {
        if (!token) return;
        setIsLoading(true);
        setError(null);
        try {
            const response = await fetch('http://localhost:5000/api/orders/admin/all', {
                headers: { 'Authorization': `Bearer ${token}` },
            });
            if (!response.ok) {
                const data = await response.json().catch(() => ({}));
                if (response.status === 403) throw new Error(data.message || 'Access Denied.');
                throw new Error(data.message || `HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            setOrders(data);
        } catch (err) {
            console.error("Failed to fetch all orders:", err);
            setError(err.message || 'Failed to load orders.');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchAllOrders();
    }, [token]);

    const handleStatusChange = async (orderId, newStatus) => {
        console.log(`Updating order ${orderId} to status ${newStatus}`);

        try {
            const response = await fetch(`http://localhost:5000/api/orders/admin/${orderId}/status`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({ status: newStatus }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || `Failed to update status (HTTP ${response.status})`);
            }

            setOrders(prevOrders =>
                prevOrders.map(order =>
                    order.order_id === orderId ? { ...order, status: newStatus } : order
                )
            );
            
            // Use a better notification instead of alert
            const successMessage = document.getElementById('success-message');
            if (successMessage) {
                successMessage.textContent = `Order #${orderId} status updated to ${newStatus}`;
                successMessage.classList.remove('hidden');
                setTimeout(() => successMessage.classList.add('hidden'), 3000);
            }

        } catch (err) {
            console.error("Error updating order status:", err);
            const errorMessage = document.getElementById('error-message');
            if (errorMessage) {
                errorMessage.textContent = `Error: ${err.message}`;
                errorMessage.classList.remove('hidden');
                setTimeout(() => errorMessage.classList.add('hidden'), 3000);
            }
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleString();
    };

    const getStatusBadgeClasses = (status) => {
        const baseClasses = "px-2 py-1 inline-flex text-xs leading-5 font-medium rounded-full";
        switch (status) {
            case 'delivered':
                return `${baseClasses} bg-green-100 text-green-800`;
            case 'shipped':
                return `${baseClasses} bg-blue-100 text-blue-800`;
            case 'processing':
                return `${baseClasses} bg-yellow-100 text-yellow-800`;
            case 'cancelled':
                return `${baseClasses} bg-red-100 text-red-800`;
            default: // pending or others
                return `${baseClasses} bg-gray-100 text-gray-800`;
        }
    };

    if (isLoading) {
        return (
            <div className="bg-white rounded-xl shadow-md p-8 text-center">
                <div className="flex justify-center items-center space-x-2">
                    <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.3s' }}></div>
                </div>
                <p className="text-gray-600 mt-3">Loading orders...</p>
            </div>
        );
    }

    return (
        <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-semibold text-gray-800">Manage Orders</h2>
                <button 
                    onClick={fetchAllOrders} 
                    className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition duration-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-gray-300 flex items-center"
                >
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
                    </svg>
                    Refresh
                </button>
            </div>

            {/* Notification Messages */}
            <div id="success-message" className="hidden mb-4 p-3 bg-green-50 text-green-700 border border-green-200 rounded-lg">
                Order status updated successfully
            </div>
            <div id="error-message" className="hidden mb-4 p-3 bg-red-50 text-red-700 border border-red-200 rounded-lg">
                Error updating order status
            </div>

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

            {orders.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
                    <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"></path>
                    </svg>
                    <p className="mt-2 text-gray-600">No orders found.</p>
                </div>
            ) : (
                <div className="overflow-x-auto rounded-lg border border-gray-200">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order ID</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date Placed</th>
                                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Update Status</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {orders.map((order) => (
                                <tr key={order.order_id} className="hover:bg-gray-50 transition-colors duration-150 ease-in-out">
                                    <td className="px-4 py-3 whitespace-nowrap">
                                        <div className="font-medium text-gray-900">#{order.order_id}</div>
                                    </td>
                                    <td className="px-4 py-3 whitespace-nowrap">
                                        <div className="text-sm text-gray-900">{order.user_username}</div>
                                        <div className="text-xs text-gray-500">ID: {order.user_id}</div>
                                    </td>
                                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                                        {formatDate(order.created_at)}
                                    </td>
                                    <td className="px-4 py-3 whitespace-nowrap text-right text-sm font-medium text-gray-900">
                                        ${Number(order.total_amount).toFixed(2)}
                                    </td>
                                    <td className="px-4 py-3 whitespace-nowrap">
                                        <span className={getStatusBadgeClasses(order.status)}>
                                            {order.status}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 whitespace-nowrap">
                                        <select
                                            value={order.status}
                                            onChange={(e) => handleStatusChange(order.order_id, e.target.value)}
                                            className="text-sm border border-gray-300 rounded-md py-1.5 px-2 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400"
                                        >
                                            {validStatuses.map(status => (
                                                <option key={status} value={status} className="capitalize">
                                                    {status}
                                                </option>
                                            ))}
                                        </select>
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

export default AdminOrderList;