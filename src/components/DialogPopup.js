import React from 'react';
import { Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, TextField, Button } from '@mui/material';

const DialogPopup = ({ open, handleClose, handleSave, selectedProduct, setSelectedProduct }) => {
  return (
    <Dialog open={open} onClose={handleClose}>
      <DialogTitle>Edit Product</DialogTitle>
      <DialogContent>
        <DialogContentText>
          Please edit the details of the product.
        </DialogContentText>
        <TextField
          autoFocus
          margin="dense"
          id="name"
          label="Product Name"
          type="text"
          fullWidth
          value={selectedProduct?.name || ''}
          onChange={(e) => setSelectedProduct({ ...selectedProduct, name: e.target.value })}
        />
        <TextField
          margin="dense"
          id="price_buy"
          label="Purchase Price"
          type="number"
          fullWidth
          value={selectedProduct?.price_buy || ''}
          onChange={(e) => setSelectedProduct({ ...selectedProduct, price_buy: e.target.value })}
        />
        <TextField
          margin="dense"
          id="price_sell"
          label="Selling Price"
          type="number"
          fullWidth
          value={selectedProduct?.price_sell || ''}
          onChange={(e) => setSelectedProduct({ ...selectedProduct, price_sell: e.target.value })}
        />
        <TextField
          margin="dense"
          id="stock"
          label="Stock"
          type="number"
          fullWidth
          value={selectedProduct?.stock || ''}
          onChange={(e) => setSelectedProduct({ ...selectedProduct, stock: e.target.value })}
        />
        <TextField
          margin="dense"
          id="description"
          label="Description"
          type="text"
          fullWidth
          value={selectedProduct?.description || ''}
          onChange={(e) => setSelectedProduct({ ...selectedProduct, description: e.target.value })}
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

export default DialogPopup;
