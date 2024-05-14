import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { AppBar, Toolbar, Typography, IconButton, Drawer, List, ListItem, ListItemText } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';

function NavBar() {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    // Clear the interval on component unmount
    return () => clearInterval(timer);
  }, []);

  const toggleDrawer = () => {
    setIsDrawerOpen(!isDrawerOpen);
  };

  // Format the current time to "Month Day Hour:Minute"
  const formattedTime = currentTime.toLocaleString('default', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div>
      <AppBar position="static">
        <Toolbar sx={{ display:"flex", justifyContent:"space-between" }}>
          <List sx={{ display: { sm:'flex', xs: 'none' } }}>
            <ListItem component={Link} to="/" sx={{ textDecoration: 'none' }} >
              <ListItemText primary="Home" sx={{ color: 'white' }} />
            </ListItem>
            <ListItem component={Link} to="/products" sx={{ textDecoration: 'none' }} >
              <ListItemText primary="Products" sx={{ color: 'white' }} />
            </ListItem>
            <ListItem component={Link} to="/checkout" sx={{ textDecoration: 'none' }} >
              <ListItemText primary="Checkout" sx={{ color: 'white' }} />
            </ListItem>
            <ListItem component={Link} to="/add_product" sx={{ textDecoration: 'none' }} >
              <ListItemText primary="Add Product" sx={{ color: 'white', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }} />
            </ListItem>
            <ListItem component={Link} to="/clients" sx={{ textDecoration: 'none' }} >
              <ListItemText primary="Clients" sx={{ color: 'white', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }} />
            </ListItem>
            <ListItem component={Link} to="/orders" sx={{ textDecoration: 'none' }} >
              <ListItemText primary="Orders" sx={{ color: 'white', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }} />
            </ListItem>
            <ListItem component={Link} to="/reports" sx={{ textDecoration: 'none' }} >
              <ListItemText primary="Reports" sx={{ color: 'white', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }} />
            </ListItem>
          </List>
          <Typography variant="h6" component="div" sx={{ }}>
            {formattedTime}
          </Typography>
          <IconButton
            edge="start"
            color="inherit"
            aria-label="menu"
            onClick={toggleDrawer}
            sx={{ display: { xs: 'block', sm: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
        </Toolbar>
      </AppBar>
      <Drawer
        anchor="left"
        open={isDrawerOpen}
        onClose={toggleDrawer}
      >
        <List>
          <ListItem component={Link} to="/" onClick={toggleDrawer}>
            <ListItemText primary="Home" />
          </ListItem>
          <ListItem component={Link} to="/products" onClick={toggleDrawer}>
            <ListItemText primary="Products" />
          </ListItem>
          <ListItem component={Link} to="/checkout" onClick={toggleDrawer}>
            <ListItemText primary="Checkout" />
          </ListItem>
          <ListItem component={Link} to="/add_product" onClick={toggleDrawer}>
            <ListItemText primary="Add Product" />
          </ListItem>
          <ListItem component={Link} to="/clients" sx={{ textDecoration: 'none' }} >
              <ListItemText primary="Clients" sx={{ color: 'white', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }} />
            </ListItem>
          <ListItem component={Link} to="/orders" onclick={toggleDrawer}>
            <ListItemText primary="Orders" />
          </ListItem>
            <ListItem component={Link} to="/reports" sx={{ textDecoration: 'none' }} >
              <ListItemText primary="Reports" sx={{ color: 'white', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }} />
            </ListItem>
        </List>
      </Drawer>
    </div>
  );
}

export default NavBar;
