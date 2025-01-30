import React, { useState } from 'react';
import { Paper, Typography, TextField, Button, Box } from '@mui/material';
import axios from 'axios';

const AddProductForm = () => {
  const [product, setProduct] = useState({
    name: '',
    price_buy: '',
    price_sell: '',
    stock: '',
    description: ''
  });

  const tenantId = localStorage.getItem('tenant_id'); // Retrieve tenant_id from localStorage

  const handleChange = (event) => {
    const { name, value } = event.target;
    setProduct({
      ...product,
      [name]: value
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const token = localStorage.getItem('token'); // Retrieve the token from localStorage

    try {
      const response = await axios.post(
        '/api/products',
        { ...product, tenant_id: tenantId }, // Add tenant_id to the product data
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      console.log(response.data);
      alert(response.data.message);
      setProduct({
        name: '',
        price_buy: '',
        price_sell: '',
        stock: '',
        description: ''
      });
    } catch (error) {
      console.error('Error:', error);
      alert('An error occurred. Please try again.');
    }
  };

  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
      <Paper elevation={3} sx={{ padding: '20px', maxWidth: '400px', width: '100%' }}>
        <Typography variant="h5" gutterBottom>
          Add Product
        </Typography>
        <form onSubmit={handleSubmit}>
          <TextField
            label="Name"
            variant="outlined"
            name="name"
            value={product.name}
            onChange={handleChange}
            fullWidth
            margin="normal"
            required
          />
          <TextField
            label="Prix d'achat"
            variant="outlined"
            name="price_buy"
            value={product.price_buy}
            onChange={handleChange}
            fullWidth
            margin="normal"
            required
          />
          <TextField
            label="Prix de vente"
            variant="outlined"
            name="price_sell"
            value={product.price_sell}
            onChange={handleChange}
            fullWidth
            margin="normal"
            required
          />
          <TextField
            label="Stock"
            variant="outlined"
            name="stock"
            value={product.stock}
            onChange={handleChange}
            fullWidth
            margin="normal"
            required
          />
          <TextField
            label="Description"
            variant="outlined"
            name="description"
            value={product.description}
            onChange={handleChange}
            fullWidth
            multiline
            rows={4}
            margin="normal"
          />
          <Button type="submit" variant="contained" color="primary" fullWidth>
            Add Product
          </Button>
        </form>
      </Paper>
    </Box>
  );
};

export default AddProductForm;
