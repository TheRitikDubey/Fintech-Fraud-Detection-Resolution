import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../../api';
import type { AlertDTO } from '../../../api';
import { timeAgo } from '../../../lib/format';
import './RecentAlerts.css';

const RecentAlerts: React.FC = () => {
  const [alerts, setAlerts] = useState<AlertDTO[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    api
      .listAlerts({ limit: 5 })
      .then((res) => !cancelled && setAlerts(res.items))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, []);

  const getRiskBadgeClass = (risk: string) => {
    switch (risk) {
      case 'CRITICAL':
      case 'HIGH':
        return 'danger';
      case 'MEDIUM':
        return 'warning';
      default:
        return 'success';
    }
  };

  return (
    <div className="recent-alerts-container">
      <div className="alerts-header">
        <h2>Recent Alerts</h2>
        <Link to="/alerts" className="view-all-link">View All Alerts</Link>
      </div>

      <div className="table-responsive">
        <table className="alerts-table">
          <thead>
            <tr>
              <th>ALERT ID</th>
              <th>REASON</th>
              <th>CUSTOMER</th>
              <th>RISK LEVEL</th>
              <th>TIME</th>
              <th className="text-right">ACTION</th>
            </tr>
          </thead>
          <tbody>
            {!loading && alerts.length === 0 && (
              <tr>
                <td colSpan={6} className="alert-time">No alerts yet.</td>
              </tr>
            )}
            {alerts.map((alert) => (
              <tr key={alert.id}>
                <td className="alert-id">#{alert.id.slice(0, 8)}</td>
                <td className="alert-type">{alert.reasons[0]?.code.replace(/_/g, ' ') ?? 'Anomaly'}</td>
                <td className="alert-user">{alert.customerId}</td>
                <td>
                  <span className={`risk-pill ${getRiskBadgeClass(alert.severity)}`}>
                    {alert.severity}
                  </span>
                </td>
                <td className="alert-time">{timeAgo(alert.createdAt)}</td>
                <td className="text-right">
                  <Link to="/alerts" className="action-link">Review</Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="alerts-pagination">
        <span className="pagination-text">Showing {alerts.length} recent alert(s)</span>
      </div>
    </div>
  );
};

export default RecentAlerts;
