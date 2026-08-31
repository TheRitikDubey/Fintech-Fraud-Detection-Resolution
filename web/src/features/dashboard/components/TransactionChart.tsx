import React, { useEffect, useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { api } from '../../../api';
import './TransactionChart.css';

const BUCKET_HOURS = [0, 4, 8, 12, 16, 20];

const TransactionChart: React.FC = () => {
  const [data, setData] = useState(BUCKET_HOURS.map((h) => ({ time: `${String(h).padStart(2, '0')}:00`, count: 0 })));

  useEffect(() => {
    let cancelled = false;
    api.listTransactions({ limit: 100 }).then((res) => {
      if (cancelled) return;
      const counts = new Array(BUCKET_HOURS.length).fill(0);
      for (const txn of res.items) {
        const hour = new Date(txn.ts).getHours();
        let bucket = 0;
        for (let i = 0; i < BUCKET_HOURS.length; i++) if (hour >= BUCKET_HOURS[i]) bucket = i;
        counts[bucket] += 1;
      }
      setData(BUCKET_HOURS.map((h, i) => ({ time: `${String(h).padStart(2, '0')}:00`, count: counts[i] })));
    });
    return () => {
      cancelled = true;
    };
  }, []);

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
              allowDecimals={false}
            />
            <Tooltip
              cursor={{ fill: 'var(--bg-surface-hover)' }}
              contentStyle={{ borderRadius: 'var(--radius-md)', border: 'none', boxShadow: 'var(--shadow-md)' }}
            />
            <Bar dataKey="count" name="Transactions" fill="var(--brand-primary)" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default TransactionChart;
