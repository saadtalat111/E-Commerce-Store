import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

function RegisterPage() {
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        firstName: '',
        lastName: '',
        role: 'buyer', // Default role is buyer
    });
    const [message, setMessage] = useState('');
    const [isError, setIsError] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');
        setIsError(false);
        setIsLoading(true);

        // Basic frontend validation
        if (formData.password.length < 6) {
             setMessage('Password must be at least 6 characters long.');
             setIsError(true);
             setIsLoading(false);
             return;
        }

        try {
            const response = await fetch('http://localhost:5000/api/auth/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || `HTTP error! status: ${response.status}`);
            }

            // Registration successful
            setMessage(`Registration successful for ${data.user.username}! Redirecting to login...`);
            setIsError(false);
            setFormData({ username: '', email: '', password: '', firstName: '', lastName: '', role: 'buyer' });

            // Redirect to login page after a short delay
            setTimeout(() => {
                navigate('/login');
            }, 2000);

        } catch (error) {
            console.error('Registration failed:', error);
            setMessage(error.message || 'Registration failed. Please try again.');
            setIsError(true);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-lg border border-gray-100">
                <div className="text-center">
                    <h2 className="text-3xl font-extrabold text-gray-800 mb-2">Create Account</h2>
                    <p className="text-gray-500 text-sm">Register to join our community</p>
                </div>
                
                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    {message && (
                        <div className={`p-4 rounded-lg ${isError ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-green-50 text-green-700 border border-green-200'}`}>
                            <p className="text-sm font-medium">{message}</p>
                        </div>
                    )}

                    <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-gray-700 text-sm font-semibold mb-2" htmlFor="firstName">
                                    First Name
                                </label>
                                <input
                                    className="appearance-none relative block w-full px-4 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 bg-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition duration-200"
                                    id="firstName"
                                    type="text"
                                    name="firstName"
                                    value={formData.firstName}
                                    onChange={handleChange}
                                    placeholder="First Name"
                                />
                            </div>
                            <div>
                                <label className="block text-gray-700 text-sm font-semibold mb-2" htmlFor="lastName">
                                    Last Name
                                </label>
                                <input
                                    className="appearance-none relative block w-full px-4 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 bg-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition duration-200"
                                    id="lastName"
                                    type="text"
                                    name="lastName"
                                    value={formData.lastName}
                                    onChange={handleChange}
                                    placeholder="Last Name"
                                />
                            </div>
                        </div>
                        
                        <div>
                            <label className="block text-gray-700 text-sm font-semibold mb-2" htmlFor="username">
                                Username <span className="text-red-500">*</span>
                            </label>
                            <input
                                className="appearance-none relative block w-full px-4 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 bg-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition duration-200"
                                id="username"
                                type="text"
                                name="username"
                                value={formData.username}
                                onChange={handleChange}
                                required
                                placeholder="Choose a username"
                            />
                        </div>
                        
                        <div>
                            <label className="block text-gray-700 text-sm font-semibold mb-2" htmlFor="email">
                                Email <span className="text-red-500">*</span>
                            </label>
                            <input
                                className="appearance-none relative block w-full px-4 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 bg-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition duration-200"
                                id="email"
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                required
                                placeholder="Your email address"
                            />
                        </div>
                        
                        <div>
                            <label className="block text-gray-700 text-sm font-semibold mb-2" htmlFor="password">
                                Password <span className="text-red-500">*</span>
                            </label>
                            <input
                                className="appearance-none relative block w-full px-4 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 bg-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition duration-200"
                                id="password"
                                type="password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                required
                                placeholder="Create a password"
                            />
                            <p className="mt-1 text-xs text-gray-500">Must be at least 6 characters long</p>
                        </div>

                        {/* Role Selection */}
                        <div>
                            <label className="block text-gray-700 text-sm font-semibold mb-2">
                                Register as <span className="text-red-500">*</span>
                            </label>
                            <div className="grid grid-cols-2 gap-4 mt-2">
                            <label 
                                className={`flex items-center p-3 border rounded-lg cursor-pointer transition-colors duration-200 ${
                                    formData.role === 'buyer' 
                                        ? 'border-blue-400 bg-blue-50 text-blue-700' 
                                        : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                                }`}
                            >
                                <input
                                    type="radio"
                                    name="role"
                                    value="buyer"
                                    checked={formData.role === 'buyer'}
                                    onChange={handleChange}
                                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 bg-white accent-white"
                                    />
                                <div className="ml-3">
                                    <span className="block text-sm font-medium">Buyer</span>
                                    <span className="block text-xs text-gray-500">Shop for products</span>
                                </div>
                            </label>
                            
                            <label 
                                className={`flex items-center p-3 border rounded-lg cursor-pointer transition-colors duration-200 ${
                                    formData.role === 'seller' 
                                        ? 'border-blue-400 bg-blue-50 text-blue-700' 
                                        : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                                }`}
                            >
                                <input
                                    type="radio"
                                    name="role"
                                    value="seller"
                                    checked={formData.role === 'seller'}
                                    onChange={handleChange}
                                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 bg-white"
                                />
                                <div className="ml-3">
                                    <span className="block text-sm font-medium">Seller</span>
                                    <span className="block text-xs text-gray-500">Sell your products</span>
                                </div>
                            </label>
                        </div>
                        </div>
                    </div>

                    <div>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className={`group relative w-full flex justify-center py-3 px-4 border border-transparent rounded-lg text-white font-medium ${isLoading ? 'bg-blue-400' : 'bg-blue-600 hover:bg-blue-700'} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-200`}
                        >
                            {isLoading ? 'Creating account...' : 'Create Account'}
                        </button>
                    </div>

                    <div className="text-center mt-4">
                        <p className="text-sm text-gray-600">
                            Already have an account?{' '}
                            <Link to="/login" className="font-medium text-blue-600 hover:text-blue-500 transition duration-200">
                                Sign in
                            </Link>
                        </p>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default RegisterPage;