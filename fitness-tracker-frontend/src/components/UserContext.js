import React, { createContext, useState, useEffect } from 'react';

// Create a context for the user ID and username
export const UserContext = createContext();

// Create a provider component
export const UserProvider = ({ children }) => {
  // Initialize userId and username from local storage if they exist
  const [userId, setUserId] = useState(() => {
    const storedUserId = localStorage.getItem('userId');
    return storedUserId ? storedUserId : null;
  });
  const [username, setUsername] = useState(() => {
    const storedUsername = localStorage.getItem('username');
    return storedUsername ? storedUsername : null;
  });

  // Update local storage whenever userId or username changes
  useEffect(() => {
    if (userId) {
      localStorage.setItem('userId', userId); // Save userId to local storage
    } else {
      localStorage.removeItem('userId'); // Remove userId from local storage if it's null
    }
  }, [userId]);

  useEffect(() => {
    if (username) {
      localStorage.setItem('username', username); // Save username to local storage
    } else {
      localStorage.removeItem('username'); // Remove username from local storage if it's null
    }
  }, [username]);

  return (
    <UserContext.Provider value={{ userId, setUserId, username, setUsername }}>
      {children}
    </UserContext.Provider>
  );
};