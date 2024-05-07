import React, { useState, useEffect } from 'react';
import { Select, MenuItem, FormControl, InputLabel } from '@mui/material';
import axios from 'axios';

const ClientMenu = ({ onSelect }) => {
  const [clients, setClients] = useState([]);
  const [selectedClient, setSelectedClient] = useState('');

  useEffect(() => {
    const fetchClients = async () => {
      try {
        const response = await axios.get('/api/clients');
        setClients(response.data);
      } catch (error) {
        console.error('Error fetching clients:', error);
      }
    };

    fetchClients();
  }, []);

  const handleClientChange = (event) => {
    const clientName = event.target.value;
    setSelectedClient(clientName);
    onSelect(clientName);
  };

  return (
    <FormControl fullWidth>
      <InputLabel id="client-menu-label">Select Client</InputLabel>
      <Select
        labelId="client-menu-label"
        id="client-menu"
        value={selectedClient}
        onChange={handleClientChange}
        label="Select Client"
      >
        {clients.map((client) => (
          <MenuItem key={client.client_id} value={client.client_name}>
            {client.client_name}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};

export default ClientMenu;
