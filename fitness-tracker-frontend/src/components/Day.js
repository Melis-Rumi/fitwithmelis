import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './Day.css';

const Day = () => {
  const { date } = useParams(); // Get the date from the URL
  const navigate = useNavigate();

  return (
    <div className="day-container">
      <h1>Daily Log for {date}</h1>
      <div className="button-group">
        <button onClick={() => navigate(`/diet/${date}`)}>Diet</button>
        <button onClick={() => navigate(`/cardio/${date}`)}>Cardio</button>
        <button onClick={() => navigate(`/training/${date}`)}>Training</button>
        <button onClick={() => navigate(`/metrics/${date}`)}>Body Metrics</button>
      </div>
    </div>
  );
};

export default Day;