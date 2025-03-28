import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import { UserContext } from './UserContext'; // Import UserContext

const ClientList = () => {
  const [clients, setClients] = useState([]);
  const { setUserId, username } = useContext(UserContext); // Get userId, setUserId, and username from UserContext
  const navigate = useNavigate(); // For redirecting unauthorized users

  useEffect(() => {
    // Hardcoded username check
    if (username !== 'rumi') { // Replace 'admin' with the hardcoded username
      navigate('/not-authorized'); // Redirect unauthorized users
    } else {
      fetchClients(); // Fetch clients if the user is authorized
    }
  }, [username, navigate]);

  const fetchClients = () => {
    // Fetch client data from the API
    setUserId(null); // Clear userId
    axios.get('https://fitwithme.onrender.com/clients/?format=json')
      .then(response => {
        console.log('Fetched clients:', response.data); // Debugging line
        setClients(response.data);
      })
      .catch(error => console.error(error));
  };

  if (username !== 'rumi') {
    return null; // Don't render anything if the user is not authorized
  }

  return (
    <div>
      <h1>Clients</h1>
      <ul>
        {clients.map(client => (
          <li key={client.id}>
            {/* Link to the client's progress page */}
            <Link
              to={`/home`}
              onClick={() => setUserId(client.user)} // Set the user ID on click
            >
              {client.full_name}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ClientList;