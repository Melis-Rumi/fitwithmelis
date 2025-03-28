// ProfilePage.js
import React, { useState, useEffect ,useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../AuthContext'; // Adjust the path as needed
import { UserContext } from './UserContext';
import './ProfilePage.css';

const ProfilePage = () => {

  const { userId } = useContext(UserContext); // Get userId from context
  const url = userId
  ? `https://fitwithme.onrender.com/api/client-profile/?__user_id=${userId}`
  : 'https://fitwithme.onrender.com/api/client-profile/';
  const { token } = React.useContext(AuthContext); // Access the token from context
  const [profile, setProfile] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    full_name: '',
    age: '',
    contact_number: '',
    preferred_contact_method: '',
    current_weight: '',
    goal: '',
    training_experience: '',
    specific_goals: '',
    obstacles: '',
    physique_rating: '',
  });

  // Fetch client profile on component mount
  useEffect(() => {
    
    const fetchProfile = async () => {
      try {
        const response = await axios.get(url, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setProfile(response.data);
        setFormData(response.data); // Initialize form data with fetched profile
      } catch (error) {
        console.error('Error fetching profile:', error);
      }
    };
    fetchProfile();
  }, [url, token]);

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // Save updated profile
  const handleSave = async () => {
    try {
      await axios.put(url, formData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProfile(formData); // Update local state with new data
      setEditMode(false); // Exit edit mode
      alert('Profile updated successfully!');
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Failed to update profile.');
    }
  };

  if (!profile) {
    return <div>Loading...</div>;
  }

  return (
    <div className="profile-page">
      <h1>My Profile</h1>
      {editMode ? (
        <form className="profile-form">
          <label>
            Full Name:
            <input
              type="text"
              name="full_name"
              value={formData.full_name}
              onChange={handleChange}
            />
          </label>
          <label>
            Age:
            <input
              type="number"
              name="age"
              value={formData.age}
              onChange={handleChange}
            />
          </label>
          <label>
            Contact Number:
            <input
              type="text"
              name="contact_number"
              value={formData.contact_number}
              onChange={handleChange}
            />
          </label>
          <label>
            Preferred Contact Method:
            <input
              type="text"
              name="preferred_contact_method"
              value={formData.preferred_contact_method}
              onChange={handleChange}
            />
          </label>
          <label>
            Current Weight (kg):
            <input
              type="number"
              step="0.1"
              name="current_weight"
              value={formData.current_weight}
              onChange={handleChange}
            />
          </label>
          <label>
            Goal:
            <input
              type="text"
              name="goal"
              value={formData.goal}
              onChange={handleChange}
            />
          </label>
          <label>
            Training Experience:
            <input
              type="text"
              name="training_experience"
              value={formData.training_experience}
              onChange={handleChange}
            />
          </label>
          <label>
            Specific Goals:
            <textarea
              name="specific_goals"
              value={formData.specific_goals}
              onChange={handleChange}
            />
          </label>
          <label>
            Obstacles:
            <textarea
              name="obstacles"
              value={formData.obstacles}
              onChange={handleChange}
            />
          </label>
          <label>
            Physique Rating (1-10):
            <input
              type="number"
              min="1"
              max="10"
              name="physique_rating"
              value={formData.physique_rating}
              onChange={handleChange}
            />
          </label>
          <button type="button" onClick={handleSave}>
            Save Changes
          </button>
          <button type="button" onClick={() => setEditMode(false)}>
            Cancel
          </button>
        </form>
      ) : (
        <div className="profile-details">
          <p><strong>Full Name:</strong> {profile.full_name}</p>
          <p><strong>Age:</strong> {profile.age}</p>
          <p><strong>Contact Number:</strong> {profile.contact_number}</p>
          <p><strong>Preferred Contact Method:</strong> {profile.preferred_contact_method}</p>
          <p><strong>Current Weight:</strong> {profile.current_weight} kg</p>
          <p><strong>Goal:</strong> {profile.goal}</p>
          <p><strong>Training Experience:</strong> {profile.training_experience}</p>
          <p><strong>Specific Goals:</strong> {profile.specific_goals}</p>
          <p><strong>Obstacles:</strong> {profile.obstacles}</p>
          <p><strong>Physique Rating:</strong> {profile.physique_rating}/10</p>
          <button onClick={() => setEditMode(true)}>Edit Profile</button>
        </div>
      )}
    </div>
  );
};

export default ProfilePage;