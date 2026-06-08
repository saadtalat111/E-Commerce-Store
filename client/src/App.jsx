import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import ProductsPage from './pages/ProductsPage';
import ProductDetailPage from './pages/ProductDetailPage';
import CartPage from './pages/CartPage';
import OrderConfirmationPage from './pages/OrderConfirmationPage';
import OrderHistoryPage from './pages/OrderHistoryPage';
import OrderDetailPage from './pages/OrderDetailPage';
import AddProductPage from './pages/AddProductPage';
import EditProductPage from './pages/EditProductPage';


import './App.css';

// Main application component
function App() {
  return (
      <div className="flex flex-col min-h-screen bg-gray-50">
          <Navbar />

          <main className="flex-grow container mx-auto px-4 py-8">
              {/* Application Routes */}
              <Routes>
                  <Route path="/" element={<HomePage />} />
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/register" element={<RegisterPage />} />
                  <Route path="/products" element={<ProductsPage />} />
                  <Route path="/products/:id" element={<ProductDetailPage />} />
    
                  <Route
                      path="/dashboard"
                      element={
                          <ProtectedRoute>
                              <DashboardPage />
                          </ProtectedRoute>
                      }
                  />
                  <Route
                        path="/cart"
                        element={<ProtectedRoute><CartPage /></ProtectedRoute>}
                    />
                    <Route
                        path="/order-confirmation"
                        element={<ProtectedRoute><OrderConfirmationPage /></ProtectedRoute>}
                    />
                    <Route
                        path="/orders"
                        element={<ProtectedRoute><OrderHistoryPage /></ProtectedRoute>}
                    />
                    <Route
                        path="/orders/:orderId"
                        element={<ProtectedRoute><OrderDetailPage /></ProtectedRoute>}
                    />
                    <Route
                        path="/dashboard/products/add"
                        element={<ProtectedRoute requiredRoles={['seller', 'admin']}><AddProductPage /></ProtectedRoute>}
                    />
                    <Route
                        path="/dashboard/products/edit/:productId"
                        element={<ProtectedRoute requiredRoles={['seller', 'admin']}><EditProductPage /></ProtectedRoute>}
                    />
                    <Route
                        path="/dashboard/products/add"
                        element={<ProtectedRoute requiredRoles={['seller', 'admin']}><AddProductPage /></ProtectedRoute>}
                    />
                    <Route
                        path="/dashboard/products/edit/:productId"
                        element={<ProtectedRoute requiredRoles={['seller', 'admin']}><EditProductPage /></ProtectedRoute>}
                    />
                    <Route
                        path="/dashboard/products/add"
                        element={<ProtectedRoute requiredRoles={['seller', 'admin']}><AddProductPage /></ProtectedRoute>}
                    />
                    <Route
                        path="/dashboard/products/edit/:productId"
                        element={<ProtectedRoute requiredRoles={['seller', 'admin']}><EditProductPage /></ProtectedRoute>}
                    />

                  <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
          </main>

      </div>
  );
}

// Component for handling protected routes with optional role checks
function ProtectedRoute({ children, requiredRoles }) {
    const { user, isLoading } = useAuth();

    if (isLoading) {
        return <div>Loading...</div>;
    }

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    if (requiredRoles && !requiredRoles.includes(user.role)) {
        return <Navigate to="/dashboard" replace state={{ message: "Access Denied" }} />;
    }


    return children;
}

// Export the App component
export default App;