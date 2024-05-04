import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { DataGrid } from '@mui/x-data-grid';
import { Box } from '@mui/material';


const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

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

  const columns = [
    { field: 'order_id', headerName: 'Order ID', width: 120 },
    { field: 'total_price', headerName: 'Total Price', type: 'number', width: 120 },
    { field: 'order_date', headerName: 'Order Date', width: 150 },
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
    </div>
  );
};

export default Orders;
