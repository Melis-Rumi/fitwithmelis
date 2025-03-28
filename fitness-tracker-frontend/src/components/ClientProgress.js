import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';

const ClientProgress = () => {
  const { id } = useParams();
  const [progress, setProgress] = useState([]);

  useEffect(() => {
    axios.get(`https://fitwithme.onrender.com/api/progress/?client=${id}`)
      .then(response => setProgress(response.data))
      .catch(error => console.error(error));
  }, [id]);

  return (
    <div>
      <h1>Client Progress</h1>
      <ul>
        {progress.map(entry => (
          <li key={entry.id}>
            <p>Date: {entry.date}</p>
            <p>Weight: {entry.weight}</p>
            <p>Waist Size: {entry.waist_size}</p>
            {/* Add more metrics as needed */}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ClientProgress;