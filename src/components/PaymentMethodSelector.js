import React, { useState } from 'react';
import { FormControl, InputLabel, Select, MenuItem, Paper } from '@mui/material';

const PaymentMethodSelector = ({ onSelectPaymentMethod }) => {
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState();

  const handleChange = (event) => {
    setSelectedPaymentMethod(event.target.value);
    onSelectPaymentMethod(event.target.value === 'now');
  };

  return (
    <Paper elevation={3} sx={{ padding: '20px', width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <FormControl fullWidth >
        <InputLabel id="payment-method-label">Payment Method</InputLabel>
        <Select
          labelId="payment-method-label"
          id="payment-method"
          value={selectedPaymentMethod}
          onChange={handleChange}
          label="Payment Method"
        >
          <MenuItem value="now" defaultChecked>Pay Now</MenuItem>
          <MenuItem value="later">Pay Later</MenuItem>
        </Select>
      </FormControl>
    </Paper>
  );
};

export default PaymentMethodSelector;
