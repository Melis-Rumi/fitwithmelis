import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  TimeScale,
} from 'chart.js';
import 'chartjs-adapter-date-fns';
import './Progress.css';
import { AuthContext } from '../AuthContext';
import { UserContext } from './UserContext';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  TimeScale
);

const Progress = () => {
  const { userId } = useContext(UserContext);
  const navigate = useNavigate();
  const { token } = useContext(AuthContext);
  const [expandedSection, setExpandedSection] = useState(null);
  const [timeRange, setTimeRange] = useState('month');
  const [dietData, setDietData] = useState([]);
  const [cardioData, setCardioData] = useState([]);
  const [trainingData, setTrainingData] = useState([]);
  const [metricsData, setMetricsData] = useState([]);
  const [selectedMetric, setSelectedMetric] = useState('weight');
  const [selectedExercise, setSelectedExercise] = useState('');
  const [selectedNutrient, setSelectedNutrient] = useState('total_calories');
  const [view, setView] = useState('graph'); // 'graph' or 'table'

  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }
  }, [token, navigate]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!token) return;

        const headers = {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        };

        const url1 = userId
          ? `https://fitwithme.onrender.com/api/progress/diet/?range=${timeRange}&__user_id=${userId}`
          : `https://fitwithme.onrender.com/api/progress/diet/?range=${timeRange}`;

        const url2 = userId
          ? `https://fitwithme.onrender.com/api/progress/cardio/?range=${timeRange}&__user_id=${userId}`
          : `https://fitwithme.onrender.com/api/progress/cardio/?range=${timeRange}`;

        const url3 = userId
          ? `https://fitwithme.onrender.com/api/progress/training/?range=${timeRange}&__user_id=${userId}`
          : `https://fitwithme.onrender.com/api/progress/training/?range=${timeRange}`;

        const url4 = userId
          ? `https://fitwithme.onrender.com/api/progress/metrics/?range=${timeRange}&__user_id=${userId}`
          : `https://fitwithme.onrender.com/api/progress/metrics/?range=${timeRange}`;

        const dietResponse = await axios.get(url1, { headers });
        setDietData(dietResponse.data || []);

        const cardioResponse = await axios.get(url2, { headers });
        setCardioData(cardioResponse.data || []);

        const trainingResponse = await axios.get(url3, { headers });
        setTrainingData(trainingResponse.data || []);

        const metricsResponse = await axios.get(url4, { headers });
        setMetricsData(metricsResponse.data || []);
      } catch (error) {
        if (error.response?.status === 401) {
          console.error(error);
        } else {
          console.error('Error fetching progress data:', error);
        }
      }
    };

    fetchData();
  }, [timeRange, token, navigate, userId]);

  useEffect(() => {
    if (trainingData.length > 0) {
      const uniqueExercises = [...new Set(
        trainingData
          .filter(record => record.exercise && typeof record.exercise === 'string')
          .map(record => record.exercise.trim().toLowerCase())
      )];
      if (uniqueExercises.length > 0) {
        setSelectedExercise(uniqueExercises[0]);
      }
    }
  }, [trainingData]);

  const toggleSection = (section) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  const sortByDate = (data) => {
    return data.sort((a, b) => new Date(b.date) - new Date(a.date));
  };

  const aggregateDataByDate = (data, key) => {
    const aggregatedData = {};

    data.forEach(record => {
      const date = record.date;
      if (!aggregatedData[date]) {
        aggregatedData[date] = { date };
      }
      Object.keys(record).forEach(field => {
        if (field !== 'date') {
          aggregatedData[date][field] = (aggregatedData[date][field] || 0) + record[field];
        }
      });
    });

    return Object.values(aggregatedData).sort((a, b) => new Date(b.date) - new Date(a.date));
  };

  const renderTable = (data, columns) => {
    if (data.length === 0) {
      return <p>No data available for this time range.</p>;
    }

    return (
      <table className="data-table">
        <thead>
          <tr>
            {columns.map((column) => (
              <th key={column}>{column}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((record, index) => (
            <tr key={index}>
              {columns.map((column) => (
                <td key={column}>{record[column]}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    );
  };

  const getDietChartData = () => {
    const sortedData = sortByDate(dietData);
    return {
      labels: sortedData.map((record) => new Date(record.date)),
      datasets: [
        {
          label: selectedNutrient,
          data: sortedData.map((record) => record[selectedNutrient]),
          borderColor: 'rgba(75, 192, 192, 1)',
          backgroundColor: 'rgba(75, 192, 192, 0.2)',
          fill: true,
        },
      ],
    };
  };

  const getCardioChartData = () => {
    const sortedData = sortByDate(cardioData);
    return {
      labels: sortedData.map((record) => new Date(record.date)),
      datasets: [
        {
          label: 'Total Duration (minutes)',
          data: sortedData.map((record) => record.total_duration || 0),
          borderColor: 'rgba(255, 99, 132, 1)',
          backgroundColor: 'rgba(255, 99, 132, 0.2)',
          fill: true,
        },
      ],
    };
  };

  const getTrainingChartData = () => {
    const filteredData = trainingData.filter(
      (record) => record.exercise.trim().toLowerCase() === selectedExercise
    );
    const sortedData = sortByDate(filteredData);
    return {
      labels: sortedData.map((record) => new Date(record.date)),
      datasets: [
        {
          label: `Weight (${selectedExercise})`,
          data: sortedData.map((record) => record.weight || 0),
          borderColor: 'rgba(54, 162, 235, 1)',
          backgroundColor: 'rgba(54, 162, 235, 0.2)',
          fill: true,
        },
      ],
    };
  };

  const getMetricsChartData = () => {
    const sortedData = sortByDate(metricsData);
    return {
      labels: sortedData.map((record) => new Date(record.date)),
      datasets: [
        {
          label: selectedMetric,
          data: sortedData.map((record) => record[selectedMetric] || 0),
          borderColor: 'rgba(153, 102, 255, 1)',
          backgroundColor: 'rgba(153, 102, 255, 0.2)',
          fill: true,
        },
      ],
    };
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Progress Over Time',
      },
    },
    scales: {
      x: {
        type: 'time',
        time: {
          unit: 'day',
          tooltipFormat: 'MMM d, yyyy',
          displayFormats: {
            day: 'MMM d',
          },
        },
        ticks: {
          maxRotation: 90,
          minRotation: 90,
        },
      },
      y: {
        beginAtZero: true,
      },
    },
  };

  return (
    <div className="progress-container">
      <h1>Progress Tracker</h1>
      <div className="view-selector">
        <label>View:</label>
        <select value={view} onChange={(e) => setView(e.target.value)}>
          <option value="graph">Graph</option>
          <option value="table">Table</option>
        </select>
      </div>
      <div className="time-range-selector">
        <label>Time Range:</label>
        <select value={timeRange} onChange={(e) => setTimeRange(e.target.value)}>
          <option value="month">1 Month</option>
          <option value="3months">3 Months</option>
          <option value="6months">6 Months</option>
          <option value="year">1 Year</option>
        </select>
      </div>
      <button onClick={() => toggleSection('diet')}>Diet</button>
      {expandedSection === 'diet' && (
        <div className="chart-section">
          <label>Select Nutrient:</label>
          <select value={selectedNutrient} onChange={(e) => setSelectedNutrient(e.target.value)}>
            <option value="total_calories">Calories</option>
            <option value="protein_intake">Protein</option>
            <option value="carbs_intake">Carbs</option>
            <option value="fat_intake">Fat</option>
          </select>
          {view === 'graph' ? (
            dietData.length > 0 ? (
              <Line data={getDietChartData()} options={chartOptions} />
            ) : (
              <p>No diet data available for this time range.</p>
            )
          ) : (
            renderTable(aggregateDataByDate(dietData, selectedNutrient), ['date', selectedNutrient])
          )}
        </div>
      )}
      <button onClick={() => toggleSection('cardio')}>Cardio</button>
      {expandedSection === 'cardio' && (
        <div className="chart-section">
          {view === 'graph' ? (
            cardioData.length > 0 ? (
              <Line data={getCardioChartData()} options={chartOptions} />
            ) : (
              <p>No cardio data available for this time range.</p>
            )
          ) : (
            renderTable(aggregateDataByDate(cardioData, 'total_duration'), ['date', 'total_duration'])
          )}
        </div>
      )}
      <button onClick={() => toggleSection('training')}>Training</button>
        {expandedSection === 'training' && (
          <div className="chart-section">
            <label>Select Exercise:</label>
            <select value={selectedExercise} onChange={(e) => setSelectedExercise(e.target.value)}>
              {trainingData.length > 0 ? (
                [...new Set(
                  trainingData
                    .filter(record => record.exercise && typeof record.exercise === 'string')
                    .map(record => record.exercise.trim().toLowerCase())
                )].map((exercise) => (
                  <option key={exercise} value={exercise}>
                    {exercise.charAt(0).toUpperCase() + exercise.slice(1)}
                  </option>
                ))
              ) : (
                <option value="">No exercises available</option>
              )}
            </select>
            {view === 'graph' ? (
              trainingData.filter((record) => record.exercise.trim().toLowerCase() === selectedExercise).length > 0 ? (
                <Line data={getTrainingChartData()} options={chartOptions} />
              ) : (
                <p>No training data available for the selected exercise.</p>
              )
            ) : (
              renderTable(
                sortByDate(trainingData.filter((record) => record.exercise.trim().toLowerCase() === selectedExercise)),
                ['date', 'exercise', 'weight'] // Include all columns you want to display
              )
            )}
          </div>
        )}
      <button onClick={() => toggleSection('metrics')}>Body Metrics</button>
      {expandedSection === 'metrics' && (
        <div className="chart-section">
          <label>Select Metric:</label>
          <select value={selectedMetric} onChange={(e) => setSelectedMetric(e.target.value)}>
            <option value="weight">Weight</option>
            <option value="bmi">BMI</option>
            <option value="chest">Chest</option>
            <option value="waist">Waist</option>
            <option value="glutes">Glutes</option>
            <option value="left_thigh">Left Thigh</option>
            <option value="right_thigh">Right Thigh</option>
          </select>
          {view === 'graph' ? (
            metricsData.length > 0 ? (
              <Line data={getMetricsChartData()} options={chartOptions} />
            ) : (
              <p>No metrics data available for this time range.</p>
            )
          ) : (
            renderTable(aggregateDataByDate(metricsData, selectedMetric), ['date', selectedMetric])
          )}
        </div>
      )}
    </div>
  );
};

export default Progress;