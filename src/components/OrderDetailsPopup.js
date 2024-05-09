import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Dialog, DialogTitle, DialogContent, DialogActions, List, ListItem, ListItemText, Button } from '@mui/material';

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

  // Function to handle printing
  const handlePrint = () => {
    window.print();
  };

  // Render nothing if product details are not available yet
  if (!productDetails.length) {
    return null;
  }

  // Inline styles for printing
  const printStyles = `
    @media print {
      .print-only {
        display: none;
      }
    }
  `;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <style>{printStyles}</style> {/* Apply the print styles */}
      <DialogTitle>{`Order ID: ${order.order_id} - Date: ${order.order_date}`}</DialogTitle>
      <DialogContent>
        <List>
          <ListItemText primary={`QTY DESC AMT`} />
          {productDetails.map((detail, index) => (
            <ListItem key={index}>
              <ListItemText
                primary={`
                  ${orderDetails[index]?.quantity} 
                  ${detail ? detail.name : 'Product Name Unavailable'} 
                  ${detail ? detail.price_sell : 'Price Unavailable'}
                `}  
              />
            </ListItem>
          ))}
        </List>
      <DialogTitle>{`Total: ${order.total_price}`}</DialogTitle>  
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
