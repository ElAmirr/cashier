import React, { useState, useEffect } from 'react';
import {
  TextField,
  Typography,
  Box,
  Paper,
  List,
  ListItem,
  ListItemText,
  CircularProgress,
  Alert,
} from '@mui/material';
import axios from 'axios';

const SearchProductByName = ({ onSearch, tenant_id }) => {
  const [productName, setProductName] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Debounce search to avoid excessive API calls
  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (!productName.trim()) {
        setSearchResults([]);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const token = localStorage.getItem('token'); // Retrieve the token from localStorage
        if (!token) {
          setError('Token is missing. Please log in again.');
          return;
        }

        const response = await axios.get('/api/products', {
          headers: {
            Authorization: `Bearer ${token}`, // Include the token in the request
          },
          params: {
            name: productName,
            tenant_id: tenant_id, // Include tenant_id in the request
          },
        });

        if (!response.data || response.data.length === 0) {
          setError('No products found matching your search.');
          setSearchResults([]);
        } else {
          setSearchResults(response.data);
        }
      } catch (err) {
        console.error('Error searching products:', err);
        setError('Failed to fetch products. Please try again.');
      } finally {
        setLoading(false);
      }
    }, 300); // 300ms debounce delay

    return () => clearTimeout(delayDebounceFn);
  }, [productName, tenant_id]);

  const handleChange = (event) => {
    setProductName(event.target.value);
  };

  const handleAddToOrder = (product) => {
    if (product.stock <= 0) {
      setError('This product is out of stock.');
      return;
    }

    // Add the selected product to the order details
    onSearch([product]);
    // Clear the input field and search results after selection
    setProductName('');
    setSearchResults([]);
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
      <Paper
        elevation={3}
        sx={{
          padding: '20px',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
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
          placeholder="Enter product name..."
        />

        {/* Loading Indicator */}
        {loading && (
          <Box sx={{ marginTop: 2 }}>
            <CircularProgress size={24} />
          </Box>
        )}

        {/* Error Message */}
        {error && (
          <Box sx={{ marginTop: 2, width: '100%' }}>
            <Alert severity="error">{error}</Alert>
          </Box>
        )}

        {/* Search Results */}
        <Box sx={{ marginTop: '10px', width: '100%' }}>
          <List
            sx={{
              maxHeight: '280px',
              overflowY: 'auto',
              bgcolor: 'background.paper',
            }}
          >
            {searchResults.map((product, index) => (
              <ListItem
                key={index}
                button
                onClick={() => handleAddToOrder(product)}
                disabled={product.stock <= 0} // Disable if out of stock
                sx={{
                  opacity: product.stock <= 0 ? 0.6 : 1,
                  '&:hover': {
                    backgroundColor: product.stock <= 0 ? 'inherit' : 'action.hover',
                  },
                }}
              >
                <ListItemText
                  primary={product.name}
                  secondary={
                    product.stock <= 0
                      ? 'Out of stock'
                      : `Price: $${product.price_sell} | Stock: ${product.stock}`
                  }
                  sx={{ width: '100%' }}
                />
              </ListItem>
            ))}
          </List>
        </Box>
      </Paper>
    </Box>
  );
};

export default SearchProductByName;