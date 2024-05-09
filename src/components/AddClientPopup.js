import React from 'react';
import { Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, TextField, Button } from '@mui/material';

const AddClientPopup = ({ open, handleClose, handleSave, newClient, setNewClient }) => {
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
          value={newClient?.client_name || ''}
          onChange={(e) => setNewClient({ ...newClient, client_name: e.target.value })}
        />
        <TextField
          margin="dense"
          id="client_number"
          label="Client Number"
          type="number"
          fullWidth
          value={newClient?.client_number || ''}
          onChange={(e) => setNewClient({ ...newClient, client_number: e.target.value })}
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
