import React, { useState } from 'react';
import { Button, Typography, Box, Paper, Table, TableContainer, TableHead, TableRow, TableCell, TableBody } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import RestoreIcon from '@mui/icons-material/Restore';
import SearchProductByName from './SearchProductByName';
import axios from 'axios';


const Checkout = () => {
  const [products, setProducts] = useState([]);
  const [totalPrice, setTotalPrice] = useState(0);
  const [benfice, setBenfice] = useState(0);

  const handleSearch = async (searchResults) => {
    setProducts((prevProducts) => {
      // Filter out products that already exist in the order
      const filteredResults = searchResults.filter(product => !prevProducts.find(p => p.id === product.id));
      const newProducts = [...filteredResults.map(product => ({ ...product, quantity: 0 })), ...prevProducts];
      return newProducts;
    });
  };

  const handleAddProductToOrder = (product) => {
    setProducts((prevProducts) => {
      const updatedProducts = prevProducts.map((p) =>
        p.id === product.id ? { ...p, quantity: p.quantity + 1 } : p
      );
  
      // Calculate the profit after updating the quantity
      const updatedProduct = updatedProducts.find((p) => p.id === product.id);
      const profit = (updatedProduct.price_sell - updatedProduct.price_buy) * updatedProduct.quantity;
      setBenfice((prevBenfice) => prevBenfice + profit);
  
      return updatedProducts;
    });
  
    setTotalPrice((prevTotalPrice) => prevTotalPrice + product.price_sell);
    console.log(product.price_sell)
    console.log(product.price_buy)
    console.log(product.quantity)
    console.log((product.price_sell - product.price_buy) * (product.quantity))
  };
  
  

  const handleResetQuantity = (productId) => {
    setProducts((prevProducts) => prevProducts.map(p => p.id === productId ? { ...p, quantity: 0 } : p));
    setTotalPrice((prevTotalPrice) => {
      const product = products.find(product => product.id === productId);
      return prevTotalPrice - product.price_sell * product.quantity;
    });
  };

  const handleRemoveProductFromOrder = (productId) => {
    const removedProduct = products.find(product => product.id === productId);
    setBenfice((prevBenfice) => prevBenfice - (removedProduct.price_sell - removedProduct.price_buy) * removedProduct.quantity);
    setProducts((prevProducts) => prevProducts.filter(product => product.id !== productId));
    setTotalPrice((prevTotalPrice) => prevTotalPrice - removedProduct.price_sell * removedProduct.quantity);
  };

  const handleGetPaid = async () => {
    // Check if any product quantity is 0
    const hasZeroQuantity = products.some(product => product.quantity === 0);
    if (hasZeroQuantity) {
      // Display an alert popup
      alert('Please make sure all products have a quantity greater than 0.');
      return; // Don't proceed further
    } else if (products.length === 0) {
      // Display an alert popup
      alert('Please add at least one product to make an order.');
      return; // Don't proceed further
    }
    try {
      // Prepare the order details to send to the backend
      const orderDetails = {
        products: products.map(product => ({ product_id: product.id, quantity: product.quantity })), // Send product IDs and quantities
        benfice: benfice,
        totalPrice: totalPrice
      };
  
      // Send a POST request to the backend endpoint
      const response = await axios.post('/api/get-paid', orderDetails);
  
      // Handle the response
      console.log(response.data); // Assuming the response contains a success message
      // Reload the page after successful payment
    window.location.reload();
    } catch (error) {
      console.error('Error:', error); // Handle any errors
    }
  };
  
  

  return (
    <div>
      <Box mt={4} sx={{ 
        width: '100vw',
        display: 'flex',
        flexDirection: { xs: 'column', sm: 'row' },
        alignItems: { xs: 'space-evenly', sm: 'flex-start' },
        justifyContent: { xs:'space-between', sm:'space-evenly'}
      }}>
        <Box sx={{
          width: { xs: '100%', sm:'30%' },
          }}>
          <SearchProductByName onSearch={handleSearch} />
          <Box mt={4} sx={{
            display: 'flex',
            flexDirection: { md: 'row', sm: 'column'},
            justifyContent: 'space-between'
          }}>
            <Paper elevation={3} sx={{ padding: '20px', width: { md:'49%', sm:'100%' }, display: 'flex', justifyContent: 'center' }}>
              <Typography variant="h6" gutterBottom color="primary">
                {totalPrice.toFixed(2)} DT
              </Typography>
            </Paper>
            <Button mt={4} variant="contained" color="success" onClick={handleGetPaid} sx={{
              padding: '20px',
              width: { md:'49%', sm:'100%' }
            }}>Get Paid</Button>
          </Box>
        </Box>
        <Box sx={{ 
          width: { xs: '100', sm:'60%' },
          marginTop: {xs: '20px', sm: '0'}
        }}>
          <Box>
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Product</TableCell>
                    <TableCell>Price</TableCell>
                    <TableCell>Quantity</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {products.map((product, index) => (
                    <TableRow key={index}>
                      <TableCell sx={{ overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>{product.name}</TableCell>
                      <TableCell>{product.price_sell}</TableCell>
                      <TableCell>{product.quantity}</TableCell>
                      <TableCell>
                        <Box sx={{
                          display: { sm: 'flex', xs: 'none'}, justifyContent: 'flex-start', alignItems: 'center' }}>
                          <Button
                            variant="contained"
                            color="primary"
                            size="small"
                            onClick={() => handleAddProductToOrder(product)}
                            startIcon={<AddIcon />}
                            sx={{ mx: 0.5 }}
                          >
                            Add
                          </Button>
                          <Button
                            variant="contained"
                            color="secondary"
                            size="small"
                            onClick={() => handleResetQuantity(product.id)}
                            startIcon={<RestoreIcon />}
                            sx={{ mx: 0.5 }}
                          >
                            Reset
                          </Button>
                          <Button
                            variant="contained"
                            color="error"
                            size="small"
                            onClick={() => handleRemoveProductFromOrder(product.id)}
                            startIcon={<DeleteIcon />}
                            sx={{ mx: 0.5 }}
                          >
                            Remove
                          </Button>
                        </Box>
                        <Box sx={{
                          display: {sm: 'none', xs: 'flex'}, justifyContent: 'start'
                        }}>
                          <Button
                            sx={{ width: '30px', height: '30px', mx: 0.5 }}
                            startIcon={<AddIcon />}
                            onClick={() => handleAddProductToOrder(product)}
                            color= 'primary'
                          ></Button>
                          <Button
                            sx={{ width: '30px', height: '30px', mx: 0.5 }}
                            startIcon={<RestoreIcon />}
                            onClick={() => handleResetQuantity(product.id)}
                            color= 'secondary'
                          ></Button>
                          <Button
                            sx={{ width: '30px', height: '30px', mx: 0.5 }}
                            startIcon={<DeleteIcon />}
                            onClick={() => handleRemoveProductFromOrder(product.id)}
                            color= 'error'
                          ></Button>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
          
        </Box>
      </Box>
    </div>
  );
};

export default Checkout;
