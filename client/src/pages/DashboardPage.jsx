import React from 'react';
// Hook to get user info
import { useAuth } from '../context/AuthContext';
// For linking to other pages
import { Link } from 'react-router-dom';

// Import dashboard components
import SellerProductList from '../components/dashboard/SellerProductList';
import AdminOrderList from '../components/dashboard/AdminOrderList';
import AdminCategoryList from '../components/dashboard/AdminCategoryList';

// Dashboard Page Component
function DashboardPage() {
    // Get user information from the authentication context
    const { user } = useAuth();

    // Show loading state if user data isn't available yet
    if (!user) {
        return <div className="text-center py-10"><p>Loading user data...</p></div>;
    }

    const isSeller = user.role === 'seller';
    const isAdmin = user.role === 'admin';
    const isBuyer = user.role === 'buyer';

    return (
        <div className="container mx-auto px-4 py-8">
            {/* Page Title */}
            <h1 className="text-3xl font-bold mb-6">Dashboard</h1>

            {/* General Welcome Message - Visible to all logged-in users */}
            <div className="bg-white p-6 rounded-lg shadow-md mb-6">
                <h2 className="text-xl font-semibold mb-2">Welcome, {user.username}!</h2>
                <p className="text-gray-600">
                    Your role: <span className="font-medium capitalize">{user.role}</span>
                </p>
            </div>

            {/* Seller Product Management Section */}
            {/* Visible only to users with 'seller' or 'admin' role */}
            {(isSeller || isAdmin) && (
                <div className="mb-6">
                    <SellerProductList />
                </div>
            )}

            {/* Buyer-Specific Section */}
            {/* Visible only to users with 'buyer' role */}
            {isBuyer && (
                <div className="bg-white p-6 rounded-lg shadow-md mb-6">
                    <h2 className="text-xl font-semibold">My Account</h2>
                    <p className="text-gray-600">
                        View your <Link to="/orders" className="text-blue-600 hover:underline">order history</Link>.
                    </p>
                </div>
            )}

             {/* Admin-Specific Sections Container */}
             {/* Visible only to users with 'admin' role */}
             {isAdmin && (
                 <div className="space-y-6">

                    {/* Admin Order Management */}
                    <AdminOrderList />

                    {/* Admin Category Management */}
                    <AdminCategoryList />

                 </div>
             )}

             {!isSeller && !isAdmin && !isBuyer && (
                 <p className="text-center text-gray-500 mt-6">Your dashboard view is not configured for your role.</p>
             )}

        </div>
    );
}

// Export the component
export default DashboardPage;