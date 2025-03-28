import React, { useState, useEffect, useContext } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../AuthContext'; // Import the AuthContext
import { UserContext } from './UserContext'; // Import the UserContext
import './Metrics.css';

const Metrics = () => {
  const { userId } = useContext(UserContext); // Get userId from context
  const { date } = useParams();
  const { token } = useContext(AuthContext); // Access the token from context
  const [latestRecord, setLatestRecord] = useState(null); // Stores the latest metrics record
  const [formData, setFormData] = useState({
    weight: '',
    bmi: '',
    chest: '',
    waist: '',
    glutes: '',
    left_thigh: '',
    right_thigh: '',
  });

  // Fetch the latest metrics record for the day
  useEffect(() => {
    if (!token) {
      console.error('No token found. User is not authenticated.');
      return;
    }

    const url = userId
      ? `https://fitwithme.onrender.com/api/metrics/${date}/?__user_id=${userId}`
      : `https://fitwithme.onrender.com/api/metrics/${date}/`;

    axios
      .get(url, {
        headers: { Authorization: `Bearer ${token}` }, // Include the token in the headers
      })
      .then((response) => {
        if (response.data.length > 0) {
          const latest = response.data[response.data.length - 1]; // Get the latest record
          setLatestRecord(latest);
          setFormData({
            weight: latest.weight,
            bmi: latest.bmi,
            chest: latest.chest,
            waist: latest.waist,
            glutes: latest.glutes,
            left_thigh: latest.left_thigh,
            right_thigh: latest.right_thigh,
          });
        }
      })
      .catch((error) => {
        console.error('Error fetching metrics records:', error);
      });
  }, [date, token, userId]);

  // Handle form input changes
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Save the current metrics record to the database
  const handleSubmit = async () => {
    try {
      if (!token) {
        alert('You must be logged in to save metrics data.');
        return;
      }
      if (
        !formData.weight ||
        !formData.bmi ||
        !formData.chest ||
        !formData.waist ||
        !formData.glutes ||
        !formData.left_thigh ||
        !formData.right_thigh
      ) {
        alert('Please fill in all fields before saving.');
        return;
      }

      // Save the current metrics record to the backend
      const url1 = userId
        ? `https://fitwithme.onrender.com/api/metrics/?__user_id=${userId}`
        : `https://fitwithme.onrender.com/api/metrics/`;
      await axios.post(
        url1,
        { ...formData, date },
        { headers: { Authorization: `Bearer ${token}` } } // Include the token in the headers
      );

      // Fetch the latest metrics record from the backend
      const url2 = userId
        ? `https://fitwithme.onrender.com/api/metrics/${date}/?__user_id=${userId}`
        : `https://fitwithme.onrender.com/api/metrics/${date}/`;
      const response = await axios.get(url2, {
        headers: { Authorization: `Bearer ${token}` }, // Include the token in the headers
      });

      if (response.data.length > 0) {
        const latest = response.data[response.data.length - 1]; // Get the latest record
        setLatestRecord(latest);
        setFormData({
          weight: latest.weight,
          bmi: latest.bmi,
          chest: latest.chest,
          waist: latest.waist,
          glutes: latest.glutes,
          left_thigh: latest.left_thigh,
          right_thigh: latest.right_thigh,
        });
      }

      alert('Metrics data saved successfully!');
    } catch (error) {
      console.error('Error saving metrics data:', error);
    }
  };

  return (
    <div className="metrics-container">
      <h1>Body Metrics for {date}</h1>

      {/* Metrics Form */}
      <div className="metrics">
        <div className="form-group">
          <label>
            Weight (kg):
            <input type="number" name="weight" value={formData.weight} onChange={handleChange} />
          </label>
        </div>
        <div className="form-group">
          <label>
            BMI:
            <input type="number" name="bmi" value={formData.bmi} onChange={handleChange} />
          </label>
        </div>
        <div className="form-group">
          <label>
            Chest (cm):
            <input type="number" name="chest" value={formData.chest} onChange={handleChange} />
          </label>
        </div>
        <div className="form-group">
          <label>
            Waist (cm):
            <input type="number" name="waist" value={formData.waist} onChange={handleChange} />
          </label>
        </div>
        <div className="form-group">
          <label>
            Glutes (cm):
            <input type="number" name="glutes" value={formData.glutes} onChange={handleChange} />
          </label>
        </div>
        <div className="form-group">
          <label>
            Left Thigh (cm):
            <input type="number" name="left_thigh" value={formData.left_thigh} onChange={handleChange} />
          </label>
        </div>
        <div className="form-group">
          <label>
            Right Thigh (cm):
            <input type="number" name="right_thigh" value={formData.right_thigh} onChange={handleChange} />
          </label>
        </div>

        <button onClick={handleSubmit} className="save-metrics">
          Save
        </button>
      </div>
    </div>
  );
};

export default Metrics;