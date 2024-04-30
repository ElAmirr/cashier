import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { AppBar, Toolbar, Typography, IconButton, Drawer, List, ListItem, ListItemText } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';


function NavBar() {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const toggleDrawer = () => {
    setIsDrawerOpen(!isDrawerOpen);
  };

  return (
    <div>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Inventory App
          </Typography>
          <List sx={{ display: { sm:'flex', xs: 'none' } }}>
            <ListItem component={Link} to="/" sx={{ textDecoration: 'none' }} >
              <ListItemText primary="Home" sx={{ color: 'white' }} />
            </ListItem>
            <ListItem component={Link} to="/products" sx={{ textDecoration: 'none' }} >
              <ListItemText primary="Products" sx={{ color: 'white' }} />
            </ListItem>
            <ListItem component={Link} to="/orders" sx={{ textDecoration: 'none' }} >
              <ListItemText primary="Orders" sx={{ color: 'white' }} />
            </ListItem>
            <ListItem component={Link} to="/add_product" sx={{ textDecoration: 'none' }} >
              <ListItemText primary="Add Product" sx={{ color: 'white', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }} />
            </ListItem>
          </List>
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
          <ListItem component={Link} to="/orders" onClick={toggleDrawer}>
            <ListItemText primary="Orders" />
          </ListItem>
          <ListItem component={Link} to="/add_product" onClick={toggleDrawer}>
            <ListItemText primary="Add Product" />
          </ListItem>
        </List>
      </Drawer>
    </div>
  );
}

export default NavBar;
