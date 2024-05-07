import React, { useState } from 'react';
import { TextField, Typography, Box, Paper, List, ListItem, ListItemText } from '@mui/material';
import axios from 'axios';

const SearchProductByName = ({ onSearch }) => {
  const [productName, setProductName] = useState('');
  const [searchResults, setSearchResults] = useState([]);

  const handleChange = async (event) => {
    const value = event.target.value;
    setProductName(value);

    if (!value.trim()) {
      // Clear the search results if the input is empty
      setSearchResults([]);
      return;
    }

    try {
      const response = await axios.get(`/api/products?name=${value}`);
      setSearchResults(response.data);
    } catch (error) {
      console.error('Error searching products:', error);
    }
  };

  const handleAddToOrder = (product) => {
    // Add the selected product to the order details
    onSearch([product]);
    // Clear the input field and search results after selection
    setProductName('');
    setSearchResults([]);
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
      <Paper elevation={3} sx={{ padding: '20px', width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Typography variant="h6" gutterBottom>
          Search Product by Name
        </Typography>
        <TextField
          label="Product Name"
          variant="outlined"
          value={productName}
          onChange={handleChange}
          fullWidth
          margin="normal"
        />
        <Box sx={{ marginTop: '10px', width: '100%' }}>
          <List sx= {{
            maxHeight: '280px',
            overflowY: 'scroll'
          }}>
            {searchResults.map((product, index) => (
              <ListItem key={index} button onClick={() => handleAddToOrder(product)} >
                <ListItemText primary={product.name} secondary={`Quantité disponible ${product.stock}`} sx={{ width: '100%' }}/>
              </ListItem>
            ))}
          </List>
        </Box>
      </Paper>
    </Box>
  );
};

export default SearchProductByName;
