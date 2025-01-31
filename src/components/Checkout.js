import React, { useState, useEffect } from 'react';
import {
  Button,
  Typography,
  Box,
  Paper,
  Table,
  TableContainer,
  TableHead,
  TableRow,
  TableCell,
  TableBody
} from '@mui/material';
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
  const [selectedClient, setSelectedClient] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState(true);
  const tenant_id = localStorage.getItem('tenant_id');
  const token = localStorage.getItem('token');

  // Configure axios instance with authentication header
  const api = axios.create({
    baseURL: '/api',
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  useEffect(() => {
    const calculateTotal = () => {
      const total = products.reduce((acc, product) => 
        acc + (product.price_sell * product.quantity), 0
      );
      setTotalPrice(total);
    };
    calculateTotal();
  }, [products]);

  const handleSearch = (searchResults) => {
    const availableProducts = searchResults.filter(p => p.stock > 0);
    
    if (availableProducts.length === 0) {
      alert('No products with available stock found.');
      return;
    }

    setProducts(prev => [
      ...availableProducts.map(p => ({ ...p, quantity: 1 })),
      ...prev.filter(prevProd => 
        !availableProducts.find(newProd => newProd.id === prevProd.id)
      )
    ]);
  };

  const handleAddProductToOrder = (product) => {
    if (product.quantity >= product.stock) {
      alert(`Cannot exceed available stock for ${product.name}`);
      return;
    }
    setProducts(prev => prev.map(p => 
      p.id === product.id ? { ...p, quantity: p.quantity + 1 } : p
    ));
  };

  const handleResetQuantity = (productId) => {
    setProducts(prev => prev.map(p => 
      p.id === productId ? { ...p, quantity: 1 } : p
    ));
  };

  const handleRemoveProductFromOrder = (productId) => {
    setProducts(prev => prev.filter(p => p.id !== productId));
  };
  const handleGetPaid = async () => {
    if (products.length === 0) {
      alert('Please add products to complete order');
      return;
    }
    if (products.some(p => p.quantity < 1)) {
      alert('All products must have quantity ≥ 1');
      return;
    }
  
    try {
      // Calculate profit
      const totalCost = products.reduce((acc, p) => 
        acc + (p.price_buy * p.quantity), 0
      );
      const profit = totalPrice - totalCost;
  
      // Create order payload
      const orderData = {
        tenant_id, // Include tenant_id here
        client_id: selectedClient,
        total_price: totalPrice,
        profit,
        payment: paymentMethod,
        products: products.map(p => ({
          product_id: p.id,
          quantity: p.quantity
        }))
      };
      
      console.log('Order Data:', orderData); // Add this line to debug
  
      // Create order
      const orderResponse = await api.post('/orders', orderData);
  
      // Update product stock
      await Promise.all(products.map(async (product) => {
        const newStock = product.stock - product.quantity;
        await api.put(`/products/${product.id}/stock`, { stock: newStock, tenant_id });
      }));
  
      // Reset state
      setProducts([]);
      alert('Order completed successfully!');
  
    } catch (error) {
      console.error('Checkout error:', error);
      alert('Failed to complete order. Please try again.');
    }
  };

  return (
    <Box mt={4} sx={{
      width: '100vw',
      display: 'flex',
      flexDirection: { xs: 'column', md: 'row' },
      justifyContent: 'space-evenly',
      gap: 3
    }}>
      {/* Left Panel */}
      <Box sx={{ width: { xs: '100%', md: '30%' }, display: 'flex', flexDirection: 'column', gap: 2 }}>
        <SearchProductByName onSearch={handleSearch} tenant_id={tenant_id} />
        <ClientMenu onSelectClient={setSelectedClient} />
        <PaymentMethodSelector onSelectMethod={setPaymentMethod} />
        
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Paper elevation={3} sx={{ p: 2, flex: 1, textAlign: 'center' }}>
            <Typography variant="h6" color="primary">
              {totalPrice.toFixed(2)} TND
            </Typography>
          </Paper>
          <Button
            variant="contained"
            color="success"
            onClick={handleGetPaid}
            sx={{ flex: 1, py: 2 }}
          >
            Complete Order
          </Button>
        </Box>
      </Box>

      {/* Right Panel */}
      <Box sx={{ width: { xs: '100%', md: '60%' } }}>
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
              {products.map((product) => (
                <TableRow key={product.id}>
                  <TableCell sx={{ 
                    maxWidth: 100,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                  }}>
                    {product.name}
                  </TableCell>
                  <TableCell>{product.price_sell} TND</TableCell>
                  <TableCell>{product.quantity}</TableCell>
                  <TableCell>
                    <Box display="flex" gap={1}>
                      <Button
                        variant="contained"
                        color="primary"
                        size="small"
                        onClick={() => handleAddProductToOrder(product)}
                        startIcon={<AddIcon />}
                      >
                        Add
                      </Button>
                      <Button
                        variant="contained"
                        color="secondary"
                        size="small"
                        onClick={() => handleResetQuantity(product.id)}
                        startIcon={<RestoreIcon />}
                      >
                        Reset
                      </Button>
                      <Button
                        variant="contained"
                        color="error"
                        size="small"
                        onClick={() => handleRemoveProductFromOrder(product.id)}
                        startIcon={<DeleteIcon />}
                      >
                        Remove
                      </Button>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    </Box>
  );
};

export default Checkout;