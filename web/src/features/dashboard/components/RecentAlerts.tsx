import React from 'react';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import './RecentAlerts.css';

const ALERTS_DATA = [
  { id: '#AL-92834', type: 'Velocity Spike', user: 'user_8829@example.com', risk: 'CRITICAL', time: '2 mins ago' },
  { id: '#AL-92831', type: 'Geographic Mismatch', user: 'merchant_amazon_hub', risk: 'MEDIUM', time: '14 mins ago' },
  { id: '#AL-92828', type: 'Suspicious IP', user: 'user_1102@example.com', risk: 'HIGH', time: '32 mins ago' },
  { id: '#AL-92822', type: 'Card Testing', user: 'merchant_stripe_test', risk: 'HIGH', time: '1 hour ago' },
  { id: '#AL-92815', type: 'Micro-transactions', user: 'user_4493@example.com', risk: 'LOW', time: '2 hours ago' },
];

const RecentAlerts: React.FC = () => {
  const getRiskBadgeClass = (risk: string) => {
    switch (risk) {
      case 'CRITICAL':
      case 'HIGH':
        return 'danger';
      case 'MEDIUM':
        return 'warning';
      case 'LOW':
        return 'success';
      default:
        return 'default';
    }
  };

  return (
    <div className="recent-alerts-container">
      <div className="alerts-header">
        <h2>Recent Alerts</h2>
        <a href="#" className="view-all-link">View All Alerts</a>
      </div>

      <div className="table-responsive">
        <table className="alerts-table">
          <thead>
            <tr>
              <th>ALERT ID</th>
              <th>TYPE</th>
              <th>USER / ENTITY</th>
              <th>RISK LEVEL</th>
              <th>TIME</th>
              <th className="text-right">ACTION</th>
            </tr>
          </thead>
          <tbody>
            {ALERTS_DATA.map((alert, index) => (
              <tr key={index}>
                <td className="alert-id">{alert.id}</td>
                <td className="alert-type">{alert.type}</td>
                <td className="alert-user">{alert.user}</td>
                <td>
                  <span className={`risk-pill ${getRiskBadgeClass(alert.risk)}`}>
                    {alert.risk}
                  </span>
                </td>
                <td className="alert-time">{alert.time}</td>
                <td className="text-right">
                  <button className="action-link">Review</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination Container */}
      <div className="alerts-pagination">
        <span className="pagination-text">Showing 1 to 5 of 120 alerts</span>
        <div className="pagination-controls-group">
          <button className="page-btn-small"><ChevronLeft size={14} /></button>
          <button className="page-btn-small active">1</button>
          <button className="page-btn-small">2</button>
          <button className="page-btn-small">3</button>
          <span className="page-ellipsis">...</span>
          <button className="page-btn-small">24</button>
          <button className="page-btn-small"><ChevronRight size={14} /></button>
        </div>
      </div>

      {/* Floating Action Button */}
      <button className="fab-button">
        <Plus size={24} />
      </button>
    </div>
  );
};

export default RecentAlerts;
