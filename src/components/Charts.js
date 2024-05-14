import React from 'react';
import { Pie, Bar } from 'react-chartjs-2';

const Charts = ({ data }) => {
  // Function to transform data for the charts
  const transformDataForCharts = () => {
    // Initialize variables for pieChartData and barChartData
    let pieChartData = {};
    let barChartData = {};

    // Logic to transform data for pie chart
    pieChartData = {
      labels: data.map((item) => item.report_date), // Use report dates as labels
      datasets: [
        {
          label: 'Total Sales',
          data: data.map((item) => item.total_sales), // Use total sales as data
          backgroundColor: [
            'rgba(255, 99, 132, 0.6)',
            'rgba(54, 162, 235, 0.6)',
            'rgba(255, 206, 86, 0.6)',
            'rgba(75, 192, 192, 0.6)',
            'rgba(153, 102, 255, 0.6)',
            'rgba(255, 159, 64, 0.6)',
          ],
        },
      ],
    };

    // Logic to transform data for bar chart
    barChartData = {
      labels: data.map((item) => item.report_date), // Use report dates as labels
      datasets: [
        {
          label: 'Total Cash',
          data: data.map((item) => item.total_cash), // Use total cash as data
          backgroundColor: 'rgba(255, 99, 132, 0.6)',
        },
        {
          label: 'Total Cash Profit',
          data: data.map((item) => item.total_cash_profit), // Use total cash profit as data
          backgroundColor: 'rgba(54, 162, 235, 0.6)',
        },
        {
          label: 'Sales Of The Day',
          data: data.map((item) => item.sales_of_the_day), // Use sales of the day as data
          backgroundColor: 'rgba(255, 206, 86, 0.6)',
        },
      ],
    };

    return { pieChartData, barChartData };
  };

  const { pieChartData, barChartData } = transformDataForCharts();

  return (
    <div>
      <div>
        <h2>Pie Chart</h2>
        <Pie data={pieChartData} />
      </div>
      <div>
        <h2>Bar Chart</h2>
        <Bar data={barChartData} />
      </div>
    </div>
  );
};

export default Charts;
