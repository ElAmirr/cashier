import React, { useState, useEffect } from 'react';
import { Select, MenuItem, FormControl, InputLabel, Paper } from '@mui/material';
import axios from 'axios';

const ClientMenu = ({ onSelectClient }) => {
  const [clients, setClients] = useState([]);
  const [selectedClientId, setSelectedClientId] = useState(null);

  useEffect(() => {
    const fetchClients = async () => {
      try {
        const response = await axios.get('/api/clients');
        setClients(response.data);
      } catch (error) {
        console.error('Error fetching clients:', error);
        // Handle error gracefully, e.g., display a message to the user
      }
    };

    fetchClients();
  }, [onSelectClient]);

  const handleClientChange = (event) => {
    const clientId = event.target.value;
    setSelectedClientId(clientId);
    onSelectClient(clientId); // Pass selected client ID to the parent component
  };

  return (
    <Paper elevation={3} sx={{ padding: '20px', width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <FormControl fullWidth>
        <InputLabel id="client-menu-label">Select Client</InputLabel>
        <Select
          labelId="client-menu-label"
          id="client-menu"
          value={selectedClientId}
          onChange={handleClientChange}
          label="Select Client"
        >
          {clients.map((client) => (
            <MenuItem key={client.client_id} value={client.client_id}>
              {client.client_name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </Paper>
  );
};

export default ClientMenu;
