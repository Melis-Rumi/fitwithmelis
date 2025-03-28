import React, { useState, useContext } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { UserContext } from './UserContext'; // Import UserContext
import { AuthContext } from '../AuthContext';
import './Login.css';

const Login = () => {
  const { login } = useContext(AuthContext);
  const { setUserId, setUsername } = useContext(UserContext); // Get setUserId and setUsername from UserContext
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const response = await axios.post('https://fitwithme.onrender.com/login/', formData, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      if (response.status === 200) {
        const token = response.data.token; // Extract the token from the response
        login(token); // Call the login function from AuthContext
        const username = formData.username; // Get the username from the form data
        setUserId(response.data.user_id); // Set the user ID in UserContext
        setUsername(username); // Set the username in UserContext
        alert('Login successful!');
        navigate('/home');
      }
    } catch (error) {
      console.error('Error:', error.response?.data || error.message);
      setError(error.response?.data?.error || 'An unexpected error occurred.');
    }
  };

  return (
    <div className="login-container">
      <h1>Welcome Back</h1>
      <h2>Log in to access your fitness tracker</h2>
      {error && <p className="error-message">{error}</p>}
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          name="username"
          placeholder="Username"
          value={formData.username}
          onChange={handleChange}
          required
        />
        <input
          type="password"
          name="password"
          placeholder="Password"
          value={formData.password}
          onChange={handleChange}
          required
        />
        <button type="submit">Log In</button>
      </form>
      <p>
        Don't have an account?{' '}
        <span className="signup-link" onClick={() => navigate('/intro')}>
          Sign up
        </span>
      </p>
    </div>
  );
};

export default Login;