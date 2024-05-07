import React from 'react';
import { Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, TextField, Button } from '@mui/material';

const AddClientPopup = ({ open, handleClose, handleSave, selectedProduct, setSelectedProduct }) => {
  return (
    <Dialog open={open} onClose={handleClose}>
      <DialogTitle>Add client details</DialogTitle>
      <DialogContent>
        <DialogContentText>
          Please enter the details of the client.
        </DialogContentText>
        <TextField
          autoFocus
          margin="dense"
          id="client_name"
          label="Client Name"
          type="text"
          fullWidth
          value={selectedProduct?.name || ''}
          onChange={(e) => setSelectedProduct({ ...selectedProduct, name: e.target.value })}
        />
        <TextField
          margin="dense"
          id="client_number"
          label="client_number"
          type="number"
          fullWidth
          value={selectedProduct?.price_buy || ''}
          onChange={(e) => setSelectedProduct({ ...selectedProduct, price_buy: e.target.value })}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} color="primary">
          Cancel
        </Button>
        <Button onClick={handleSave} color="primary">
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddClientPopup;
