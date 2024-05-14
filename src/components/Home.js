import React from 'react';
import { IconButton } from '@mui/material';
import { Link } from 'react-router-dom';
import { Home as HomeIcon, Store as ProductsIcon, ShoppingCart as CheckoutIcon, AddBox as AddProductIcon, People as ClientsIcon, Assignment as OrdersIcon, BarChart as ReportsIcon } from '@mui/icons-material';
import backgroundImage from './background.jpg'; // Import your background image

const Home = () => {
  return (
    <div
      style={{
        position: 'relative', // Make the container relative to position its children
        width: '100%',
        height: '90vh',
      }}
    >
      <div
        style={{
          position: 'absolute', // Position the non-blurred squares on top of the background image
          top: 0,
          left: 0,
          margin: '0 auto',
          width: '100%',
          height: '100%',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1, // Ensure the squares are in front of the background image
          flexWrap: 'wrap',
        }}
      >
        {/* Non-blurred squares */}
        <IconButton component={Link} to="/" style={squareStyle}>
          <HomeIcon style={{ fontSize: 100 }} />
        </IconButton>
        <IconButton component={Link} to="/products" style={squareStyle}>
          <ProductsIcon style={{ fontSize: 100 }} />
        </IconButton>
        <IconButton component={Link} to="/checkout" style={squareStyle}>
          <CheckoutIcon style={{ fontSize: 100 }} />
        </IconButton>
        <IconButton component={Link} to="/add_product" style={squareStyle}>
          <AddProductIcon style={{ fontSize: 100 }} />
        </IconButton>
        <IconButton component={Link} to="/clients" style={squareStyle}>
          <ClientsIcon style={{ fontSize: 100 }} />
        </IconButton>
        <IconButton component={Link} to="/orders" style={squareStyle}>
          <OrdersIcon style={{ fontSize: 100 }} />
        </IconButton>
        <IconButton component={Link} to="/reports" style={squareStyle}>
          <ReportsIcon style={{ fontSize: 100 }} />
        </IconButton>
      </div>
      {/* Blurred background image */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundImage: `url(${backgroundImage})`, // Set the background image
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          filter: 'blur(5px)', // Apply blur effect
          zIndex: 0, // Ensure the background image is behind the squares
        }}
      ></div>
    </div>
  );
};

// Style for the non-blurred squares
const squareStyle = {
  width: '250px',
  height: '250px',
  backgroundColor: '#fff',
  margin: '10px', // Add some margin between squares
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
};

export default Home;
