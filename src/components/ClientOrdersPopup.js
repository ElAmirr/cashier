import React from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button } from '@mui/material';

const AddClientPopup = ({ open, handleClose, handleSave, newClient, setNewClient }) => {
  const handleChange = (e) => {
    const { name, value } = e.target;
    setNewClient((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    <Dialog open={open} onClose={handleClose}>
      <DialogTitle>Add New Client</DialogTitle>
      <DialogContent>
        <TextField
          autoFocus
          margin="dense"
          name="client_name"
          label="Client Name"
          type="text"
          fullWidth
          value={newClient.client_name}
          onChange={handleChange}
        />
        <TextField
          margin="dense"
          name="client_number"
          label="Client Number"
          type="text"
          fullWidth
          value={newClient.client_number}
          onChange={handleChange}
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