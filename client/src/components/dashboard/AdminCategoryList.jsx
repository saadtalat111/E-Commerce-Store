import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';

function AdminCategoryList() {
    const [categories, setCategories] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const [editMode, setEditMode] = useState({}); 
    const [newName, setNewName] = useState(''); 
    const { token } = useAuth();

    // Rest of your functions remain unchanged
    const fetchCategories = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await fetch('http://localhost:5000/api/categories');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            setCategories(data);
        } catch (err) {
            console.error("Failed to fetch categories:", err);
            setError(err.message || 'Failed to load categories.');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchCategories();
    }, []); 

    // --- Add Category ---
    const handleAddCategory = async (e) => {
        e.preventDefault();
        if (!newName.trim()) return;
        setError(null);
        setSuccess(null);

        try {
            const response = await fetch('http://localhost:5000/api/categories', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({ name: newName.trim() }),
            });
            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.message || `HTTP error! status: ${response.status}`);
            }
            setCategories([...categories, data.category].sort((a, b) => a.name.localeCompare(b.name))); // Keep sorted
            setNewName('');
            setSuccess(`Category "${data.category.name}" added successfully.`);
        } catch (err) {
            console.error("Error adding category:", err);
            setError(err.message || 'Failed to add category.');
        }
    };

    // --- Edit Category ---
    const handleEditClick = (category) => {
        setEditMode({ [category.category_id]: category.name });
    };

    const handleEditChange = (e, categoryId) => {
        setEditMode({ [categoryId]: e.target.value });
    };

    const handleCancelEdit = () => {
        setEditMode({});
    };

    const handleSaveEdit = async (categoryId) => {
        const updatedName = editMode[categoryId]?.trim();
        if (!updatedName) return;
        setError(null);
        setSuccess(null);

        try {
            const response = await fetch(`http://localhost:5000/api/categories/${categoryId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({ name: updatedName }),
            });
            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.message || `HTTP error! status: ${response.status}`);
            }
            setCategories(categories.map(cat =>
                cat.category_id === categoryId ? data.category : cat
            ).sort((a, b) => a.name.localeCompare(b.name))); 
            setEditMode({});
            setSuccess(`Category updated to "${data.category.name}" successfully.`);
        } catch (err) {
            console.error("Error updating category:", err);
            setError(err.message || 'Failed to update category.');
        }
    };

    // --- Delete Category ---
    const handleDeleteCategory = async (categoryId, categoryName) => {
        if (!window.confirm(`Are you sure you want to delete the category "${categoryName}"? This cannot be undone.`)) {
            return;
        }
        setError(null);
        setSuccess(null);

        try {
            const response = await fetch(`http://localhost:5000/api/categories/${categoryId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` },
            });
            const data = await response.json(); 
            if (!response.ok) {
                if (response.status === 400 && data.message?.includes('assigned to one or more products')) {
                     throw new Error(data.message); 
                }
                throw new Error(data.message || `HTTP error! status: ${response.status}`);
            }
            setCategories(categories.filter(cat => cat.category_id !== categoryId));
            setSuccess(data.message || `Category "${categoryName}" deleted successfully.`);
        } catch (err) {
            console.error("Error deleting category:", err);
            setError(err.message || 'Failed to delete category.');
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
                <p className="text-gray-600 mt-3">Loading categories...</p>
            </div>
        );
    }

    return (
        <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-semibold text-gray-800">Manage Categories</h2>
                <button 
                    onClick={fetchCategories} 
                    className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition duration-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-gray-300 flex items-center"
                >
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
                    </svg>
                    Refresh
                </button>
            </div>

            {/* Add Category Form - Fixed input styling for light mode */}
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 mb-6">
                <h3 className="font-medium text-gray-800 mb-3">Add New Category</h3>
                <form onSubmit={handleAddCategory} className="flex items-end space-x-2">
                    <div className="flex-grow">
                        <label htmlFor="new-category-name" className="block text-sm font-medium text-gray-700 mb-1">Category Name</label>
                        <input
                            type="text"
                            id="new-category-name"
                            value={newName}
                            onChange={(e) => setNewName(e.target.value)}
                            placeholder="Enter category name"
                            className="appearance-none block w-full px-4 py-2 border border-gray-300 rounded-lg placeholder-gray-500 text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition duration-200"
                        />
                    </div>
                    <button
                        type="submit"
                        className="bg-blue-50 hover:bg-blue-100 text-blue-700 font-medium py-2 px-4 rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed border border-blue-200 transition-colors duration-200"
                        disabled={!newName.trim()}
                    >
                        Add Category
                    </button>
                </form>
            </div>

            {/* Notification Messages */}
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

            {success && (
                <div className="mb-4 p-4 bg-green-50 text-green-700 border border-green-200 rounded-lg">
                    <p className="flex items-center">
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                        </svg>
                        {success}
                    </p>
                </div>
            )}

            {/* Category List */}
            {categories.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
                    <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"></path>
                    </svg>
                    <p className="mt-2 text-gray-600">No categories found.</p>
                </div>
            ) : (
                <div className="overflow-x-auto rounded-lg border border-gray-200">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {categories.map((category) => (
                                <tr key={category.category_id} className="hover:bg-gray-50 transition-colors duration-150 ease-in-out">
                                    <td className="px-4 py-3 whitespace-nowrap">
                                        <div className="text-sm text-gray-500">{category.category_id}</div>
                                    </td>
                                    <td className="px-4 py-3 whitespace-nowrap">
                                        {editMode[category.category_id] !== undefined ? (
                                            <input
                                                type="text"
                                                value={editMode[category.category_id]}
                                                onChange={(e) => handleEditChange(e, category.category_id)}
                                                className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition duration-200 text-sm"
                                                autoFocus
                                            />
                                        ) : (
                                            <div className="text-sm font-medium text-gray-900">{category.name}</div>
                                        )}
                                    </td>
                                    <td className="px-4 py-3 whitespace-nowrap text-right">
                                        {editMode[category.category_id] !== undefined ? (
                                            <div className="flex justify-end space-x-2">
                                                <button
                                                    onClick={() => handleSaveEdit(category.category_id)}
                                                    className="text-green-600 hover:text-green-800 bg-green-50 hover:bg-green-100 px-2 py-1 rounded-md text-sm font-medium transition-colors duration-150 border border-green-100 disabled:opacity-50 disabled:cursor-not-allowed"
                                                    disabled={!editMode[category.category_id]?.trim()}
                                                >
                                                    Save
                                                </button>
                                                <button
                                                    onClick={handleCancelEdit}
                                                    className="text-gray-600 hover:text-gray-800 bg-gray-50 hover:bg-gray-100 px-2 py-1 rounded-md text-sm font-medium transition-colors duration-150 border border-gray-200"
                                                >
                                                    Cancel
                                                </button>
                                            </div>
                                        ) : (
                                            <div className="flex justify-end space-x-2">
                                                <button
                                                    onClick={() => handleEditClick(category)}
                                                    className="text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-2 py-1 rounded-md text-sm font-medium transition-colors duration-150 border border-blue-100"
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteCategory(category.category_id, category.name)}
                                                    className="text-red-600 hover:text-red-800 bg-red-50 hover:bg-red-100 px-2 py-1 rounded-md text-sm font-medium transition-colors duration-150 border border-red-100"
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                        )}
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

export default AdminCategoryList;