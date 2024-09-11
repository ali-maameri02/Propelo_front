import React from 'react';
import { BarChart } from '@mui/x-charts/BarChart';
import { Slide } from "react-awesome-reveal";

import { Box, Typography } from '@mui/material';
import '../style.css';

interface DataItem {
  name: string;
  current: number;
  previous: number;
}

const data: DataItem[] = [
  { name: '01', current: 400, previous: 240 },
  { name: '02', current: 300, previous: 139 },
  { name: '03', current: 200, previous: 980 },
  { name: '04', current: 278, previous: 390 },
  { name: '05', current: 189, previous: 480 },
  { name: '06', current: 239, previous: 380 },
  { name: '07', current: 349, previous: 430 },
  { name: '08', current: 450, previous: 210 },
  { name: '09', current: 300, previous: 410 },
  { name: '10', current: 400, previous: 240 },
  { name: '11', current: 350, previous: 400 },
  { name: '12', current: 480, previous: 360 },
];

const SalesChart: React.FC = () => {
  return (
    <Slide className="" direction="up">

    <Box className="relative h-96 w-full">
      <Slide>
         <Typography variant="h6" gutterBottom>
        Sales
      </Typography>
      </Slide>
      <Slide delay={50}>

      <Typography variant="h4" gutterBottom>
        DZD 7,852,000
      </Typography></Slide>

      <Slide direction='left' delay={150}>
      <Typography variant="body1" color="green">
        2.3% vs last week
      </Typography></Slide>
      <Box className="chart-container">
        
      <BarChart
          xAxis={[
            {
              data: data.map((item) => item.name),
              scaleType: 'band',
            },
          ]}
          series={[
            { data: data.map((item) => item.current), label: 'Last 8 days', color: '#2563EB' },
            { data: data.map((item) => item.previous), label: 'Last Week', color: '#d3d3d3' },
          ]}
          width={1000}
          height={400}
          margin={{ top: 20, right: 30, bottom: 80, left: 100 }} // Increased bottom margin
          legend={{
            position: { vertical: 'bottom', horizontal: 'middle' },
            direction: 'row',
            // Align the items in the center
          }}
        />
      </Box>
    </Box></Slide>
  );
};

export default SalesChart;
