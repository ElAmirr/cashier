import React, { useState, useEffect } from 'react';
import { Select, MenuItem, FormControl, InputLabel, Paper } from '@mui/material';
import axios from 'axios';

const ClientMenu = ({ onSelectClient }) => {
  const [clients, setClients] = useState([]);
  const [selectedClientId, setSelectedClientId] = useState(null);

  useEffect(() => {
    const fetchClients = async () => {
      const token = localStorage.getItem('token'); // Retrieve token from localStorage

      if (!token) {
        alert('Unauthorized access. Please log in again.');
        window.location.href = '/login'; // Redirect to login if no token is found
        return;
      }

      try {
        const response = await axios.get('/api/clients', {
          headers: {
            Authorization: `Bearer ${token}`, // Add token to headers
          },
        });
        setClients(response.data); // Set the fetched clients
      } catch (error) {
        console.error('Error fetching clients:', error);
        alert('An error occurred while fetching clients. Please try again.');
      }
    };

    fetchClients(); // Call the fetchClients function
  }, []);

  const handleClientChange = (event) => {
    const clientId = event.target.value;
    setSelectedClientId(clientId);
    onSelectClient(clientId); // Pass the selected client ID to the parent component
  };

  return (
    <Paper elevation={3} sx={{ padding: '20px', width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <FormControl fullWidth>
        <InputLabel id="client-menu-label">Select Client</InputLabel>
        <Select
          labelId="client-menu-label"
          id="client-menu"
          value={selectedClientId || ''} // Default to an empty string when no client is selected
          onChange={handleClientChange}
          label="Select Client"
        >
          {clients.length > 0 ? (
            clients.map((client) => (
              <MenuItem key={client.client_id} value={client.client_id}>
                {client.client_name}
              </MenuItem>
            ))
          ) : (
            <MenuItem value="">No clients available</MenuItem> // Show a message when no clients are available
          )}
        </Select>
      </FormControl>
    </Paper>
  );
};

export default ClientMenu;
