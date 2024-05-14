import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { DataGrid } from '@mui/x-data-grid';
import { Box, Button } from '@mui/material';
import OrderDetailsPopup from './OrderDetailsPopup'; // Import the OrderDetailsPopup component
import DailyReport from './DailyReport';

const Orders = () => {
  const [paidOrders, setPaidOrders] = useState([]);
  const [creditOrders, setCreditOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [openPopup, setOpenPopup] = useState(false);
  const [showPaidOrders, setShowPaidOrders] = useState(true); // Initially show paid orders


  useEffect(() => {
    fetchPaidOrders();
    fetchCreditOrders();
  }, []);

  const fetchPaidOrders = async () => {
    try {
      const response = await axios.get('/api/orders/paid');
      const ordersWithId = response.data.map(order => ({
        ...order,
        id: order.order_id // Use order_id as the id property
      }));
      setPaidOrders(ordersWithId);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching orders:', error);
    }
  };

  const fetchCreditOrders = async () => {
    try {
      const response = await axios.get('/api/orders/credit');
      const ordersWithId = response.data.map(order => ({
        ...order,
        id: order.order_id // Use order_id as the id property
      }));
      setCreditOrders(ordersWithId);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching orders:', error);
    }
  };


  const fetchClientData = async (clientId) => {
    try {
      const response = await axios.get(`/api/clients/${clientId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching client data:', error);
      return null;
    }
  };

  const handleOrderDetailsClick = async (order) => {
    setSelectedOrder(order);
    const clientData = await fetchClientData(order.client_id);
    setSelectedOrder({
      ...order,
      clientData: clientData
    });
    setOpenPopup(true); // Open the popup when clicking on an order
  };

  const handleClosePopup = () => {
    setOpenPopup(false); // Close the popup
  };

  const handlePaidOrdersButtonClick = () => {
    setShowPaidOrders(true); // Show paid orders
  };

  const handleCreditOrdersButtonClick = () => {
    setShowPaidOrders(false); // Show credit orders
  };

  const columns = [
    { field: 'order_id', headerName: 'Order ID', width: 120 },
    { 
      field: 'total_price', 
      headerName: 'Total Price',  
      width: 120,
      renderCell: (params) => (
        <span>{`${params.value} TND`}</span>
      ),
    },
    { 
      field: 'payment', 
      headerName: 'Payment State', 
      width: 120,
      renderCell: (params) => (
      <span style={{ color: params.value === 1 ? 'green' : params.value === 3 ? 'blue' : 'red' }}>
        {params.value === 1 ? 'Paid' : params.value === 3 ? 'Credit Paid' : 'Not Paid'}
      </span>
      ),
    },
    { field: 'order_date', headerName: 'Order Date', width: 150 },
    {
      field: 'actions',
      headerName: 'Actions',
      sortable: false,
      width: 120,
      renderCell: (params) => (
        <Button
          variant="contained"
          color="primary"
          size="small"
          onClick={() => handleOrderDetailsClick(params.row)}
        >
          View Details
        </Button>
      ),
    },
  ];

   // Inline styles for printing
   const printStyles = `
   @media print {
     .print-only {
       display: none;
     }
   }
 `;

  return (
    <div>
      <style>{printStyles}</style> {/* Apply the print styles */}
      <Box sx={{
        width: '100%',
        display: 'flex',
        flexDirection: { xs: 'column', md: 'row' },
        justifyContent: 'space-around'
      }}>
        <DailyReport />
        <Box className="print-only" style={{ height: 480, minWidth: '60%' }}>
          <Box mb={2} sx={{ display: 'flex', gap: '20px' }}>
          <Button
              variant={showPaidOrders ? 'contained' : 'outlined'}//
              color={'primary'}
              onClick={handlePaidOrdersButtonClick}
              sx={{ padding: '20px', width: '100%', marginTop: '20px' }}
            >
              Paid Orders
            </Button>
            <Button
              variant={showPaidOrders ? 'outlined' : 'contained'}//
              color={'primary'}// Set color based on showPaidOrders state
              onClick={handleCreditOrdersButtonClick}
              sx={{ padding: '20px', width: '100%', marginTop: '20px' }}
            >
              Credit Orders
            </Button>
          </Box>
          {showPaidOrders ? ( // Conditionally render based on showPaidOrders state
          <DataGrid
            rows={paidOrders}
            columns={columns}
            pageSize={5}
            rowsPerPageOptions={[5, 10]}
            loading={loading}
            className='paidOrders'
          />
          ) : ( 
          <DataGrid
            rows={creditOrders}
            columns={columns}
            pageSize={5}
            rowsPerPageOptions={[5, 10]}
            loading={loading}
            className='creditOrders'
          />
          )}
        </Box>
      </Box>
      {/* Pass the selectedOrder and openPopup state to the OrderDetailsPopup component */}
      <OrderDetailsPopup
        open={openPopup}
        order={selectedOrder}
        onClose={handleClosePopup}
      />
    </div>
  );
};

export default Orders;
