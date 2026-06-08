// filepath: c:\Users\aimra\Desktop\MusaProject\client\src\components\Login.jsx
import React, { useState } from 'react';

const handleLoginSuccess = (token, userData) => {
    console.log('Login Successful!');
    console.log('Token:', token);
    console.log('User Data:', userData);
    localStorage.setItem('authToken', token);
};

function Login() {
    const [formData, setFormData] = useState({
        emailOrUsername: '',
        password: '',
    });
    const [message, setMessage] = useState('');
    const [isError, setIsError] = useState(false);

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

        try {
            const response = await fetch('http://localhost:5000/api/auth/login', {
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

            // Login successful
            setMessage('Login successful!');
            setIsError(false);
            handleLoginSuccess(data.token, data.user); 
        } catch (error) {
            console.error('Login failed:', error);
            setMessage(error.message || 'Login failed. Please check your credentials.');
            setIsError(true);
        }
    };

    return (
        <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-lg shadow-md">
            <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">Login</h2>
            <form onSubmit={handleSubmit}>
                {/* Display Success/Error Messages */}
                {message && (
                    <div className={`mb-4 p-3 rounded text-center ${isError ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                        {message}
                    </div>
                )}

                {/* Form Fields */}
                <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="emailOrUsername">
                        Email or Username <span className="text-red-500">*</span>
                    </label>
                    <input
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring focus:ring-blue-300"
                        id="emailOrUsername"
                        type="text" // Can be email or text
                        name="emailOrUsername"
                        value={formData.emailOrUsername}
                        onChange={handleChange}
                        required
                        placeholder="your.email@example.com or username"
                    />
                </div>
                <div className="mb-6">
                    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="password">
                        Password <span className="text-red-500">*</span>
                    </label>
                    <input
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:ring focus:ring-blue-300"
                        id="password"
                        type="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        required
                        placeholder="******************"
                    />
                </div>

                {/* Submit Button */}
                <div className="flex items-center justify-center">
                    <button
                        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                        type="submit"
                    >
                        Login
                    </button>
                </div>
                <p className="text-center text-gray-600 text-xs mt-4">
                    Don't have an account? 
                    <a className="text-blue-500 hover:text-blue-800" href="#">
                        Register here
                    </a>
                </p>
            </form>
        </div>
    );
}

export default Login;