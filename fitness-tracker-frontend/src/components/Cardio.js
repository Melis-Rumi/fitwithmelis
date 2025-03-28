import React, { useState, useEffect, useContext } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../AuthContext'; // Import the AuthContext
import './Cardio.css';
import { UserContext } from './UserContext';

const Cardio = () => {
  const { userId } = useContext(UserContext); // Get userId from context
  const { date } = useParams();
  const { token } = useContext(AuthContext); // Access the token from context
  const [cardioRecords, setCardioRecords] = useState([]); // Stores saved cardio records
  const [formData, setFormData] = useState({
    exercise: '',
    sets: '',
    duration_minutes: '',
  });

  // Fetch saved cardio records for the day
  useEffect(() => {
    if (!token) {
      console.error('No token found. User is not authenticated.');
      return;
    }
    const url = userId
  ? `https://fitwithme.onrender.com/api/cardio/${date}/?__user_id=${userId}`
  : `https://fitwithme.onrender.com/api/cardio/${date}/`;
    axios
      .get(url, {
        headers: { Authorization: `Bearer ${token}` }, // Include the token in the headers
      })
      .then((response) => {
        setCardioRecords(response.data);
      })
      .catch((error) => {
        console.error('Error fetching cardio records:', error);
      });
  }, [date, token, userId]);

  // Handle form input changes
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Save the current cardio record to the database
  const handleSubmit = async () => {
    try {
      if (!token) {
        alert('You must be logged in to save cardio data.');
        return;
      }
      if (!formData.exercise || !formData.sets || !formData.duration_minutes) {
        alert('Please fill in all fields before saving.');
        return;
      }
      // Save the current cardio record to the backend
      const url1 = userId
      ? `https://fitwithme.onrender.com/api/cardio/?__user_id=${userId}`
      : `https://fitwithme.onrender.com/api/cardio/`;
      await axios.post(
        url1,
        { ...formData, date },
        { headers: { Authorization: `Bearer ${token}` } } // Include the token in the headers
      );
      // Fetch updated cardio records from the backend
      const url3 = userId
      ? `https://fitwithme.onrender.com/api/cardio/${date}/?__user_id=${userId}`
      : `https://fitwithme.onrender.com/api/cardio/${date}/`;
      const response = await axios.get(url3, {
        headers: { Authorization: `Bearer ${token}` }, // Include the token in the headers
      });
      setCardioRecords(response.data);
      // Clear the form after saving
      setFormData({ exercise: '', sets: '', duration_minutes: '' });
      alert('Cardio data saved successfully!');
    } catch (error) {
      console.error('Error saving cardio data:', error);
    }
  };

  // Delete a cardio record
  const handleDelete = async (index) => {
    try {
      if (!token) {
        alert('You must be logged in to delete cardio data.');
        return;
      }
      const recordToDelete = cardioRecords[index];
      const url4 = userId
      ? `https://fitwithme.onrender.com/api/cardio/${recordToDelete.id}/?__user_id=${userId}`
      : `https://fitwithme.onrender.com/api/cardio/${recordToDelete.id}/`;
      await axios.delete(url4, {
        headers: { Authorization: `Bearer ${token}` }, // Include the token in the headers
      });
      // Remove the deleted record from the state
      setCardioRecords(cardioRecords.filter((_, i) => i !== index));
      alert('Cardio record deleted successfully!');
    } catch (error) {
      console.error('Error deleting cardio record:', error);
    }
  };

  return (
    <div className="cardio-container">
      <h1>Cardio Log for {date}</h1>
      {/* Saved Cardio Records Table */}
      <table className="cardio-table">
        <thead>
          <tr>
            <th>Exercise</th>
            <th>Sets</th>
            <th>Duration (minutes)</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {cardioRecords.map((record, index) => (
            <tr key={index}>
              <td>{record.exercise}</td>
              <td>{record.sets}</td>
              <td>{record.duration_minutes}</td>
              <td>
                <button onClick={() => handleDelete(index)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {/* Cardio Form */}
      <div className="form-group">
        <label>Exercise:</label>
        <select name="exercise" value={formData.exercise} onChange={handleChange}>
          <option value="">Select an exercise</option>
          <option value="Walking">Walking (fast or incline)</option>
          <option value="Jogging">Jogging</option>
          <option value="Running">Running</option>
          <option value="Cycling">Cycling</option>
          <option value="Cros">Cross-trainer</option>
          <option value="Swimming">Swimming</option>
          <option value="Other">Other</option>
        </select>
      </div>
      <div className="form-group">
        <label>Sets:</label>
        <input
          type="number"
          name="sets"
          value={formData.sets}
          onChange={handleChange}
        />
      </div>
      <div className="form-group">
        <label>Duration (minutes):</label>
        <input
          type="number"
          name="duration_minutes"
          value={formData.duration_minutes}
          onChange={handleChange}
        />
      </div>
      {/* Save Button */}
      <button onClick={handleSubmit}>Save</button>
    </div>
  );
};

export default Cardio;