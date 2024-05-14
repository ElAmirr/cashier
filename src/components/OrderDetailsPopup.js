import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Dialog, DialogTitle, DialogContent, DialogActions, Table, TableHead, TableBody, TableRow, TableCell, Button } from '@mui/material';

const OrderDetailsPopup = ({ open, order, onClose }) => {
  const [orderDetails, setOrderDetails] = useState([]);
  const [productDetails, setProductDetails] = useState([]);


  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        const response = await axios.get(`/api/orders/${order.order_id}/details`);
        setOrderDetails(response.data);
      } catch (error) {
        console.error('Error fetching order details:', error);
      }
    };

    if (open && order) {
      fetchOrderDetails();
    }
  }, [open, order]);

  useEffect(() => {
    const fetchProductDetails = async (productId) => {
      try {
        const response = await axios.get(`/api/products/${productId}`);
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
  }, [orderDetails]);

  const handlePrint = () => {
    window.print();
  };

  if (!productDetails.length) {
    return null;
  }

  const printStyles = `
    @media print {
      .print-only {
        display: none;
      }
    }
  `;

  return (
    <Dialog open={open} onClose={onClose} width="150px" fullWidth>
      <style>{printStyles}</style>
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
        <Button onClick={onClose} color="primary" variant='outlined' className="print-only">
          Close
        </Button>
        <Button onClick={handlePrint}  color="primary" variant="contained" className="print-only">
          Print
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default OrderDetailsPopup;
