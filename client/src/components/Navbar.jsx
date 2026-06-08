import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

function Navbar() {
    const { user, logout } = useAuth();
    const { cartItemCount } = useCart();
    const navigate = useNavigate();
    const location = useLocation();
    const isLoggedIn = !!user;
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const handleLogout = () => {
        logout();
        navigate('/login');
        setIsMobileMenuOpen(false);
    };

    // Function to check if the current path matches the link
    const isActive = (path) => {
        return location.pathname === path;
    };

    // Link styles with active state
    const linkClasses = (path) => `px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${
        isActive(path) 
            ? 'bg-blue-700 text-white' 
            : 'text-blue-50 hover:bg-blue-700/80 hover:text-white'
    }`;

    const toggleMobileMenu = () => {
        setIsMobileMenuOpen(!isMobileMenuOpen);
    };

    return (
        <nav className="bg-blue-600 shadow-lg sticky top-0 z-50">
            <div className="container mx-auto px-4">
                <div className="flex justify-between items-center h-16">
                    {/* Logo */}
                    <Link to="/" className="flex items-center space-x-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                        </svg>
                        <span className="text-xl font-bold text-white">Ecommerce</span>
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center space-x-2">
                        <Link to="/" className={linkClasses('/')}>Home</Link>
                        <Link to="/products" className={linkClasses('/products')}>Products</Link>

                        {!isLoggedIn && (
                            <>
                                <Link to="/login" className={linkClasses('/login')}>Login</Link>
                                <Link to="/register" className={linkClasses('/register')}>Register</Link>
                            </>
                        )}

                        {isLoggedIn && (
                            <>
                                <Link to="/dashboard" className={linkClasses('/dashboard')}>Dashboard</Link>
                                <Link to="/orders" className={linkClasses('/orders')}>My Orders</Link>

                                {(user.role === 'seller' || user.role === 'admin') && (
                                    <Link to="/dashboard" className={linkClasses('/dashboard')}>Manage Products</Link>
                                )}

                                {/* Cart Icon */}
                                <Link to="/cart" className="relative px-3 py-2 text-blue-50 hover:text-white">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                                    </svg>
                                    {cartItemCount > 0 && (
                                        <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-500 rounded-full">
                                            {cartItemCount}
                                        </span>
                                    )}
                                </Link>

                                <button
                                    onClick={handleLogout}
                                    className="px-4 py-2 rounded-lg bg-red-500 text-white text-sm font-medium hover:bg-red-600 transition-colors duration-200 ml-2 focus:outline-none focus:ring-2 focus:ring-red-300 focus:ring-offset-2 focus:ring-offset-blue-600"
                                >
                                    Logout
                                </button>
                                
                                {/* User Badge */}
                                <div className="ml-2 px-3 py-1 rounded-full bg-blue-700 text-white text-sm font-medium">
                                    {user.username}
                                </div>
                            </>
                        )}
                    </div>

                    {/* Mobile Menu Button */}
                    <div className="md:hidden flex items-center">
                        {isLoggedIn && (
                            <Link to="/cart" className="relative mr-4 text-blue-50 hover:text-white">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                                </svg>
                                {cartItemCount > 0 && (
                                    <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-500 rounded-full">
                                        {cartItemCount}
                                    </span>
                                )}
                            </Link>
                        )}
                        
                        <button
                            onClick={toggleMobileMenu}
                            className="text-blue-50 hover:text-white focus:outline-none focus:text-white"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                {isMobileMenuOpen ? (
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                ) : (
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                                )}
                            </svg>
                        </button>
                    </div>
                </div>

                {/* Mobile Menu */}
                {isMobileMenuOpen && (
                    <div className="md:hidden py-3 space-y-2 border-t border-blue-500 bg-blue-600">
                        <Link to="/" className="block px-4 py-2 text-blue-50 hover:bg-blue-700 hover:text-white" onClick={() => setIsMobileMenuOpen(false)}>Home</Link>
                        <Link to="/products" className="block px-4 py-2 text-blue-50 hover:bg-blue-700 hover:text-white" onClick={() => setIsMobileMenuOpen(false)}>Products</Link>
                        
                        {!isLoggedIn && (
                            <>
                                <Link to="/login" className="block px-4 py-2 text-blue-50 hover:bg-blue-700 hover:text-white" onClick={() => setIsMobileMenuOpen(false)}>Login</Link>
                                <Link to="/register" className="block px-4 py-2 text-blue-50 hover:bg-blue-700 hover:text-white" onClick={() => setIsMobileMenuOpen(false)}>Register</Link>
                            </>
                        )}

                        {isLoggedIn && (
                            <>
                                <Link to="/dashboard" className="block px-4 py-2 text-blue-50 hover:bg-blue-700 hover:text-white" onClick={() => setIsMobileMenuOpen(false)}>Dashboard</Link>
                                <Link to="/orders" className="block px-4 py-2 text-blue-50 hover:bg-blue-700 hover:text-white" onClick={() => setIsMobileMenuOpen(false)}>My Orders</Link>
                                
                                {(user.role === 'seller' || user.role === 'admin') && (
                                    <Link to="/dashboard" className="block px-4 py-2 text-blue-50 hover:bg-blue-700 hover:text-white" onClick={() => setIsMobileMenuOpen(false)}>Manage Products</Link>
                                )}
                                
                                {/* User Badge Mobile */}
                                <div className="mx-4 px-3 py-1 rounded-full bg-blue-700 text-white text-sm font-medium inline-block">
                                    {user.username}
                                </div>
                                
                                <button
                                    onClick={handleLogout}
                                    className="block w-full text-left px-4 py-2 text-red-100 bg-red-500 hover:bg-red-600 mt-2"
                                >
                                    Logout
                                </button>
                            </>
                        )}
                    </div>
                )}
            </div>
        </nav>
    );
}

export default Navbar;