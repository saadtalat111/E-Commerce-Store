// filepath: c:\Users\aimra\Desktop\MusaProject\client\src\context\AuthContext.jsx
import React, { createContext, useState, useEffect, useContext } from 'react';
import { jwtDecode } from 'jwt-decode'; 

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null); 
    const [token, setToken] = useState(localStorage.getItem('authToken')); 
    useEffect(() => {
        const storedToken = localStorage.getItem('authToken');
        if (storedToken) {
            try {
                const decodedUser = jwtDecode(storedToken);
                if (decodedUser.exp * 1000 > Date.now()) {
                    setUser(decodedUser);
                    setToken(storedToken);
                } else {
                    localStorage.removeItem('authToken');
                    setUser(null);
                    setToken(null);
                }
            } catch (error) {
                console.error("Error decoding token on initial load:", error);
                localStorage.removeItem('authToken'); 
                setUser(null);
                setToken(null);
            }
        }
    }, []);

    const login = (newToken) => {
        try {
            const decodedUser = jwtDecode(newToken);
            localStorage.setItem('authToken', newToken);
            setUser(decodedUser);
            setToken(newToken);
        } catch (error) {
            console.error("Error decoding token on login:", error);
        }
    };

    const logout = () => {
        localStorage.removeItem('authToken');
        setUser(null);
        setToken(null);
    };

    return (
        <AuthContext.Provider value={{ user, token, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

// Custom hook to use the auth context
export const useAuth = () => {
    return useContext(AuthContext);
};