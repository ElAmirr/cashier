import React from 'react';
import { FormControl, InputLabel, Select, MenuItem } from '@mui/material';

const PaymentMethodSelector = ({ onSelectMethod }) => {
  const [paymentMethod, setPaymentMethod] = React.useState(true);

  const handleChange = (event) => {
    const method = event.target.value;
    setPaymentMethod(method);
    onSelectMethod(method); // Ensure this is a function
  };

  return (
    <FormControl fullWidth variant="outlined" margin="normal">
      <InputLabel>Payment Method</InputLabel>
      <Select
        value={paymentMethod}
        onChange={handleChange}
        label="Payment Method"
      >
        <MenuItem value={true}>Cash</MenuItem>
        <MenuItem value={false}>Credit</MenuItem>
      </Select>
    </FormControl>
  );
};

export default PaymentMethodSelector;