import React from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TableFooter } from '@mui/material';

const DailyReportDialog = ({ open, onClose, totalSales, cash, credit, cashProfit, creditPaid, creditPaidProfit, handlePrint, startDate, startTime, endTime }) => {
  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Daily Report: {startDate}</DialogTitle>
      <DialogContent>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Type</TableCell>
                <TableCell>Amount</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              <TableRow>
                <TableCell>Total Sales</TableCell>
                <TableCell>{totalSales} TND</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Total Cash</TableCell>
                <TableCell>{cash + creditPaid} TND</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Total Cash Profit</TableCell>
                <TableCell>{cashProfit + creditPaidProfit} TND</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Sales Of The Day</TableCell>
                <TableCell>{cash} TND</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Credit Of The Day</TableCell>
                <TableCell>{credit} TND</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Credit Paid Of the Day</TableCell>
                <TableCell>{creditPaid} TND</TableCell>
              </TableRow>
            </TableBody>
            <TableFooter sx={{ marginTop: '20px' }}>Open at:{startTime} - Close at: {endTime}</TableFooter>
          </Table>
        </TableContainer>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="primary" variant="outlined" className="print-only">
          Close
        </Button>
        <Button onClick={handlePrint} color="primary" variant="contained" className="print-only">
          Print
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DailyReportDialog;
