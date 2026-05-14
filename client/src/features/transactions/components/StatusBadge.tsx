import React from 'react';
import './StatusBadge.css';

interface StatusBadgeProps {
  type: 'status' | 'risk';
  value: string;
  score?: number;
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ type, value, score }) => {
  const getBadgeClass = () => {
    const val = value.toLowerCase();
    if (val === 'high' || val === 'flagged') return 'danger';
    if (val === 'low' || val === 'completed') return 'success';
    if (val === 'med' || val === 'pending') return 'warning';
    return 'default';
  };

  const badgeClass = `badge-pill ${getBadgeClass()}`;

  if (type === 'risk') {
    return (
      <div className={`risk-badge ${getBadgeClass()}`}>
        <span className="dot"></span>
        <div className="risk-content">
          <span className="score">{score}</span>
          <span className="label">{value.toUpperCase()}</span>
        </div>
      </div>
    );
  }

  return (
    <div className={badgeClass}>
      {value.toUpperCase()}
    </div>
  );
};

export default StatusBadge;
