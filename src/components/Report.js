import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Box, TextField, Typography, Button } from '@mui/material';

const Report = () => {
  const [totalSales, setTotalSales] = useState(0);
  const [cash, setCash] = useState(0);
  const [credit, setCredit] = useState(0);
  const [cashProfit, setCashProfit] = useState(0);
  const [creditPaid, setCreditPaid] = useState(0);
  const [creditPaidProfit, setCreditPaidProfit] = useState(0);
  const [startDate, setStartDate] = useState(); // Default to today's date
  const [startTime, setStartTime] = useState();
  const [endDate, setEndDate] = useState(); // Default to today's date
  const [endTime, setEndTime] = useState();

  useEffect(() => {
    // Fetch server start time and set it as default for startDate and startTime
    const fetchStartTime = async () => {
      try {
        const startTimeResponse = await axios.get('/api/app-start-time');
        const serverStartTime = new Date(startTimeResponse.data.start_time);
        setStartDate(serverStartTime.toISOString().slice(0, 10)); // Set startDate as YYYY-MM-DD format
        setStartTime(serverStartTime.toTimeString().slice(0, 5)); // Set startTime as HH:MM format
        setEndDate(serverStartTime.toISOString().slice(0, 10)); // Set endDate as YYYY-MM-DD format
        const now = new Date();
        const hours = now.getHours().toString().padStart(2, '0'); // Add leading zero if needed
        const minutes = now.getMinutes().toString().padStart(2, '0'); // Add leading zero if needed
        const currentTime = `${hours}:${minutes}`;
        setEndTime(currentTime); // Set endTime as HH:MM format
      } catch (error) {
        console.error('Error fetching server start time:', error);
      }
    };

    fetchStartTime();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch total sales, profit, cash, credit, and cash_profit from the combined endpoint
        const reportResponse = await axios.get('/api/reports', {
          params: { startDate, startTime, endDate, endTime }
        });

        setTotalSales(reportResponse.data.total_sales);
        setCash(reportResponse.data.cash);
        setCredit(reportResponse.data.credit);
        setCashProfit(reportResponse.data.cash_profit); // Fetch cash_profit data
        setCreditPaid(reportResponse.data.credit_paid);
        setCreditPaidProfit(reportResponse.data.credit_paid_profit);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, [startDate, startTime, endDate, endTime]);

  // Function to handle printing
  const handlePrint = () => {
    window.print();
  };

   // Inline styles for printing
   const printStyles = `
   @media print {
     .print-only {
       display: none;
     }
   }
 `;

  return (
    <Box mt={2} sx={{
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center'
      }}>
      <style>{printStyles}</style> {/* Apply the print styles */}
      <Typography>Total Sales Report</Typography>
      <Box mt={4}  sx={{ width: '100%', display: 'flex', justifyContent: 'center', gap:'20px' }}>
        <TextField 
          id="start-date"
          label="Start Date"
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          InputLabelProps={{
            shrink: true,
          }}
        />
        <TextField
          id="start-time"
          label="Start Time"
          type="time"
          value={startTime}
          onChange={(e) => setStartTime(e.target.value)}
          InputLabelProps={{
            shrink: true,
          }}
        />
      </Box>
      <Box mt={4}  sx={{ width: '100%', display: 'flex', justifyContent: 'center', gap:'20px' }}>
        <TextField
          id="end-date"
          label="End Date"
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          InputLabelProps={{
            shrink: true,
          }}
        />
        <TextField
          id="end-time"
          label="End Time"
          type="time"
          value={endTime}
          onChange={(e) => setEndTime(e.target.value)}
          InputLabelProps={{
            shrink: true,
          }}
        />
      </Box>
      <Typography mt={4}>Total Sales: {totalSales} DT</Typography>
      <Typography mt={2}>Total Cash : {cash + creditPaid} DT</Typography>
      <Typography mt={2}>Cash Profit: {cashProfit} DT</Typography> {/* Display cash profit */}
      <Typography mt={2}>Credit: {credit} DT</Typography>
      <Typography mt={2}>Credit Paid: {creditPaid} DT</Typography>
      <Typography mt={2}>Credit Paid Profit: {creditPaidProfit} DT</Typography>
      <Button onClick={handlePrint}  color="primary" variant="contained" className="print-only">
          Print
      </Button>
    </Box>
  );
};

export default Report;
