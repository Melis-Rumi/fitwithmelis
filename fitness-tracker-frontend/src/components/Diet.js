import React, { useState, useEffect, useContext } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../AuthContext';
import './Diet.css';
import { UserContext } from './UserContext';

const Diet = () => {
  const { userId } = useContext(UserContext); // Get userId from context
  const { date } = useParams();
  const { token } = useContext(AuthContext);
  const [dietRecords, setDietRecords] = useState([]);
  const [showFoodSearch, setShowFoodSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedFood, setSelectedFood] = useState(null);
  const [gramAmount, setGramAmount] = useState('');
  const [formData, setFormData] = useState({
    total_calories: '',
    protein_intake: '',
    carbs_intake: '',
    fat_intake: '',
  });

  // Fetch saved diet records for the day
  useEffect(() => {
    if (!token) {
      console.error('No token found. User is not authenticated.');
      return;
    }

    const url = userId
  ? `https://fitwithme.onrender.com/api/diet/${date}/?__user_id=${userId}`
  : `https://fitwithme.onrender.com/api/diet/${date}/`;

    axios
      .get(url, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((response) => {
        setDietRecords(response.data);
      })
      .catch((error) => {
        console.error('Error fetching diet records:', error);
      });
  }, [date, token, userId]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Handle food search
  const handleSearchChange = async (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    
    if (query.length >= 2) {
      try {
        const response = await axios.get(`https://fitwithme.onrender.com/api/nutrients/search/?search=${query}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setSearchResults(response.data);
      } catch (error) {
        console.error('Error searching foods:', error);
      }
    } else {
      setSearchResults([]);
    }
  };

  // Handle food selection
  const handleFoodSelect = (food) => {
    setSelectedFood(food);
    setSearchQuery(food.name);
    setSearchResults([]);
    setGramAmount('100'); // Default to 100g
    
    // Calculate nutrients for 100g
    updateNutrientValues(food, 100);
  };

  // Update nutrient values based on grams
  const updateNutrientValues = (food, grams) => {
    const multiplier = grams / 100;
    setFormData({
      total_calories: Math.round(food.calories * multiplier),
      protein_intake: Math.round(food.protein * multiplier * 10) / 10,
      carbs_intake: Math.round(food.carbohydrate * multiplier * 10) / 10,
      fat_intake: Math.round(food.total_fat * multiplier * 10) / 10,
    });
  };

  // Handle gram amount change
  const handleGramChange = (e) => {
    const grams = e.target.value;
    setGramAmount(grams);
    if (selectedFood && grams) {
      updateNutrientValues(selectedFood, parseFloat(grams));
    }
  };

  // Save the current diet record to the database
  const handleSubmit = async () => {
    try {
      if (!token) {
        alert('You must be logged in to save diet data.');
        return;
      }

      if (!formData.total_calories || !formData.protein_intake || !formData.carbs_intake || !formData.fat_intake) {
        alert('Please fill in all fields before saving.');
        return;
      }

      // Save the current diet record to the backend
      await axios.post(
        'https://fitwithme.onrender.com/api/diet/',
        { ...formData, date },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Fetch updated diet records from the backend
      const response = await axios.get(`https://fitwithme.onrender.com/api/diet/${date}/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setDietRecords(response.data);

      // Clear the form after saving
      setFormData({
        total_calories: '',
        protein_intake: '',
        carbs_intake: '',
        fat_intake: '',
      });
      setSelectedFood(null);
      setSearchQuery('');
      setGramAmount('');

      alert('Diet data saved successfully!');
    } catch (error) {
      console.error('Error saving diet data:', error);
    }
  };

  // Delete a diet record
  const handleDelete = async (index) => {
    try {
      if (!token) {
        alert('You must be logged in to delete diet data.');
        return;
      }

      const recordToDelete = dietRecords[index];
      await axios.delete(`https://fitwithme.onrender.com/api/diet/${recordToDelete.id}/`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Remove the deleted record from the state
      setDietRecords(dietRecords.filter((_, i) => i !== index));
      alert('Diet record deleted successfully!');
    } catch (error) {
      console.error('Error deleting diet record:', error);
    }
  };

  return (
    <div className="diet-container">
      <h1>Diet Log for {date}</h1>
      
      {/* Saved Diet Records Table */}
      {dietRecords.length > 0 && (
        <div className="records-table-container">
          <h2>Saved Records</h2>
          <table className="diet-table">
            <thead>
              <tr>
                <th>Total Calories</th>
                <th>Protein Intake (g)</th>
                <th>Carbs Intake (g)</th>
                <th>Fat Intake (g)</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {dietRecords.map((record, index) => (
                <tr key={index}>
                  <td>{record.total_calories}</td>
                  <td>{record.protein_intake}</td>
                  <td>{record.carbs_intake}</td>
                  <td>{record.fat_intake}</td>
                  <td>
                    <button onClick={() => handleDelete(index)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      
      <div className="input-section">
        <button onClick={() => setShowFoodSearch(!showFoodSearch)}>
          {showFoodSearch ? 'Hide Food Search' : 'Find Food'}
        </button>

        {showFoodSearch && (
          <div className="food-search">
            <div className="search-box">
              <input
                type="text"
                placeholder="Search for a food..."
                value={searchQuery}
                onChange={handleSearchChange}
                className="search-input"
              />
              {searchResults.length > 0 && (
                <ul className="search-results">
                  {searchResults.map((food) => (
                    <li
                      key={food.id}
                      onClick={() => handleFoodSelect(food)}
                      className="search-result-item"
                    >
                      {food.name}
                    </li>
                  ))}
                </ul>
              )}
            </div>
            
            {selectedFood && (
              <div className="gram-input">
                <label>Amount (grams):</label>
                <input
                  type="number"
                  value={gramAmount}
                  onChange={handleGramChange}
                  min="0"
                  step="1"
                />
              </div>
            )}
          </div>
        )}

        <div className="form-group">
          <label>Total Calories:</label>
          <input
            type="number"
            name="total_calories"
            value={formData.total_calories}
            onChange={handleChange}
          />
        </div>
        <div className="form-group">
          <label>Protein Intake (g):</label>
          <input
            type="number"
            name="protein_intake"
            value={formData.protein_intake}
            onChange={handleChange}
          />
        </div>
        <div className="form-group">
          <label>Carbs Intake (g):</label>
          <input
            type="number"
            name="carbs_intake"
            value={formData.carbs_intake}
            onChange={handleChange}
          />
        </div>
        <div className="form-group">
          <label>Fat Intake (g):</label>
          <input
            type="number"
            name="fat_intake"
            value={formData.fat_intake}
            onChange={handleChange}
          />
        </div>
        <button onClick={handleSubmit}>Save</button>
      </div>
    </div>
  );
};

export default Diet;