import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Dialog, DialogTitle, DialogContent, DialogActions, Table, TableHead, TableBody, TableRow, TableCell, Button } from '@mui/material';

const OrderDetailsPopup = ({ open, order, onClose }) => {
  const [orderDetails, setOrderDetails] = useState([]);
  const [productDetails, setProductDetails] = useState([]);

  const tenant_id = localStorage.getItem('tenant_id'); // Get tenant_id from localStorage

  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        const username = localStorage.getItem('username');
        const response = await axios.get(`/api/orders/${order.order_id}/details`, {
          headers: {
            'Authorization': `Bearer ${username}`,
            'Tenant-ID': tenant_id, // Include tenant_id in headers
          },
        });
        setOrderDetails(response.data);
      } catch (error) {
        console.error('Error fetching order details:', error);
      }
    };

    if (open && order) {
      fetchOrderDetails();
    }
  }, [open, order, tenant_id]);

  useEffect(() => {
    const fetchProductDetails = async (productId) => {
      try {
        const username = localStorage.getItem('username');
        const response = await axios.get(`/api/products/${productId}`, {
          headers: {
            'Authorization': `Bearer ${username}`,
            'Tenant-ID': tenant_id, // Include tenant_id in headers
          },
        });
        return response.data;
      } catch (error) {
        console.error('Error fetching product details:', error);
        return null;
      }
    };

    const fetchAllProductDetails = async () => {
      const details = await Promise.all(
        orderDetails.map(async (detail) => {
          const productDetail = await fetchProductDetails(detail.product_id);
          return productDetail;
        })
      );
      setProductDetails(details);
    };

    fetchAllProductDetails();
  }, [orderDetails, tenant_id]);

  const handlePrint = () => {
    window.print();
  };

  if (!productDetails.length) {
    return null;
  }

  return (
    <Dialog open={open} onClose={onClose} width="150px" fullWidth>
      <DialogTitle>{`Order - Client ID : ${order.order_id} - ${order.client_id} - Date: ${order.order_date}`}</DialogTitle>
      <DialogContent>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>QTY</TableCell>
              <TableCell>DESC</TableCell>
              <TableCell>AMT</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {productDetails.map((detail, index) => (
              <TableRow key={index}>
                <TableCell>{orderDetails[index]?.quantity}</TableCell>
                <TableCell>{detail ? detail.name : 'Product Name Unavailable'}</TableCell>
                <TableCell>{detail ? `${detail.price_sell} TND` : 'Price Unavailable'}</TableCell>
              </TableRow>
            ))}
            <TableRow>
              <TableCell colSpan={2} align="right">Total:</TableCell>
              <TableCell>{order.total_price} TND</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="primary" variant="outlined" className="print-only">
          Close
        </Button>
        <Button onClick={handlePrint} color="primary" variant="contained" className="print-only">
          Print
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default OrderDetailsPopup;