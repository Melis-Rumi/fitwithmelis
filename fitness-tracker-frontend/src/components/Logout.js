import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../AuthContext';
import './Logout.css';

const Logout = () => {
  const { logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      // Call the backend logout endpoint
      await axios.post('https://fitwithme.onrender.com/logout/', {
        refresh_token: localStorage.getItem('refreshToken'), // If you're storing the refresh token
      });

      // Clear authentication context and local storage
      logout();
      
      // Redirect to login page
      navigate('/');
    } catch (error) {
      console.error('Logout error:', error);
      // Still logout the user on the frontend even if the backend call fails
      logout();
      navigate('/');
    }
  };

  return (
    <button className="logout-button" onClick={handleLogout}>
      Logout
    </button>
  );
};

export default Logout;