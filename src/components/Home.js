import React from 'react';
import { Grid, Paper, IconButton, Typography } from '@mui/material';
import { Link } from 'react-router-dom';
import { 
  Store as ProductsIcon, 
  ShoppingCart as CheckoutIcon, 
  AddBox as AddProductIcon, 
  People as ClientsIcon, 
  Assignment as OrdersIcon, 
  BarChart as ReportsIcon 
} from '@mui/icons-material';
import backgroundImage from './background.jpg';

const Home = () => {
  const navItems = [
    { icon: <ProductsIcon />, path: "/products", label: "Products" },
    { icon: <CheckoutIcon />, path: "/checkout", label: "Checkout" },
    { icon: <AddProductIcon />, path: "/add_product", label: "Add Product" },
    { icon: <ClientsIcon />, path: "/clients", label: "Clients" },
    { icon: <OrdersIcon />, path: "/orders", label: "Orders" },
    { icon: <ReportsIcon />, path: "/reports", label: "Reports" },
  ];

  return (
    <div style={containerStyle}>
      <div style={backgroundStyle}>
        <div style={overlayStyle} />
        <img 
          src={backgroundImage} 
          alt="background" 
          style={imageStyle} 
        />
      </div>
      
      <div style={contentStyle}>
        <Typography variant="h4" style={titleStyle}>
          Point of Sale System
        </Typography>
        
        <Grid container spacing={3} sx={{ maxWidth: 800, padding: 3 }}>
          {navItems.map((item) => (
            <Grid item xs={6} sm={4} key={item.path}>
              <IconButton 
                component={Link} 
                to={item.path} 
                fullWidth 
                style={cardStyle}
              >
                <Paper elevation={3} style={paperStyle}>
                  <div style={iconStyle}>
                    {React.cloneElement(item.icon, { fontSize: 'large' })}
                  </div>
                  <Typography variant="subtitle1" style={labelStyle}>
                    {item.label}
                  </Typography>
                </Paper>
              </IconButton>
            </Grid>
          ))}
        </Grid>
      </div>
    </div>
  );
};

// Styles
const containerStyle = {
  position: 'relative',
  width: '100%',
  minHeight: '90vh',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
};

const backgroundStyle = {
  position: 'fixed',
  top: 0,
  left: 0,
  width: '100%',
  height: '100%',
  zIndex: 0,
};

const imageStyle = {
  width: '100%',
  height: '100%',
  objectFit: 'cover',
  filter: 'blur(4px)',
};

const overlayStyle = {
  position: 'absolute',
  top: 0,
  left: 0,
  width: '100%',
  height: '100%',
  backgroundColor: 'rgba(255, 255, 255, 0.8)',
};

const contentStyle = {
  position: 'relative',
  zIndex: 1,
  textAlign: 'center',
};

const titleStyle = {
  marginBottom: '2rem',
  color: '#fff',
  fontWeight: '600',
};

const cardStyle = {
  textDecoration: 'none',
  height: '100%',
};

const paperStyle = {
  padding: '1.5rem',
  width: '100%',
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'translateY(-5px)',
    backgroundColor: '#f8f9fa',
  },
};

const iconStyle = {
  marginBottom: '1rem',
  color: '#2d3436',
};

const labelStyle = {
  color: '#2d3436',
  fontWeight: '500',
  whiteSpace: 'nowrap',
};

export default Home;