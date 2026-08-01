import React from 'react';
import './FraudChart.css';

const FraudChart: React.FC = () => {
  return (
    <div className="fraud-chart-container">
      <div>
        <h2>Fraud vs Safe</h2>
        
        <div className="progress-bars-container">
          {/* Safe Transactions Bar */}
          <div className="progress-group">
            <div className="progress-header">
              <span className="progress-label">Safe Transactions</span>
              <span className="progress-value text-primary">98.2%</span>
            </div>
            <div className="progress-track">
              <div className="progress-fill fill-blue" style={{ width: '98.2%' }}></div>
            </div>
          </div>

          {/* Fraudulent Activity Bar */}
          <div className="progress-group">
            <div className="progress-header">
              <span className="progress-label">Fraudulent Activity</span>
              <span className="progress-value text-danger">1.8%</span>
            </div>
            <div className="progress-track">
              <div className="progress-fill fill-red" style={{ width: '1.8%' }}></div>
            </div>
          </div>
        </div>
      </div>

      <div className="fraud-stats-container">
        <div className="stat-box">
          <span className="stat-label">Safe</span>
          <span className="stat-number">45,201</span>
        </div>
        <div className="stat-box border-red">
          <span className="stat-label text-danger">Fraud</span>
          <span className="stat-number">829</span>
        </div>
      </div>
    </div>
  );
};

export default FraudChart;
