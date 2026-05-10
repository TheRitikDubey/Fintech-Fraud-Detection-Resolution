import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';
import './TransactionChart.css';

const data = [
  { time: '00:00', current: 200, previous: 150 },
  { time: '04:00', current: 300, previous: 200 },
  { time: '08:00', current: 600, previous: 400 },
  { time: '12:00', current: 900, previous: 650 },
  { time: '16:00', current: 750, previous: 500 },
  { time: '20:00', current: 400, previous: 350 },
  { time: '23:59', current: 300, previous: 250 },
];

const TransactionChart: React.FC = () => {
  return (
    <div className="transaction-chart-container">
      <div className="chart-header">
        <h2>Transaction Volume</h2>
      </div>
      <div className="chart-wrapper">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{ top: 5, right: 0, left: -20, bottom: 5 }}
            barSize={32}
            barGap={8}
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-subtle)" />
            <XAxis 
              dataKey="time" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: 'var(--text-tertiary)', fontSize: 12 }} 
              dy={10}
            />
            <YAxis 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: 'var(--text-tertiary)', fontSize: 12 }}
            />
            <Tooltip 
              cursor={{ fill: 'var(--bg-surface-hover)' }}
              contentStyle={{ borderRadius: 'var(--radius-md)', border: 'none', boxShadow: 'var(--shadow-md)' }}
            />
            <Legend 
              verticalAlign="top" 
              align="right" 
              iconType="circle"
              wrapperStyle={{ paddingBottom: '20px', fontSize: '10px', fontWeight: '600', color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '1px' }}
            />
            <Bar dataKey="current" name="CURRENT" fill="var(--brand-primary)" radius={[4, 4, 0, 0]} />
            <Bar dataKey="previous" name="PREVIOUS" fill="#BFDBFE" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default TransactionChart;
