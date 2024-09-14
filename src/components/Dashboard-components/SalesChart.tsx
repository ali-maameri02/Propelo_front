import React, { useEffect, useState } from 'react';
import { PieChart, Pie, Cell, Legend, Tooltip } from 'recharts'; // Recharts library for pie chart
import { Slide } from "react-awesome-reveal";
import { Box, Typography } from '@mui/material';
import { fetchSoldApartmentsData } from '../Dashboard-pages/utils/apiUtils'; // Adjust path if necessary
import '../style.css';

// Define the data type for the pie chart
interface PieChartData {
  name: string;
  value: number;
}

const SalesChart: React.FC = () => {
  const [data, setData] = useState<PieChartData[]>([]);

  useEffect(() => {
    const loadData = async () => {
      const { sold, unsold } = await fetchSoldApartmentsData();
      setData([
        { name: 'Vendu', value: sold },   // Translated 'Sold' to 'Vendu'
        { name: 'Invendu', value: unsold }, // Translated 'Unsold' to 'Invendu'
      ]);
    };

    loadData();
  }, []);

  // Colors for the pie chart segments
  const COLORS = ['#2563EB', '#b1b4be'];

  return (
    <Slide className="" direction="up">
      <Box className="relative h-96 w-full">
        <Slide>
          <Typography variant="h6" gutterBottom>
            Appartements Vendus vs Invendus {/* Translated 'Apartments Sold vs Unsold' */}
          </Typography>
        </Slide>
        <Slide delay={50} className='w-100'>
          <Typography variant="h4" className='flex flex-row w-100' gutterBottom>
            {/* Placeholder for total sales, adjust as needed */}
            Total des Appartements: {data.reduce((sum, item) => sum + item.value, 0)} {/* Translated 'Total Apartments' */}
          </Typography>
        </Slide>
        <Box className="chart-container">
          <PieChart width={1000} height={400}>
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              outerRadius={150}
              fill="#8884d8"
              label
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Legend />
            <Tooltip />
          </PieChart>
        </Box>
      </Box>
    </Slide>
  );
};

export default SalesChart;
