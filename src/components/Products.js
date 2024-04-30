import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { DataGrid } from '@mui/x-data-grid';
import SearchProductByName from './SearchProductByName';
import { Box, Button } from '@mui/material';
import DialogPopup from './DialogPopup';

const Products = () => {
  const [products, setProducts] = useState([]);
  const [originalProducts, setOriginalProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const response = await axios.get('/api/products');
      setProducts(response.data);
      setOriginalProducts(response.data);
    } catch (error) {
      console.error('Error:', error);
      alert('An error occurred while fetching products.');
    }
  };

  const handleSearch = (searchResults) => {
    setProducts(searchResults);
  };

  const displayAllProducts = () => {
    setProducts(originalProducts);
  };

  const handleEdit = (product) => {
    setSelectedProduct(product);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleSave = async () => {
    try {
      await axios.put(`/api/products/${selectedProduct.id}`, selectedProduct);
      console.log('Product updated successfully');
      setOpen(false);
      fetchData();
    } catch (error) {
      console.error('Error updating product:', error);
      alert('An error occurred while updating the product.');
    }
  };

  const handleDelete = async (productId) => {
    try {
      await axios.delete(`/api/products/${productId}`);
      console.log('Product deleted successfully');
      fetchData();
    } catch (error) {
      console.error('Error deleting product:', error);
      alert('An error occurred while deleting the product.');
    }
  };

  const columns = [
    { field: 'id', headerName: 'ID', width: 50 },
    { field: 'name', headerName: 'Product', width: 120 },
    { field: 'price_buy', headerName: 'Prix Dachat', type: 'number', width: 100 },
    { field: 'price_sell', headerName: 'Prix De Vante', type: 'number', width: 100 },
    { field: 'stock', headerName: 'Stock', type: 'number', width: 80 },
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
      <Box mt={4} sx={{
        width: '100vw',
        display: 'flex',
        flexDirection: { xs: 'column', md: 'row' },
        justifyContent: 'space-around'
      }}>
        <Box sx={{
          width: { xs: '100%', md: '25%' }
        }}>
          <SearchProductByName onSearch={handleSearch} />
          <Button
            variant="contained"
            color="primary"
            onClick={displayAllProducts}
            sx={{ padding: '20px', width: '100%', marginTop: '20px' }}
          >
            Display All Products
          </Button>
        </Box>
        <Box style={{ height: 560, minWidth: '60%' }}>
          <DataGrid
            rows={products}
            columns={columns}
            pageSize={5}
            rowsPerPageOptions={[5, 10]}
            checkboxSelection
          />
        </Box>
      </Box>
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
