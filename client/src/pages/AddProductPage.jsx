import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function AddProductPage() {
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        price: '',
        stock_quantity: '',
        category_id: '',
        image_url: ''
    });
    const [categories, setCategories] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [fieldErrors, setFieldErrors] = useState({});
    const [success, setSuccess] = useState(null);
    const { token } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        const fetchCategories = async () => {
            setError(prev => (prev?.includes('categories') ? null : prev));
            try {
                const response = await fetch('http://localhost:5000/api/categories');
                if (!response.ok) {
                    const errorData = await response.json().catch(() => ({}));
                    throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
                }
                const data = await response.json();
                setCategories(data);
            } catch (err) {
                console.error("Error fetching categories:", err);
                setError(`Could not load categories: ${err.message}.`);
                setCategories([]);
            }
        };
        fetchCategories();
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prevData => ({
            ...prevData,
            [name]: value
        }));
        if (fieldErrors[name]) {
            setFieldErrors(prevErrors => ({ ...prevErrors, [name]: null }));
        }
        if (error) setError(null);
    };

    const validateForm = () => {
        const errors = {};
        if (!formData.name.trim()) errors.name = "Product name is required.";
        if (!formData.description.trim()) errors.description = "Description is required.";

        if (!formData.price) {
            errors.price = "Price is required.";
        } else if (isNaN(parseFloat(formData.price)) || parseFloat(formData.price) <= 0) {
            errors.price = "Please enter a valid positive price.";
        }

        if (formData.stock_quantity === '') {
            errors.stock_quantity = "Stock quantity is required.";
        } else if (isNaN(parseInt(formData.stock_quantity, 10)) || parseInt(formData.stock_quantity, 10) < 0 || !Number.isInteger(Number(formData.stock_quantity))) {
            errors.stock_quantity = "Please enter a valid non-negative whole number.";
        }

        if (formData.image_url && !/^https?:\/\/.+\..+/.test(formData.image_url)) {
             errors.image_url = "Please enter a valid URL (e.g., http://... or https://...).";
        }

        setFieldErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setSuccess(null);

        if (!validateForm()) {
            setError("Please fix the errors in the form.");
            return;
        }

        setIsLoading(true);

        try {
            const response = await fetch('http://localhost:5000/api/products', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({
                    ...formData,
                    price: parseFloat(formData.price),
                    stock_quantity: parseInt(formData.stock_quantity, 10),
                    category_id: formData.category_id ? parseInt(formData.category_id, 10) : null,
                    image_url: formData.image_url || null
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || `HTTP error! status: ${response.status}`);
            }

            setSuccess(`Product "${data.product.name}" created successfully! Redirecting...`);
            setTimeout(() => {
                navigate('/dashboard');
            }, 2000);

        } catch (err) {
            console.error("Failed to create product:", err);
            setError(err.message || 'Failed to create product. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const getInputClasses = (fieldName) => {
        const baseClasses = "appearance-none relative block w-full px-4 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 bg-white rounded-lg focus:outline-none focus:ring-2 focus:border-transparent transition duration-200";
        if (fieldErrors[fieldName]) {
            return `${baseClasses} border-red-500 focus:ring-red-400`;
        }
        return `${baseClasses} focus:ring-blue-400`;
    };

    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto">
                <div className="flex items-center mb-6">
                    <Link to="/dashboard" className="flex items-center text-blue-600 hover:text-blue-700 transition-colors duration-200 font-medium">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
                        </svg>
                        Back to Dashboard
                    </Link>
                </div>

                <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-100">
                    <div className="text-center mb-8">
                        <h1 className="text-3xl font-extrabold text-gray-800 mb-2">Add New Product</h1>
                        <p className="text-gray-500 text-sm">Create a new product listing to sell on the platform</p>
                    </div>

                    {(error || success) && (
                        <div className={`p-4 rounded-lg mb-6 ${error ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-green-50 text-green-700 border border-green-200'}`}>
                            <p className="text-sm font-medium">{error || success}</p>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <fieldset disabled={isLoading}>
                            {/* Basic Information Section */}
                            <div className="space-y-4">
                                <h2 className="text-xl font-semibold text-gray-800 border-b border-gray-200 pb-2">Basic Information</h2>
                                
                                <div>
                                    <label className="block text-gray-700 text-sm font-semibold mb-2" htmlFor="name">
                                        Product Name <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        id="name"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        required
                                        placeholder="Enter product name"
                                        className={getInputClasses('name')}
                                    />
                                    {fieldErrors.name && <p className="mt-1 text-sm text-red-600">{fieldErrors.name}</p>}
                                </div>

                                <div>
                                    <label className="block text-gray-700 text-sm font-semibold mb-2" htmlFor="description">
                                        Description <span className="text-red-500">*</span>
                                    </label>
                                    <textarea
                                        id="description"
                                        name="description"
                                        value={formData.description}
                                        onChange={handleChange}
                                        required
                                        placeholder="Describe your product"
                                        rows="4"
                                        className={getInputClasses('description')}
                                    />
                                    {fieldErrors.description && <p className="mt-1 text-sm text-red-600">{fieldErrors.description}</p>}
                                </div>
                            </div>

                            {/* Pricing & Inventory Section */}
                            <div className="space-y-4 mt-8">
                                <h2 className="text-xl font-semibold text-gray-800 border-b border-gray-200 pb-2">Pricing & Inventory</h2>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-gray-700 text-sm font-semibold mb-2" htmlFor="price">
                                            Price ($) <span className="text-red-500">*</span>
                                        </label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                <span className="text-gray-500">$</span>
                                            </div>
                                            <input
                                                type="number"
                                                id="price"
                                                name="price"
                                                value={formData.price}
                                                onChange={handleChange}
                                                required
                                                min="0.01"
                                                step="0.01"
                                                placeholder="0.00"
                                                className={`${getInputClasses('price')} pl-8`}
                                            />
                                        </div>
                                        {fieldErrors.price && <p className="mt-1 text-sm text-red-600">{fieldErrors.price}</p>}
                                    </div>
                                    <div>
                                        <label className="block text-gray-700 text-sm font-semibold mb-2" htmlFor="stock_quantity">
                                            Stock Quantity <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="number"
                                            id="stock_quantity"
                                            name="stock_quantity"
                                            value={formData.stock_quantity}
                                            onChange={handleChange}
                                            required
                                            min="0"
                                            step="1"
                                            placeholder="0"
                                            className={getInputClasses('stock_quantity')}
                                        />
                                        {fieldErrors.stock_quantity && <p className="mt-1 text-sm text-red-600">{fieldErrors.stock_quantity}</p>}
                                    </div>
                                </div>
                            </div>

                            {/* Details Section */}
                            <div className="space-y-4 mt-8">
                                <h2 className="text-xl font-semibold text-gray-800 border-b border-gray-200 pb-2">Additional Details</h2>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-gray-700 text-sm font-semibold mb-2" htmlFor="category_id">
                                            Category
                                        </label>
                                        <select
                                            id="category_id"
                                            name="category_id"
                                            value={formData.category_id}
                                            onChange={handleChange}
                                            className={`${getInputClasses('category_id')} pr-10`}
                                        >
                                            <option value="">-- Select a Category --</option>
                                            {categories.map(cat => (
                                                <option key={cat.category_id} value={cat.category_id}>
                                                    {cat.name}
                                                </option>
                                            ))}
                                        </select>
                                        {fieldErrors.category_id && <p className="mt-1 text-sm text-red-600">{fieldErrors.category_id}</p>}
                                    </div>
                                    <div>
                                        <label className="block text-gray-700 text-sm font-semibold mb-2" htmlFor="image_url">
                                            Image URL
                                        </label>
                                        <input
                                            type="url"
                                            id="image_url"
                                            name="image_url"
                                            value={formData.image_url}
                                            onChange={handleChange}
                                            placeholder="https://example.com/image.jpg"
                                            className={getInputClasses('image_url')}
                                        />
                                        {fieldErrors.image_url && <p className="mt-1 text-sm text-red-600">{fieldErrors.image_url}</p>}
                                        <p className="mt-1 text-xs text-gray-500">Enter a direct link to an image (PNG, JPG, WEBP)</p>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-8 pt-6 border-t border-gray-200">
                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-lg text-white font-medium ${isLoading ? 'bg-blue-400' : 'bg-blue-600 hover:bg-blue-700'} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-200`}
                                >
                                    {isLoading ? (
                                        <>
                                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            Creating Product...
                                        </>
                                    ) : (
                                        'Create Product'
                                    )}
                                </button>
                            </div>
                        </fieldset>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default AddProductPage;