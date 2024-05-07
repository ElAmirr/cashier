import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { DataGrid } from '@mui/x-data-grid';
import { Box, Button } from '@mui/material';
import OrderDetailsPopup from './OrderDetailsPopup'; // Import the OrderDetailsPopup component

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [openPopup, setOpenPopup] = useState(false);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await axios.get('/api/orders');
      const ordersWithId = response.data.map(order => ({
        ...order,
        id: order.order_id // Use order_id as the id property
      }));
      setOrders(ordersWithId);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching orders:', error);
    }
  };

  const handleOrderDetailsClick = async (order) => {
    setSelectedOrder(order);
    setOpenPopup(true); // Open the popup when clicking on an order
  };

  const handleClosePopup = () => {
    setOpenPopup(false); // Close the popup
  };


  const columns = [
    { field: 'order_id', headerName: 'Order ID', width: 120 },
    { field: 'total_price', headerName: 'Total Price', type: 'number', width: 120 },
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

  return (
    <div>
      <Box mt={4} sx={{
        width: '100vw',
        display: 'flex',
        flexDirection: { xs: 'column', md: 'row' },
        justifyContent: 'space-around'
      }}>
        <Box style={{ height: 560, minWidth: '60%' }}>
          <DataGrid
            rows={orders}
            columns={columns}
            pageSize={5}
            rowsPerPageOptions={[5, 10]}
            loading={loading}
          />
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
