import React from 'react';
import { Calendar, Download } from 'lucide-react';
import OverviewCards from './components/OverviewCards';
import TransactionChart from './components/TransactionChart';
import FraudChart from './components/FraudChart';
import RecentAlerts from './components/RecentAlerts';
import './DashboardOverview.css';

const DashboardOverview: React.FC = () => {
  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <div className="title-section">
          <h1>System Overview</h1>
          <p>Real-time health monitoring of fintech operations.</p>
        </div>
        <div className="actions-section">
          <button className="btn btn-outline">
            <Calendar size={16} />
            Last 24 Hours
          </button>
          <button className="btn btn-primary">
            <Download size={16} />
            Export Report
          </button>
        </div>
      </div>

      <OverviewCards />
      
      <div className="dashboard-charts-grid">
        <div className="chart-main">
          <TransactionChart />
        </div>
        <div className="chart-side">
          <FraudChart />
        </div>
      </div>

      <RecentAlerts />
    </div>
  );
};

export default DashboardOverview;
