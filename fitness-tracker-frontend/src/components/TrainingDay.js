import React, { useState, useEffect, useContext } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../AuthContext';
import { UserContext } from './UserContext';
import './TrainingDay.css'; // Import the CSS file

const TrainingDay = () => {
  const { userId } = useContext(UserContext); // Get userId from context
  const { dayId } = useParams();
  const { token } = useContext(AuthContext);
  const [exercises, setExercises] = useState([]);
  const [newExercise, setNewExercise] = useState({
    exercise_name: '',
    sets: '',
    reps: '',
    description: '' // Add description field
  });
  const [description, setDescription] = useState('');

  // Fetch exercises and description
  const fetchExercises = async () => {
    try {
      const url = userId
        ? `https://fitwithme.onrender.com/api/training-day/${dayId}/?__user_id=${userId}`
        : `https://fitwithme.onrender.com/api/training-day/${dayId}/`;
      const response = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setDescription(response.data.description || ''); // Set the day description
      setExercises(response.data.exercises); // Set the exercises
    } catch (error) {
      console.error('Error fetching exercises:', error);
    }
  };

  useEffect(() => {
    fetchExercises();
  }, [dayId, token, userId]);

  // Handle adding a new exercise
  const handleAddExercise = async (e) => {
    e.preventDefault();
    try {
      const url1 = userId
        ? `https://fitwithme.onrender.com/api/training-day/${dayId}/?__user_id=${userId}`
        : `https://fitwithme.onrender.com/api/training-day/${dayId}/`;
      await axios.post(url1, newExercise, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNewExercise({
        exercise_name: '',
        sets: '',
        reps: '',
        description: '' // Reset description field
      });
      fetchExercises();
    } catch (error) {
      console.error('Error adding exercise:', error);
    }
  };

  // Handle deleting an exercise
  const handleDeleteExercise = async (exerciseId) => {
    try {
      const url2 = userId
        ? `https://fitwithme.onrender.com/api/exercise/${exerciseId}/?__user_id=${userId}`
        : `https://fitwithme.onrender.com/api/exercise/${exerciseId}/`;
      await axios.delete(url2, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchExercises();
    } catch (error) {
      console.error('Error deleting exercise:', error);
    }
  };

  // Handle saving the description
  const handleSaveDescription = async () => {
    try {
      const url3 = userId
        ? `https://fitwithme.onrender.com/api/training-day/${dayId}/?__user_id=${userId}`
        : `https://fitwithme.onrender.com/api/training-day/${dayId}/`;
      await axios.put(url3, { description }, { headers: { Authorization: `Bearer ${token}` } });
      alert('Description saved successfully!');
    } catch (error) {
      console.error('Error saving description:', error);
    }
  };

  return (
    <div className="container">
      {/* Training Day Description */}
      <div className="description-container">
        <input
          type="text"
          className="description-input"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="What day?"
        />
        <button onClick={handleSaveDescription} className="save-button">
          Save
        </button>
      </div>

      {/* Training Day Exercises */}
      <div>
        <h2 className="text-2xl font-bold mb-4">Training Day {dayId}</h2>
        <table className="exercises-table">
          <thead>
            <tr>
              <th>Exercise</th>
              <th>Sets</th>
              <th>Reps</th>
              <th>Description</th> {/* Add Description column */}
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {exercises.map((exercise) => (
              <tr key={exercise.id}>
                <td>{exercise.exercise_name}</td>
                <td>{exercise.sets}</td>
                <td>{exercise.reps}</td>
                <td>{exercise.description}</td> {/* Display description */}
                <td>
                  <button
                    onClick={() => handleDeleteExercise(exercise.id)}
                    className="delete-button"
                  >
                    ❌
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add New Exercise Form */}
      <div className="add-exercise-form">
        <h3 className="text-xl font-bold mb-4">Add New Exercise</h3>
        <form onSubmit={handleAddExercise} className="space-y-4">
          <div>
            <label>Exercise Name</label>
            <input
              type="text"
              value={newExercise.exercise_name}
              onChange={(e) => setNewExercise({ ...newExercise, exercise_name: e.target.value })}
              required
            />
          </div>
          <div>
            <label>Sets</label>
            <input
              type="number"
              value={newExercise.sets}
              onChange={(e) => setNewExercise({ ...newExercise, sets: e.target.value })}
              required
            />
          </div>
          <div>
            <label>Reps</label>
            <input
              type="text"
              value={newExercise.reps}
              onChange={(e) => setNewExercise({ ...newExercise, reps: e.target.value })}
              placeholder="e.g., '8-12' or '10'"
              required
            />
          </div>
          <div>
            <label>Description</label> {/* Add Description input */}
            <input
              type="text"
              value={newExercise.description}
              onChange={(e) => setNewExercise({ ...newExercise, description: e.target.value })}
              placeholder="Optional description (max 100 characters)"
              maxLength={100}
            />
          </div>
          <button type="submit">Add Exercise</button>
        </form>
      </div>
    </div>
  );
};

export default TrainingDay;