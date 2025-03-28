import React, { createContext, useState } from 'react';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem('authToken') || null);

  const login = (newToken) => {
    setToken(newToken);
    localStorage.setItem('authToken', newToken); // Persist the token
  };

  const logout = () => {
    setToken(null);
    localStorage.removeItem('authToken'); // Remove the token
  };

  return (
    <AuthContext.Provider value={{ token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};