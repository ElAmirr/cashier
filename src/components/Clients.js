import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { DataGrid } from '@mui/x-data-grid';
import { Box, Button } from '@mui/material';
import AddClientPopup from './AddClientPopup'; // Import the AddClientPopup component
import ClientMenu from './ClientMenu';

const Clients = () => {
  const [clients, setClients] = useState([]);
  const [originalClients, setOriginalClients] = useState([]);
  const [selectedClient, setSelectedClient] = useState(null);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [newClient, setNewClient] = useState({}); // State variable to store new client data

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const response = await axios.get('/api/clients');
      setClients(response.data);
      setOriginalClients(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error:', error);
      alert('An error occurred while fetching clients.');
    }
  };

  const handleEdit = (client) => {
    setSelectedClient(client);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleSave = async () => {
    try {
      await axios.put(`/api/clients/${selectedClient.client_id}`, selectedClient);
      console.log('Client updated successfully');
      setOpen(false);
      fetchData();
    } catch (error) {
      console.error('Error updating client:', error);
      alert('An error occurred while updating the client.');
    }
  };

  const handleDelete = async (clientId) => {
    try {
      await axios.delete(`/api/clients/${clientId}`);
      console.log('Client deleted successfully');
      fetchData();
    } catch (error) {
      console.error('Error deleting client:', error);
      alert('An error occurred while deleting the client.');
    }
  };

  const handleAddClient = () => {
    setOpen(true); // Open the popup dialog for adding a new client
  };

  const handleNewClientSave = async () => {
    try {
      await axios.post('/api/clients', newClient); // Send a POST request to save the new client data
      console.log('New client added successfully');
      setOpen(false); // Close the popup dialog
      fetchData(); // Refresh the client list
      setNewClient({}); // Reset the new client data
    } catch (error) {
      console.error('Error adding new client:', error);
      alert('An error occurred while adding the new client.');
    }
  };

  const columns = [
    { field: 'client_id', headerName: 'ID', width: 50 },
    { field: 'client_name', headerName: 'Client Name', width: 200 },
    { field: 'balance', headerName: 'Balance', type: 'number', width: 150 },
    {
      field: 'edit',
      headerName: 'Edit',
      width: 100,
      sortable: false,
      renderCell: (params) => (
        <Button
          variant="contained"
          color="secondary"
          onClick={() => handleEdit(params.row)}
        >
          Edit
        </Button>
      ),
    },
    {
      field: 'delete',
      headerName: 'Delete',
      width: 100,
      sortable: false,
      renderCell: (params) => (
        <Button
          variant="contained"
          color="error"
          onClick={() => handleDelete(params.row.client_id)}
        >
          Delete
        </Button>
      ),
    },
  ];

  return (
    <div>
      <Box mt={4} sx={{
        width: '100vw',
        display: 'flex',
        justifyContent: 'space-around'
      }}>
        <Box sx={{
            width: '30%',
            display: 'flex',
            flexDirection: 'column',
        }}>
            <ClientMenu />
            <Button
              variant="contained"
              color="primary"
              onClick={handleAddClient}
              sx={{ padding: '20px', width: '20%' }}
            >
              Add New Client
            </Button>
        </Box>
        <Box style={{ height: 560, minWidth: '60%' }}>
          <DataGrid
            rows={clients}
            columns={columns}
            pageSize={5}
            rowsPerPageOptions={[5, 10]}
            loading={loading}
          />
        </Box>
      </Box>
      {/* Render the AddClientPopup component */}
      <AddClientPopup
        open={open}
        handleClose={handleClose}
        handleSave={handleNewClientSave}
        selectedProduct={newClient} // Pass the new client data to the popup
        setSelectedProduct={setNewClient}
      />
    </div>
  );
};

export default Clients;
