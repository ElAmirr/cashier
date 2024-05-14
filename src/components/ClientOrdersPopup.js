import React from 'react';
import { Dialog, DialogTitle, DialogContent, List, ListItem, ListItemText, Divider, Button } from '@mui/material';


const ClientOrdersPopup = ({ open, handleClose, client, orders }) => {
    
    const handleCreditPaid = (orderId) => {
        // Send a request to your backend to update the payment status and payment date
        fetch(`/api/orders/${orderId}/pay-credit`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ paymentDate: new Date().toISOString() }) // Pass the current datetime
        })
        .then(response => {
            if (response.ok) {
                // Refresh orders data or handle success as needed
                window.location.reload();
            } else {
                throw new Error('Failed to update payment status');
            }
        })
        .catch(error => {
            console.error('Error updating payment status:', error);
            // Handle error
        });
    };
  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
      <DialogTitle>Orders for {client.client_name}</DialogTitle>
      <DialogContent>
        <List>
          {orders.map((order) => (
            <React.Fragment key={order.order_id}>
              <ListItem>
                <ListItemText primary={`Order ID: ${order.order_id}`} />
                <ListItemText primary={`Total: ${order.total_price} TND`} />
                <Button
                            variant="contained"
                            color="success"
                            size="small"
                            onClick={() => handleCreditPaid(order.order_id)}
                            sx={{ mx: 0.5 }}
                          >
                            Pay Credit
                          </Button>
              </ListItem>
              <Divider />
            </React.Fragment>
          ))}
        </List>
      </DialogContent>
    </Dialog>
  );
};

export default ClientOrdersPopup;
