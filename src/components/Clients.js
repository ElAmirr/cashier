import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { DataGrid } from '@mui/x-data-grid';
import { Box, Button } from '@mui/material';
import AddClientPopup from './AddClientPopup';
import ClientMenu from './ClientMenu';
import ClientOrdersPopup from './ClientOrdersPopup';

const Clients = () => {
  const [clients, setClients] = useState([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [newClient, setNewClient] = useState({ client_name: '', client_number: '' });
  const [selectedClient, setSelectedClient] = useState(null);
  const [clientOrders, setClientOrders] = useState([]);
  const [showOrdersPopup, setShowOrdersPopup] = useState(false);

  const token = localStorage.getItem('token'); // Retrieve token from localStorage
  const tenantId = localStorage.getItem('tenant_id'); // Retrieve tenant_id from localStorage

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    if (!token || !tenantId) {
      alert('Unauthorized access. Please log in again.');
      window.location.href = '/login';
      return;
    }

    try {
      const response = await axios.get(`/api/clients?tenant_id=${tenantId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setClients(response.data);
      setLoading(false);
    } catch (error) {
      if (error.response && error.response.status === 401) {
        alert('Session expired. Please log in again.');
        window.location.href = '/login';
      } else {
        console.error('Error fetching clients:', error);
        alert('An error occurred while fetching clients.');
      }
    }
  };

  const handlePayCredit = (client) => {
    setSelectedClient(client);
    fetchClientOrders(client.client_id);
  };

  const fetchClientOrders = async (clientId) => {
    try {
      const response = await axios.get(`/api/orders/client/${clientId}?tenant_id=${tenantId}&payment=false`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setClientOrders(response.data);
      setShowOrdersPopup(true);
    } catch (error) {
      console.error('Error fetching client orders:', error);
      alert('An error occurred while fetching client orders.');
    }
  };

  const handleDelete = async (clientId) => {
    try {
      await axios.delete(`/api/clients/${clientId}?tenant_id=${tenantId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      fetchData();
    } catch (error) {
      console.error('Error deleting client:', error);
      alert('An error occurred while deleting the client.');
    }
  };

  const handleNewClientSave = async () => {
    if (!newClient.client_name || !newClient.client_number) {
      alert('Client Name and Client Number are required.');
      return;
    }

    try {
      const response = await axios.post(
        '/api/clients',
        { ...newClient, tenant_id: tenantId },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status === 201) {
        fetchData(); // Fetch the updated clients list after adding the new client
        setOpen(false); // Close the popup
        setNewClient({ client_name: '', client_number: '' }); // Reset the form
      } else {
        console.error('Unexpected response status:', response.status);
        alert('An unexpected error occurred while adding the new client.');
      }
    } catch (error) {
      // Check for response errors
      if (error.response) {
        console.error('Error response:', error.response.data);
        alert(`Error: ${error.response.data.message || 'An error occurred while adding the new client.'}`);
      } else if (error.request) {
        console.error('Error request:', error.request);
        alert('Network error. Please try again later.');
      } else {
        console.error('Error message:', error.message);
        alert('An error occurred. Please try again.');
      }
    }
  };

  const columns = [
    { field: 'client_id', headerName: 'ID', width: 50 },
    { field: 'client_name', headerName: 'Client Name', width: 200 },
    { field: 'balance', headerName: 'Balance', type: 'number', width: 150 },
    { field: 'client_number', headerName: 'Client Number', type: 'number', width: 200 },
    {
      field: 'pay_credit',
      headerName: 'Pay Credit',
      width: 120,
      renderCell: (params) => (
        <Button variant="contained" color="success" onClick={() => handlePayCredit(params.row)}>
          Pay Credit
        </Button>
      ),
    },
    {
      field: 'delete',
      headerName: 'Delete',
      width: 100,
      renderCell: (params) => (
        <Button variant="contained" color="error" onClick={() => handleDelete(params.row.client_id)}>
          Delete
        </Button>
      ),
    },
  ];

  return (
    <div>
      <Box mt={4} sx={{ width: '100vw', display: 'flex', justifyContent: 'space-around' }}>
        <Box sx={{ width: '30%', display: 'flex', flexDirection: 'column' }}>
          <ClientMenu />
          <Button
            variant="contained"
            color="primary"
            onClick={() => setOpen(true)}
            sx={{ padding: '20px', width: '100%', marginTop: '20px' }}
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
            getRowId={(row) => row.client_id} // Specify the custom `id` field here
          />
        </Box>
      </Box>
      <AddClientPopup open={open} handleClose={() => setOpen(false)} handleSave={handleNewClientSave} newClient={newClient} setNewClient={setNewClient} />
      {showOrdersPopup && <ClientOrdersPopup open={showOrdersPopup} handleClose={() => setShowOrdersPopup(false)} client={selectedClient} orders={clientOrders} />}
    </div>
  );
};

export default Clients;
