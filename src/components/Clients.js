import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { DataGrid } from '@mui/x-data-grid';
import { Box, Button } from '@mui/material';
import AddClientPopup from './AddClientPopup';
import ClientMenu from './ClientMenu';
import ClientOrdersPopup from './ClientOrdersPopup'; // Import the new component


const Clients = () => {
  const [clients, setClients] = useState([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [newClient, setNewClient] = useState({ client_name: '', client_number: '' });
  const [selectedClient, setSelectedClient] = useState(null); // State variable to store selected client
  const [clientOrders, setClientOrders] = useState([]); // State variable to store client orders
  const [showOrdersPopup, setShowOrdersPopup] = useState(false); // State variable to control the visibility of orders popup

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const response = await axios.get('/api/clients');
      const clientsWithId = response.data.map((client, index) => ({
        ...client,
        id: index + 1 // Assuming index starts from 0
      }));
      setClients(clientsWithId);
      setLoading(false);
    } catch (error) {
      console.error('Error:', error);
      alert('An error occurred while fetching clients.');
    }
  };
  

  const handlePayCredit = (client) => {
    // Set selected client and fetch orders related to this client
    setSelectedClient(client);
    fetchClientOrders(client.client_id);
  };

  const fetchClientOrders = async (clientId) => {
    try {
      const response = await axios.get(`/api/orders/client/${clientId}?payment=false`); // Assuming endpoint to fetch client orders by client ID and payment status
      setClientOrders(response.data);
      setShowOrdersPopup(true); // Show the orders popup
    } catch (error) {
      console.error('Error fetching client orders:', error);
      alert('An error occurred while fetching client orders.');
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
    setOpen(true);
  };

  const handleNewClientSave = async () => {
    try {
      await axios.post('/api/clients', newClient);
      console.log('New client added successfully');
      setOpen(false);
      fetchData();
      setNewClient({ client_name: '', client_number: '' });
    } catch (error) {
      console.error('Error adding new client:', error);
      alert('An error occurred while adding the new client.');
    }
  };

  const handleClientSelect = (clientName) => {
    // Handle client selection, e.g., update state or perform actions
  };
  

  const columns = [
    { field: 'client_id', headerName: 'ID', width: 50 },
    { field: 'client_name', headerName: 'Client Name', width: 200 },
    { field: 'balance', headerName: 'Balance', type: 'number', width: 150,
      renderCell: (params) => (
        <span>{`${params.value} TND`}</span>
    ),
    },
    { field: 'client_number', headerName: 'Client Number', type: 'number', width: 200 },
    {
      field: 'pay_credit',
      headerName: 'Pay Credit',
      width: 120,
      sortable: false,
      renderCell: (params) => (
        <Button
          variant="contained"
          color="success"
          onClick={() => handlePayCredit(params.row)}
        >
          Pay Credit
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
            <ClientMenu onSelect={handleClientSelect} />
            <Button
              variant="contained"
              color="primary"
              onClick={handleAddClient}
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
          />
        </Box>
      </Box>
      <AddClientPopup
        open={open}
        handleClose={() => setOpen(false)}
        handleSave={handleNewClientSave}
        newClient={newClient} // Pass newClient instead of selectedProduct
        setNewClient={setNewClient} // Pass setNewClient instead of setSelectedProduct
      />

      {/* Orders Popup */}
      {showOrdersPopup && (
        <ClientOrdersPopup
          open={showOrdersPopup}
          handleClose={() => setShowOrdersPopup(false)}
          client={selectedClient}
          orders={clientOrders}
        />
      )}
      
    </div>
  );
};

export default Clients;
