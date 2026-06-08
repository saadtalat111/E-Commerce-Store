// filepath: c:\Users\aimra\Desktop\MusaProject\client\src\context\CartContext.jsx
import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';
import { useAuth } from './AuthContext'; 
const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
    const [cartItems, setCartItems] = useState([]);
    const [isLoading, setIsLoading] = useState(false); 
    const [error, setError] = useState(null); 
    const { token, user } = useAuth(); 

    // Function to fetch cart from backend
    const fetchCart = useCallback(async () => {
        if (!token) {
            setCartItems([]); 
            return;
        }
        setIsLoading(true);
        setError(null);
        try {
            const response = await fetch('http://localhost:5000/api/cart', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            setCartItems(data);
        } catch (err) {
            console.error("Failed to fetch cart:", err);
            setError('Failed to load cart.');
            setCartItems([]); 
        } finally {
            setIsLoading(false);
        }
    }, [token]);

    // Fetch cart when user logs in or token changes
    useEffect(() => {
        if (user) { 
            fetchCart();
        } else {
            setCartItems([]); // Clear cart if user logs out
        }
    }, [user, fetchCart]); 

    // Function to add item to cart
    const addToCart = async (productId, quantity = 1) => {
        if (!token) {
            setError("Please log in to add items to your cart.");
            return { success: false, message: "Please log in." }; 
        }
        setIsLoading(true);
        setError(null);
        try {
            const response = await fetch('http://localhost:5000/api/cart', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({ productId, quantity }),
            });
            const data = await response.json(); 
            if (!response.ok) {
                throw new Error(data.message || `HTTP error! status: ${response.status}`);
            }

            await fetchCart();
            return { success: true, message: data.message || "Item added successfully!" }; // Indicate success

        } catch (err) {
            console.error("Failed to add item to cart:", err);
            setError(err.message || 'Failed to add item.');
            return { success: false, message: err.message || 'Failed to add item.' }; // Indicate failure
        } finally {
            setIsLoading(false);
        }
    };

    const updateCartItemQuantity = async (cartItemId, quantity) => {
        if (!token || quantity <= 0) {
            setError(quantity <= 0 ? "Quantity must be positive." : "Please log in.");
            return { success: false, message: quantity <= 0 ? "Quantity must be positive." : "Please log in." };
        }
        setIsLoading(true);
        setError(null);
        try {
            const response = await fetch(`http://localhost:5000/api/cart/${cartItemId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({ quantity }),
            });
            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.message || `HTTP error! status: ${response.status}`);
            }
            await fetchCart();
            return { success: true, message: data.message || "Quantity updated." };
        } catch (err) {
            console.error("Failed to update cart item quantity:", err);
            setError(err.message || 'Failed to update quantity.');
             await fetchCart();
            return { success: false, message: err.message || 'Failed to update quantity.' };
        } finally {
            setIsLoading(false);
        }
    };

    // ---removeFromCart ---
    const removeFromCart = async (cartItemId) => {
        if (!token) {
            setError("Please log in.");
            return { success: false, message: "Please log in." };
        }
        setIsLoading(true);
        setError(null);
        try {
            const response = await fetch(`http://localhost:5000/api/cart/${cartItemId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });
            if (!response.ok && response.status !== 204) {
                 const data = await response.json().catch(() => ({})); // Try to parse error message
                throw new Error(data.message || `HTTP error! status: ${response.status}`);
            }
            await fetchCart();
            return { success: true, message: "Item removed successfully." }; // Assuming success if no error
        } catch (err) {
            console.error("Failed to remove cart item:", err);
            setError(err.message || 'Failed to remove item.');
            return { success: false, message: err.message || 'Failed to remove item.' };
        } finally {
            setIsLoading(false);
        }
    };

     // --- placeOrder ---
     const placeOrder = async () => {
        if (!token) {
            setError("Please log in to place an order.");
            return { success: false, message: "Please log in." };
        }
        if (cartItems.length === 0) {
            setError("Cannot place an order with an empty cart.");
            return { success: false, message: "Cart is empty." };
        }
         const outOfStockItem = cartItems.find(item => item.quantity > item.stock_quantity);
         if (outOfStockItem) {
             setError(`Item "${outOfStockItem.name}" has insufficient stock.`);
             return { success: false, message: `Insufficient stock for ${outOfStockItem.name}.` };
         }

        setIsLoading(true);
        setError(null);
        try {
            const response = await fetch('http://localhost:5000/api/orders', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json', 
                    'Authorization': `Bearer ${token}`,
                },
            });

            const data = await response.json(); 

            if (!response.ok) {
                throw new Error(data.message || `HTTP error! status: ${response.status}`);
            }

            // Order placed successfully!
            // Clear the cart state on the frontend immediately
            setCartItems([]);
            // Return success and potentially the order details
            return { success: true, message: data.message || "Order placed successfully!", order: data.order };

        } catch (err) {
            console.error("Failed to place order:", err);
            setError(err.message || 'Failed to place order.');
            await fetchCart();
            return { success: false, message: err.message || 'Failed to place order.' };
        } finally {
            setIsLoading(false);
        }
    };

    // Calculate total number of items in the cart
    const cartItemCount = cartItems.reduce((count, item) => count + item.quantity, 0);

    // --- Calculate Cart Subtotal ---
    const cartSubtotal = cartItems.reduce((total, item) => {
        const price = parseFloat(item.price) || 0;
        const quantity = parseInt(item.quantity, 10) || 0;
        return total + (price * quantity);
    }, 0);

    return (
        <CartContext.Provider value={{
            cartItems,
            cartItemCount,
            cartSubtotal,
            addToCart,
            updateCartItemQuantity,
            removeFromCart,
            placeOrder, 
            fetchCart,
            isLoading,
            error
        }}>
            {children}
        </CartContext.Provider>
    );
};

// Custom hook to use the cart context
export const useCart = () => {
    return useContext(CartContext);
};