import axios from 'axios';

// Create Axios instance
export const apiClient = axios.create({
  baseURL: 'https://fitwithme.onrender.com',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Function to fetch protected data with impersonation
export const fetchProtectedData = async (userIdToImpersonate) => {
  try {
    const response = await apiClient.get('/api/some-protected-view/', {
      headers: {
        'Impersonate-User': userIdToImpersonate, // Pass the user ID here
      },
    });
    console.log('Response:', response.data);
    return response.data; // Return the data for use in components
  } catch (error) {
    console.error('Error fetching data:', error.response || error);
    throw error; // Rethrow the error for handling in the component
  }
};