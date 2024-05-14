import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Box, Typography, Button } from '@mui/material';
import DailyReportDialog from './DailyReportDialog';

const DailyReport = () => {
  const [open, setOpen] = useState(false); // State to control the dialog visibility
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

  const [totalCash, setTotalCash] = useState(0);
  const [totalCashProfit, setTotalCashProfit] = useState(0);
  const [salesOfTheDay, setSalesOfTheDay] = useState(0);
  const [creditOfTheDay, setCreditOfTheDay] = useState(0);
  const [creditPaidOfTheDay, setCreditPaidOfTheDay] = useState(0);
  

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
        setTotalCash(reportResponse.data.cash+reportResponse.data.credit_paid);
        setTotalCashProfit(reportResponse.data.cash_profit+reportResponse.data.credit_paid_profit);
        setSalesOfTheDay(reportResponse.data.cash);
        setCreditOfTheDay(reportResponse.data.credit);
        setCreditPaidOfTheDay(reportResponse.data.credit_paid);
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

  // Function to handle opening the dialog
  const handleOpenDialog = () => {
    setOpen(true);
  };

  // Function to handle closing the dialog
  const handleCloseDialog = () => {
    setOpen(false);
  };

  const handleNewReport = async () => {
    try {
      // Delete orders where payment is 1 or 3
      await axios.delete('/api/orders');

      // Add a new report
      await axios.post('/api/reports', {
        totalSales,
        totalCash,
        totalCashProfit,
        salesOfTheDay, // Placeholder value, replace with actual value
        creditOfTheDay, // Placeholder value, replace with actual value
        creditPaidOfTheDay, // Placeholder value, replace with actual value
      });
      console.log('New Report added successfully');
      alert('New Report added successfully');
      // After the POST request is completed, reload the page
      window.location.reload();
    } catch (error) {
      console.error('Error adding new Report:', error);
      alert('An error occurred while adding the new report.');
    }
  };

  return (
    <Box mt={2} sx={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <Typography>Total Sales Report</Typography>
      <Box mt={4} sx={{ width: '100%', display: 'flex', justifyContent: 'center', gap: '20px' }}>
        <Button variant="contained" onClick={handleOpenDialog}>Today Report</Button>
        <Button color="error" variant="contained" onClick={handleNewReport}>
          Submit Report
        </Button>
      </Box>
      <DailyReportDialog
        open={open}
        onClose={handleCloseDialog}
        totalSales={totalSales}
        cash={cash}
        credit={credit}
        cashProfit={cashProfit}
        creditPaid={creditPaid}
        creditPaidProfit={creditPaidProfit}
        handlePrint={handlePrint}
        startDate={startDate}
        startTime={startTime}
        endTime={endTime}
      />
    </Box>
  );
};

export default DailyReport;
