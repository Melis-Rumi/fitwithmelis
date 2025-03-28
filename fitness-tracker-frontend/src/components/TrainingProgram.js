import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../AuthContext';
import './TrainingProgram.css'; // Import the CSS file
import { UserContext } from './UserContext';

const TrainingProgram = () => {
  const { userId } = useContext(UserContext); // Get userId from context
  const navigate = useNavigate();
  const { token } = useContext(AuthContext);
  const [currentProgram, setCurrentProgram] = useState(null);
  const [weeks, setWeeks] = useState([]);
  const [allPrograms, setAllPrograms] = useState([]); // Store all programs
  const [currentProgramIndex, setCurrentProgramIndex] = useState(0); // Track current program index
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  // Fetch a specific program by ID
  const fetchProgram = async (programId) => {
    try {
      const url = userId
        ? `https://fitwithme.onrender.com/api/training-program/${programId}/?__user_id=${userId}`
        : `https://fitwithme.onrender.com/api/training-program/${programId}/`;

      const response = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCurrentProgram(programId);
      setWeeks(response.data.weeks);
    } catch (error) {
      console.error('Error fetching program:', error);
    }
  };

  // Fetch all programs and set the latest one as the current program
  const fetchLatestProgram = async () => {
    try {
      const url = userId
        ? `https://fitwithme.onrender.com/api/training-program/latest/?__user_id=${userId}`
        : `https://fitwithme.onrender.com/api/training-program/latest/`;

      const response = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data && response.data.all_programs) {
        setAllPrograms(response.data.all_programs); // Store all programs
        setCurrentProgram(response.data.latest_program.program_id); // Set the latest program
        setWeeks(response.data.latest_program.weeks); // Set the weeks for the latest program
        setCurrentProgramIndex(0); // Reset index to 0 (latest program)
      }
    } catch (error) {
      console.error('Error fetching latest program:', error);
    }
  };

  // Create a new program
  const createNewProgram = async () => {
    try {
      const url = userId
        ? `https://fitwithme.onrender.com/api/training-program/?__user_id=${userId}`
        : `https://fitwithme.onrender.com/api/training-program/`;

      const response = await axios.post(url, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCurrentProgram(response.data.program_id);
      fetchProgram(response.data.program_id);
      fetchLatestProgram(); // Refresh the list of programs
    } catch (error) {
      console.error('Error creating program:', error);
    }
  };

  // Add a new week to the current program
  const addWeek = async () => {
    try {
      const url = userId
        ? `https://fitwithme.onrender.com/api/training-program/${currentProgram}/add-week/?__user_id=${userId}`
        : `https://fitwithme.onrender.com/api/training-program/${currentProgram}/add-week/`;

      await axios.post(url, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchProgram(currentProgram);
    } catch (error) {
      console.error('Error adding week:', error);
    }
  };

  // Navigate to a specific training day
  const navigateToTrainingDay = (dayId) => {
    navigate(`/training-day/${dayId}`);
  };

  // Handle "Previous" button click
  const handlePrevious = () => {
    if (currentProgramIndex > 0) {
      const newIndex = currentProgramIndex - 1;
      setCurrentProgramIndex(newIndex);
      setCurrentProgram(allPrograms[newIndex].program_id);
      setWeeks(allPrograms[newIndex].weeks);
    }
  };

  // Handle "Next" button click
  const handleNext = () => {
    if (currentProgramIndex < allPrograms.length - 1) {
      const newIndex = currentProgramIndex + 1;
      setCurrentProgramIndex(newIndex);
      setCurrentProgram(allPrograms[newIndex].program_id);
      setWeeks(allPrograms[newIndex].weeks);
    }
  };

  // Fetch the latest program on component mount
  useEffect(() => {
    fetchLatestProgram();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="container">
  {/* Action Buttons */}
  <div className="button-container">
    <button onClick={createNewProgram} className="action-button">
      New Training Program
    </button>
    {currentProgram && (
      <button onClick={addWeek} className="add-week-button">
        ➕ Week
      </button>
    )}
  </div>

  {/* Training Program Table */}
  {weeks.length > 0 ? (
    <table className="program-table">
      <thead>
        <tr>
          <th>Week</th>
          {days.map((day) => (
            <th key={day}>{day}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {weeks.map((week) => (
          <tr key={week.id}>
            <td style={{ fontWeight: "bold" }}>Week {week.week_number}</td>
            {days.map((day) => {
              const dayData = week.days?.[day]; // Use optional chaining to avoid errors
              return (
                <td
                  key={day}
                  className="cursor-pointer hover:bg-gray-50"
                  onClick={() => navigateToTrainingDay(dayData?.id)}
                >
                  {dayData?.description || 'Rest'}
                </td>
              );
            })}
          </tr>
        ))}
      </tbody>
    </table>
  ) : (
    <p className="no-program-message">No training program available. Create a new one!</p>
  )}

  {/* Navigation Buttons */}
  <div className="navigation-buttons">
  <button
      onClick={handleNext}
      disabled={currentProgramIndex === allPrograms.length - 1}
      className="nav-button"
    >
      Previous program
    </button>
    <button
      onClick={handlePrevious}
      disabled={currentProgramIndex === 0}
      className="nav-button"
    >
      Next program
    </button>
    
  </div>
</div>
  );
};

export default TrainingProgram;