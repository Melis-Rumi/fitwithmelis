import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom'; // Import useNavigate
import './Intro.css'; // Import the CSS file

const Intro = () => {
  const [formData, setFormData] = useState({
    full_name: '',
    age: '',
    email: '',
    contact_number: '',
    preferred_contact_method: '',
    current_weight: '',
    goal: '',
    training_experience: '',
    specific_goals: '',
    obstacles: '',
    physique_rating: '',
    username: '', // Add username field
    password: '', // Add password field
  });
  const [csrfToken, setCsrfToken] = useState('');
  const navigate = useNavigate(); // Initialize useNavigate

  // Fetch CSRF token when the component mounts
  useEffect(() => {
    axios.get('https://fitwithme.onrender.com/csrf-token/')
        .then(response => {
            setCsrfToken(response.data.csrfToken);
        })
        .catch(error => console.error('Error fetching CSRF token:', error));
}, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate required fields
    for (const key in formData) {
        if (!formData[key]) {
            alert(`Please fill out the ${key.replace('_', ' ')} field.`);
            return;
        }
    }

    // Validate physique_rating is between 1 and 10
    if (formData.physique_rating < 1 || formData.physique_rating > 10) {
        alert('Physique Rating must be between 1 and 10.');
        return;
    }

    console.log('Form Data:', formData); // Debugging line

    if (!csrfToken) {
        alert('CSRF token is missing. Please try again.');
        return;
    }

    try {
        const response = await axios.post(
            'https://fitwithme.onrender.com/create-user-and-client/',
            formData,
            {
                headers: {
                    'X-CSRFToken': csrfToken,
                },
            }
        );

        if (response.status === 201) {
            alert('Account and client created successfully!');
            navigate('/login');
        }
    } catch (error) {
        console.error('Error:', error);
        alert(`Error: ${JSON.stringify(error.response?.data || error.message)}`);
    }
};

  return (
    <div className="intro-container">
      <h1>Let's get to know each other</h1>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          name="full_name"
          placeholder="Full Name"
          onChange={handleChange}
          required
        />
        <input
          type="number"
          name="age"
          placeholder="Age"
          onChange={handleChange}
          required
        />
        <input
          type="email"
          name="email"
          placeholder="Email"
          onChange={handleChange}
          required
        />
        <input
          type="text"
          name="contact_number"
          placeholder="Contact Number"
          onChange={handleChange}
          required
        />
        <select
          name="preferred_contact_method"
          onChange={handleChange}
          required
        >
          <option value="">Preferred Contact Method</option>
          <option value="Email">Email</option>
          <option value="Phone">Phone</option>
          <option value="WhatsApp">WhatsApp</option>
        </select>
        <input
          type="number"
          name="current_weight"
          placeholder="Current Weight"
          onChange={handleChange}
          required
        />
        <select name="goal" onChange={handleChange} required>
          <option value="">Goal</option>
          <option value="Fat Loss">Fat Loss</option>
          <option value="Muscle Gain">Muscle Gain</option>
          <option value="Boxing">Boxing</option>
          <option value="Other">Other</option>
        </select>
        <select
          name="training_experience"
          onChange={handleChange}
          required
        >
          <option value="">Training Experience</option>
          <option value="Beginner">Beginner</option>
          <option value="Intermediate">Intermediate</option>
          <option value="Advanced">Advanced</option>
        </select>
        <textarea
          name="specific_goals"
          placeholder="Specific Goals"
          onChange={handleChange}
          required
        />
        <textarea
          name="obstacles"
          placeholder="Obstacles"
          onChange={handleChange}
          required
        />
        <input
          type="number"
          name="physique_rating"
          placeholder="Physique Rating (1-10)"
          onChange={handleChange}
          min="1"
          max="10"
          required
        />
        <input
          type="text"
          name="username"
          placeholder="Username"
          onChange={handleChange}
          required
      />
      <input
          type="password"
          name="password"
          placeholder="Password"
          onChange={handleChange}
          required
      />
        <button type="submit">Submit</button>
      </form>
    </div>
  );
};

export default Intro;