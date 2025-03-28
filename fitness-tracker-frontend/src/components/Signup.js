import React, { useState } from 'react';
import axios from 'axios';
import { useLocation, useNavigate } from 'react-router-dom';
import './Signup.css';

const Signup = () => {
  const location = useLocation();
  const email = location.state?.email || ''; // Get the email from the state
  const [formData, setFormData] = useState({
    email: email,
    username: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState(''); // State to handle errors
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate passwords match
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match!');
      return;
    }

    // Clear any previous errors
    setError('');

    try {
      const response = await axios.post('https://fitwithme.onrender.com/user-credentials/', formData, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.status === 201) {
        alert('Account created successfully!');
        navigate('/login'); // Redirect to login page
      }
    } catch (error) {
      console.error('Error:', error);
      if (error.response) {
        // Display backend validation errors
        setError(`Error: ${JSON.stringify(error.response.data)}`);
      } else {
        setError('An unexpected error occurred. Please try again.');
      }
    }
  };

  return (
    <div className="signup-container">
      <h1>Last step</h1>
      <h2>Sign up to access your fitness tracker</h2>
      {error && <p className="error-message">{error}</p>} {/* Display error message */}
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="Email"
          required
        />
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
        <input
          type="password"
          name="confirmPassword"
          placeholder="Confirm Password"
          value={formData.confirmPassword}
          onChange={handleChange}
          required
        />
        <button type="submit">Sign Up</button>
      </form>
    </div>
  );
};

export default Signup;