import React, { useState } from 'react';
import { Paper, Typography, TextField, Button, Box } from '@mui/material';
import axios from 'axios';

const LoginForm = ({ onLogin }) => {
  const [credentials, setCredentials] = useState({
    username: '',
    password: ''
  });

  const handleChange = (event) => {
    const { name, value } = event.target;
    setCredentials({
      ...credentials,
      [name]: value
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      const response = await axios.post('/api/login', credentials); // Make POST request to /api/login
      console.log(response.data);

      // Store the token and tenant_id in localStorage
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('tenant_id', response.data.tenant_id);

      alert('Login successful!');
      onLogin(); // Call the onLogin prop to update the app state
    } catch (error) {
      console.error('Error:', error);
      alert('Invalid username or password. Please try again.');
    }
  };

  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
      <Paper elevation={3} sx={{ padding: '20px', maxWidth: '400px', width: '100%' }}>
        <Typography variant="h5" gutterBottom>
          Login
        </Typography>
        <form onSubmit={handleSubmit}>
          <TextField
            label="Username"
            variant="outlined"
            name="username"
            value={credentials.username}
            onChange={handleChange}
            fullWidth
            margin="normal"
            required
          />
          <TextField
            label="Password"
            variant="outlined"
            name="password"
            type="password"
            value={credentials.password}
            onChange={handleChange}
            fullWidth
            margin="normal"
            required
          />
          <Button type="submit" variant="contained" color="primary" fullWidth>
            Login
          </Button>
        </form>
      </Paper>
    </Box>
  );
};

export default LoginForm;