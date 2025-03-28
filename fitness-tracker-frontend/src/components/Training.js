import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../AuthContext'; // Import the AuthContext
import { UserContext } from './UserContext';
import './Training.css';


const Training = () => {
  const { userId } = useContext(UserContext); // Get userId from context
  const { date } = useParams();
  const { token } = useContext(AuthContext); // Access the token from context
  const [muscleGroups, setMuscleGroups] = useState([]);
  const [selectedMuscleGroup, setSelectedMuscleGroup] = useState('');
  const [exercises, setExercises] = useState([]); // Stores saved exercises as table rows
  const [newExercise, setNewExercise] = useState({ muscle: '', exercise: '', sets: '', reps: '', weight: '' });
  const navigate = useNavigate();

  // Redirect to login if no token is found
  useEffect(() => {
    if (!token) {
      console.log('No token found. Redirecting to login...');
      navigate('/login', { replace: true }); // Use `replace: true` to prevent back navigation
    }
  }, [token, navigate]);

  // Fetch muscle groups and their exercises
  useEffect(() => {
    if (!token) {
      console.error('No token found. User is not authenticated.');
      return;
    }

    axios
      .get('https://fitwithme.onrender.com/api/muscle-groups/', {
        headers: { Authorization: `Bearer ${token}` }, // Include the token in the headers
      })
      .then((response) => {
        setMuscleGroups(response.data);
      })
      .catch((error) => {
        console.error('Error fetching muscle groups:', error);
      });
  }, [token]);

  // Fetch saved exercises for the day
  useEffect(() => {
    if (!token) {
      console.error('No token found. User is not authenticated.');
      return;
    }
    const url = userId
      ? `https://fitwithme.onrender.com/api/training/${date}/?__user_id=${userId}`
      : `https://fitwithme.onrender.com/api/training/${date}/`;
    axios
      .get(url, {
        headers: { Authorization: `Bearer ${token}` }, // Include the token in the headers
      })
      .then((response) => {
        setExercises(response.data);
      })
      .catch((error) => {
        console.error('Error fetching saved exercises:', error);
      });
  }, [date, token, userId]);

  // Handle muscle group selection
  const handleMuscleGroupChange = (e) => {
    const muscleGroupId = e.target.value;
    const selectedMuscle = muscleGroups.find((group) => group.id === parseInt(muscleGroupId));
    setSelectedMuscleGroup(muscleGroupId);
    setNewExercise({ ...newExercise, muscle: selectedMuscle?.name || '' }); // Set the muscle name
  };

  // Handle form input changes
  const handleChange = (field, value) => {
    setNewExercise({ ...newExercise, [field]: value });
  };

  // Save the current exercise to the database
  const handleSubmit = async () => {
    try {
      if (!token) {
        alert('You must be logged in to save training data.');
        return;
      }

      if (!newExercise.muscle || !newExercise.exercise || !newExercise.sets || !newExercise.reps || !newExercise.weight) {
        alert('Please fill in all fields before saving.');
        return;
      }

      // Save the current exercise to the backend
      const url1 = userId
      ? `https://fitwithme.onrender.com/api/training/?__user_id=${userId}`
      : `https://fitwithme.onrender.com/api/training/`;
      await axios.post(
        url1,
        { ...newExercise, date }, // Include the muscle field in the payload
        { headers: { Authorization: `Bearer ${token}` } } // Include the token in the headers
      );
      const url2 = userId
      ? `https://fitwithme.onrender.com/api/training/${date}/?__user_id=${userId}`
      : `https://fitwithme.onrender.com/api/training/${date}/`;
      // Fetch updated exercises from the backend
      const response = await axios.get(url2, {
        headers: { Authorization: `Bearer ${token}` }, // Include the token in the headers
      });
      setExercises(response.data);

      // Clear the form after saving
      setNewExercise({ muscle: '', exercise: '', sets: '', reps: '', weight: '' });
      alert('Training data saved successfully!');
    } catch (error) {
      console.error('Error saving training data:', error);
    }
  };

  // Delete a training record
  const handleDelete = async (index) => {
    try {
      if (!token) {
        alert('You must be logged in to delete training data.');
        return;
      }
      
      const recordToDelete = exercises[index];
      const url3 = userId
      ? `https://fitwithme.onrender.com/api/training/${recordToDelete.id}/?__user_id=${userId}`
      : `https://fitwithme.onrender.com/api/training/${recordToDelete.id}/`;
      await axios.delete(url3, {
        headers: { Authorization: `Bearer ${token}` }, // Include the token in the headers
      });

      // Remove the deleted record from the state
      setExercises(exercises.filter((_, i) => i !== index));
      alert('Training record deleted successfully!');
    } catch (error) {
      console.error('Error deleting training record:', error);
    }
  };

  // Get exercises for the selected muscle group
  const filteredExercises =
    muscleGroups.find((group) => group.id === parseInt(selectedMuscleGroup))?.exercises || [];

  return (
    <div className="training-container">
      <h1>Training Log for {date}</h1>
      {/* Saved Exercises Table */}
      <table className="exercise-table">
        <thead>
          <tr>
            <th>Exercise</th>
            <th>Sets</th>
            <th>Reps</th>
            <th>Weight (kg)</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {exercises.map((exercise, index) => (
            <tr key={index}>
              <td>{exercise.exercise}</td>
              <td>{exercise.sets}</td>
              <td>{exercise.reps}</td>
              <td>{exercise.weight}</td>
              <td>
                <button onClick={() => handleDelete(index)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {/* Muscle Group Selection */}
      <div className="form-group">
        <label>Muscle Group:</label>
        <select value={selectedMuscleGroup} onChange={handleMuscleGroupChange}>
          <option value="">Select a muscle group</option>
          {muscleGroups.map((group) => (
            <option key={group.id} value={group.id}>
              {group.name}
            </option>
          ))}
        </select>
      </div>
      {/* Exercise Form */}
      <div className="form-group">
        <label>Exercise:</label>
        <select
          value={newExercise.exercise}
          onChange={(e) => handleChange('exercise', e.target.value)}
        >
          <option value="">Select an exercise</option>
          {filteredExercises.map((exercise) => (
            <option key={exercise.id} value={exercise.name}>
              {exercise.name}
            </option>
          ))}
        </select>
      </div>
      <div className="form-group">
        <label>Sets:</label>
        <input
          type="number"
          value={newExercise.sets}
          onChange={(e) => handleChange('sets', e.target.value)}
        />
      </div>
      <div className="form-group">
        <label>Reps:</label>
        <input
          type="number"
          value={newExercise.reps}
          onChange={(e) => handleChange('reps', e.target.value)}
        />
      </div>
      <div className="form-group">
        <label>Weight (kg):</label>
        <input
          type="number"
          value={newExercise.weight}
          onChange={(e) => handleChange('weight', e.target.value)}
        />
      </div>
      {/* Save Button */}
      <button onClick={handleSubmit}>Save</button>
    </div>
  );
};

export default Training;