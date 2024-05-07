import React from 'react';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import { Paper } from  '@mui/material';

const NumberKeyboard = ({ onNumberClick }) => {
  const handleClick = (number) => {
    // Pass the clicked number to the parent component
    onNumberClick(number);
  };

  return (
    <Paper elevation={3} sx={{ padding: '20px', width: '100%', display: 'flex', justifyContent: 'center'}}>
        <Grid container sx={{ width: '50%', display: 'flex', justifyContent: 'center' }}>
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 0].map((number) => (
            <Grid key={number} item xs={4} sx={{ display: 'flex', justifyContent: 'center' }}>
              <Button variant="contained" onClick={() => handleClick(number)}>
                {number}
              </Button>
            </Grid>
          ))}
        </Grid>
    </Paper>
  );
};

export default NumberKeyboard;
