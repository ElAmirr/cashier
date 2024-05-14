import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { DataGrid } from '@mui/x-data-grid';
import { Box } from '@mui/material';

const Reports = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
  try {
    const response = await axios.get('/api/dailyreports');
    // Add a unique id to each row
    const reportsWithIds = response.data.map((report, index) => ({
      id: index + 1, // Assuming index starts from 0, you can adjust this if needed
      ...report,
    }));
    setReports(reportsWithIds);
    setLoading(false);
  } catch (error) {
    console.error('Error fetching reports:', error);
  }
};

  const columns = [
    { field: 'report_id', headerName: 'Report ID', width: 120 },
    { field: 'report_date', headerName: 'Report Date', width: 120 },
    { field: 'total_sales', headerName: 'Total Sales', width: 120,
      renderCell: (params) => (
        <span>{`${params.value} TND`}</span>
    ),
    },
    { field: 'total_cash', headerName: 'Total Cash', width: 120,
      renderCell: (params) => (
        <span>{`${params.value} TND`}</span>
      ),
    },
    { field: 'total_cash_profit', headerName: 'Total Cash Profit', width: 120,
      renderCell: (params) => (
        <span>{`${params.value} TND`}</span>
    ),
    },
    { field: 'sales_of_the_day', headerName: 'Sales Of The Day', width: 120,
      renderCell: (params) => (
        <span>{`${params.value} TND`}</span>
    ),
    },
    { field: 'credit_of_the_day', headerName: 'Credit Of the Day', width: 120,
      renderCell: (params) => (
        <span>{`${params.value} TND`}</span>
      ),
    },
    { field: 'credit_paid_of_the_day', headerName: 'Credit Paid Of the Day', width: 120,
    renderCell: (params) => (
      <span>{`${params.value} TND`}</span>
    ),
    },
  ];

  return (
    <div>
      <Box style={{ height: 480, width: '80%', margin: '20px auto' }}>
        <DataGrid
          rows={reports}
          columns={columns}
          pageSize={5}
          rowsPerPageOptions={[5, 10]}
          loading={loading}
        />
      </Box>
    </div>
  );
};

export default Reports;
