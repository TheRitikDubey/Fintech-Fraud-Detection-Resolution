import React, { useEffect, useState } from 'react';
import { api } from '../../../api';
import './FraudChart.css';

const FraudChart: React.FC = () => {
  const [safe, setSafe] = useState(0);
  const [fraud, setFraud] = useState(0);

  useEffect(() => {
    let cancelled = false;
    Promise.all([api.listAlerts({ limit: 100 }), api.listTransactions({ limit: 100 })]).then(([a, t]) => {
      if (cancelled) return;
      setFraud(a.items.length);
      setSafe(Math.max(0, t.items.length - a.items.length));
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const total = safe + fraud;
  const safePct = total === 0 ? 0 : (safe / total) * 100;
  const fraudPct = total === 0 ? 0 : (fraud / total) * 100;

  return (
    <div className="fraud-chart-container">
      <div>
        <h2>Fraud vs Safe</h2>

        <div className="progress-bars-container">
          <div className="progress-group">
            <div className="progress-header">
              <span className="progress-label">Safe Transactions</span>
              <span className="progress-value text-primary">{safePct.toFixed(1)}%</span>
            </div>
            <div className="progress-track">
              <div className="progress-fill fill-blue" style={{ width: `${safePct}%` }}></div>
            </div>
          </div>

          <div className="progress-group">
            <div className="progress-header">
              <span className="progress-label">Fraudulent Activity</span>
              <span className="progress-value text-danger">{fraudPct.toFixed(1)}%</span>
            </div>
            <div className="progress-track">
              <div className="progress-fill fill-red" style={{ width: `${fraudPct}%` }}></div>
            </div>
          </div>
        </div>
      </div>

      <div className="fraud-stats-container">
        <div className="stat-box">
          <span className="stat-label">Safe</span>
          <span className="stat-number">{safe.toLocaleString()}</span>
        </div>
        <div className="stat-box border-red">
          <span className="stat-label text-danger">Fraud</span>
          <span className="stat-number">{fraud.toLocaleString()}</span>
        </div>
      </div>
    </div>
  );
};

export default FraudChart;
