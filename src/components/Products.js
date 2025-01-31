import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { DataGrid } from '@mui/x-data-grid';
import SearchProductByName from './SearchProductByName';
import { Box, Button, Paper, CircularProgress, Alert } from '@mui/material';
import DialogPopup from './DialogPopup';

const Products = () => {
  const [products, setProducts] = useState([]);
  const [originalProducts, setOriginalProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [totalSum, setTotalSum] = useState(0);
  const [error, setError] = useState(null);

  const tenant_id = localStorage.getItem('tenant_id'); // Retrieve tenant_id from local storage
  const token = localStorage.getItem('token'); // Retrieve the token from localStorage

  // Fetch products data
  const fetchData = useCallback(async () => {
    if (!tenant_id) {
      setError('Tenant ID is missing. Please log in again.');
      return;
    }

    if (!token) {
      setError('Token is missing. Please log in again.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      console.log('Fetching products for Tenant ID:', tenant_id);
      const response = await axios.get('/api/products', {
        headers: {
          Authorization: `Bearer ${token}`, // Include the token
        },
        params: {
          tenant_id, // Include tenant_id in the request
        },
      });

      console.log('API Response:', response.data);

      if (!response.data || response.data.length === 0) {
        setError('No products found for this tenant.');
        setProducts([]);
        setOriginalProducts([]);
      } else {
        setProducts(response.data);
        setOriginalProducts(response.data);
        calculateTotalSum(response.data); // Calculate total sum after fetching data
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      setError('Failed to fetch products. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  }, [tenant_id, token]);

  // Calculate total sum of products
  const calculateTotalSum = (products) => {
    const sum = products.reduce((acc, product) => {
      const price = product.price_buy || 0;
      const stock = product.stock || 0;
      return acc + price * stock;
    }, 0);
    setTotalSum(sum);
  };

  // Fetch data on component mount
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Handle search results from SearchProductByName
  const handleSearch = (searchResults) => {
    setProducts(searchResults);
    calculateTotalSum(searchResults); // Update total sum for filtered results
  };

  // Display all products
  const displayAllProducts = () => {
    setProducts(originalProducts);
    calculateTotalSum(originalProducts); // Recalculate total sum for all products
  };

  // Handle edit product
  const handleEdit = (product) => {
    setSelectedProduct(product);
    setOpen(true);
  };

  // Close the edit dialog
  const handleClose = () => {
    setOpen(false);
  };

  // Save edited product
  const handleSave = async () => {
    if (!selectedProduct) return;

    try {
      await axios.put(`/api/products/${selectedProduct.id}`, {
        ...selectedProduct,
        tenant_id, // Include tenant_id in the request
      });
      setOpen(false);
      fetchData(); // Refresh data after saving
    } catch (error) {
      console.error('Error updating product:', error);
      setError('An error occurred while updating the product.');
    }
  };

  // Handle delete product
  const handleDelete = async (productId) => {
    try {
      await axios.delete(`/api/products/${productId}`, {
        data: { tenant_id }, // Include tenant_id in the delete request
      });
      fetchData(); // Refresh data after deletion
    } catch (error) {
      console.error('Error deleting product:', error);
      setError('An error occurred while deleting the product.');
    }
  };

  // DataGrid columns
  const columns = [
    { field: 'id', headerName: 'ID', width: 50 },
    { field: 'name', headerName: 'Product', width: 120 },
    {
      field: 'price_buy',
      headerName: 'Prix Dachat',
      type: 'number',
      width: 100,
      renderCell: (params) => <span>{`${params.value || 0} TND`}</span>,
    },
    {
      field: 'price_sell',
      headerName: 'Prix De Vante',
      type: 'number',
      width: 100,
      renderCell: (params) => <span>{`${params.value || 0} TND`}</span>,
    },
    {
      field: 'stock',
      headerName: 'Stock',
      type: 'number',
      width: 80,
      renderCell: (params) => (
        <span style={{ color: params.value <= 5 ? 'red' : 'green' }}>
          {params.value}
        </span>
      ),
    },
    { field: 'description', headerName: 'Description', width: 100 },
    {
      field: 'edit',
      headerName: 'Edit',
      width: 100,
      sortable: false,
      renderCell: (params) => (
        <Button
          variant="contained"
          color="secondary"
          onClick={() => handleEdit(params.row)}
        >
          Edit
        </Button>
      ),
    },
    {
      field: 'delete',
      headerName: 'Delete',
      width: 100,
      sortable: false,
      renderCell: (params) => (
        <Button
          variant="contained"
          color="error"
          onClick={() => handleDelete(params.row.id)}
        >
          Delete
        </Button>
      ),
    },
  ];

  return (
    <div>
      <Box
        mt={4}
        sx={{
          width: '100vw',
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' },
          justifyContent: 'space-around',
        }}
      >
        {/* Left Side: Search and Total Sum */}
        <Box
          sx={{
            width: { xs: '100%', md: '25%' },
          }}
        >
          <SearchProductByName onSearch={handleSearch} tenant_id={tenant_id} />
          <Button
            variant="contained"
            color="primary"
            onClick={displayAllProducts}
            sx={{ padding: '20px', width: '100%', marginTop: '20px' }}
          >
            Display All Products
          </Button>
          <Paper
            elevation={3}
            sx={{
              padding: '30px',
              marginTop: '20px',
              backgroundColor: '#f3f3f3',
              borderRadius: '5px',
              textAlign: 'center',
              fontSize: '18px',
            }}
          >
            Total Sum of Products: {totalSum.toFixed(2)} TND
          </Paper>
        </Box>

        {/* Right Side: DataGrid */}
        <Box style={{ height: 560, minWidth: '60%' }}>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          {loading ? (
            <Box display="flex" justifyContent="center" alignItems="center" height="100%">
              <CircularProgress />
            </Box>
          ) : (
            <DataGrid
              rows={products}
              columns={columns}
              pageSize={5}
              rowsPerPageOptions={[5, 10]}
              loading={loading}
            />
          )}
        </Box>
      </Box>

      {/* Edit Dialog */}
      <DialogPopup
        open={open}
        handleClose={handleClose}
        handleSave={handleSave}
        selectedProduct={selectedProduct}
        setSelectedProduct={setSelectedProduct}
      />
    </div>
  );
};

export default Products;