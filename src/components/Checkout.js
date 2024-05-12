import React, { useState, useEffect } from 'react';
import { Button, Typography, Box, Paper, Table, TableContainer, TableHead, TableRow, TableCell, TableBody } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import RestoreIcon from '@mui/icons-material/Restore';
import SearchProductByName from './SearchProductByName';
import axios from 'axios';
import ClientMenu from './ClientMenu';
import PaymentMethodSelector from './PaymentMethodSelector';

const Checkout = () => {
  const [products, setProducts] = useState([]);
  const [totalPrice, setTotalPrice] = useState(0);
  const [selectedClient, setSelectedClient] = useState(1); // State to store selected client ID
  const [paymentMethod, setPaymentMethod] = useState(true); // State to store selected payment method

  useEffect(() => {
    // Calculate total price whenever products change
    const totalPrice = products.reduce((total, product) => total + (product.price_sell * product.quantity), 0);
    setTotalPrice(totalPrice);
  }, [products]);

  const handleSearch = async (searchResults) => {
    // Filter out products with stock equal to 0
    const filteredResults = searchResults.filter(product => product.stock > 0);
  
    if (filteredResults.length === 0) {
      // Show an alert if there are no products with available stock
      alert('No products with available stock found.');
      return;
    }
  
    // Update state with filtered products
    setProducts((prevProducts) => {
      // Exclude products already in the list
      const newProducts = [
        ...filteredResults.map(product => ({ ...product, quantity: 1 })),
        ...prevProducts.filter(prevProduct => !filteredResults.find(product => product.id === prevProduct.id))
      ];
      return newProducts;
    });
  };

  const handleAddProductToOrder = (product) => {
    // Check if the quantity being added exceeds the available stock
    if (product.quantity + 1 > product.stock) {
      alert(`Quantity cannot exceed available stock for ${product.name}`);
      return;
    }
  
    setProducts((prevProducts) => {
      const updatedProducts = prevProducts.map((p) =>
        p.id === product.id ? { ...p, quantity: p.quantity + 1 } : p
      );
      return updatedProducts;
    });
  };

  const handleResetQuantity = (productId) => {
    setProducts((prevProducts) =>
      prevProducts.map((p) =>
        p.id === productId ? { ...p, quantity: 1 } : p
      )
    );
  };
  
  const handleRemoveProductFromOrder = (productId) => {
    setProducts((prevProducts) =>
      prevProducts.filter((product) => product.id !== productId)
    );
  };

  const handleClientSelect = (clientId) => {
    // Update selected client ID state
    setSelectedClient(clientId);
  };  

  const handlePaymentMethodSelect = (paymentMethod) => {
    setPaymentMethod(paymentMethod);
  };

  const handleGetPaid = async () => {
    // Check if any product has zero quantity
    const hasZeroQuantity = products.some((product) => product.quantity === 0);
    if (hasZeroQuantity) {
      alert('Please make sure all products have a quantity greater than 0.');
      return;
    } else if (products.length === 0) {
      alert('Please add at least one product to make an order.');
      return;
    }
  
    try {
      // Calculate total cost of products
      const totalCost = products.reduce((total, product) => total + (product.price_buy * product.quantity), 0);
      
      // Calculate profit
      const profit = totalPrice - totalCost;
      
      console.log('Profit:', profit); // Log the profit here
  
      const orderDetails = {
        clientId: selectedClient, // Include selected client ID
        products: products.map((product) => ({
          product_id: product.id,
          quantity: product.quantity,
        })),
        totalPrice: totalPrice,
        paymentMethod: paymentMethod, // Pass payment method
        profit: profit // Pass profit
      };
    
      // Perform the POST request
      const response = await axios.post('/api/get-paid', orderDetails);
      console.log(response.data);
  
      // Update stock for each product
      products.forEach(async (product) => {
        const updatedStock = product.stock - product.quantity;
        await axios.put(`/api/products/${product.id}`, { ...product, stock: updatedStock });
      });
  
      // After the POST request is completed, reload the page
      window.location.reload();
    } catch (error) {
      console.error('Error:', error);
    }
  };
  
  

  return (
    <div>
      <Box mt={4} sx={{ 
        width: '100vw',
        display: 'flex',
        flexDirection: { xs: 'column', md: 'row' },
        alignItems: { xs: 'space-evenly', md: 'flex-start' },
        justifyContent: { xs:'space-between', md:'space-evenly'}
      }}>
        <Box sx={{
          width: { xs: '100%', md:'30%' },
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '20px'
          }}>
          <SearchProductByName onSearch={handleSearch} />
          <ClientMenu onSelectClient={handleClientSelect} />
          <PaymentMethodSelector onSelectPaymentMethod={handlePaymentMethodSelect} />

  
          <Box sx={{
            width: '100%',
            display: 'flex',
            justifyContent: 'space-between',

          }}>
            <Paper elevation={3} sx={{ padding: '20px', width: '49%', display: 'flex', justifyContent: 'center' }}>
              <Typography variant="h6" gutterBottom color="primary">
                {totalPrice.toFixed(2)} DT
              </Typography>
            </Paper>
            <Button mt={4} variant="contained" color="success" onClick={handleGetPaid} sx={{
              padding: '10px',
              width: '49%'
            }}>Get Paid
            </Button>
          </Box>
        </Box>
        <Box sx={{ 
          width: { xs: '100', md:'60%' },
          marginTop: {md: '0', xs:'20px'}
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