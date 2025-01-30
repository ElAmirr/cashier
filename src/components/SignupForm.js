import React, { useState } from 'react';
import { Paper, Typography, TextField, Button, Box } from '@mui/material';
import axios from 'axios';

const SignupForm = () => {
  const [user, setUser] = useState({
    username: '',
    password: '',
    email: ''
  });

  const handleChange = (event) => {
    const { name, value } = event.target;
    setUser({
      ...user,
      [name]: value
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      const response = await axios.post('/api/signup', user); // Make POST request to /api/signup
      console.log(response.data);
      alert('Signup successful! Please login.');
      setUser({ username: '', password: '', email: '' }); // Clear form fields
    } catch (error) {
      console.error('Error:', error);
      alert('An error occurred during signup. Please try again.');
    }
  };

  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
      <Paper elevation={3} sx={{ padding: '20px', maxWidth: '400px', width: '100%' }}>
        <Typography variant="h5" gutterBottom>
          Signup
        </Typography>
        <form onSubmit={handleSubmit}>
          <TextField
            label="Username"
            variant="outlined"
            name="username"
            value={user.username}
            onChange={handleChange}
            fullWidth
            margin="normal"
            required
          />
          <TextField
            label="Email"
            variant="outlined"
            name="email"
            type="email"
            value={user.email}
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
            value={user.password}
            onChange={handleChange}
            fullWidth
            margin="normal"
            required
          />
          <Button type="submit" variant="contained" color="primary" fullWidth>
            Signup
          </Button>
        </form>
      </Paper>
    </Box>
  );
};

export default SignupForm;
