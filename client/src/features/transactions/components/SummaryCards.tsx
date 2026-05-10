import React from 'react';
import { AlertTriangle, CheckCircle2, TrendingUp, BarChart3 } from 'lucide-react';
import './SummaryCards.css';

const SummaryCards: React.FC = () => {
  return (
    <div className="summary-cards-container">
      <div className="summary-card">
        <div className="card-header">
          <span className="card-title">ACTIVE FLAGS</span>
          <AlertTriangle size={18} color="var(--status-danger)" />
        </div>
        <div className="card-content">
          <div className="card-value danger">18</div>
          <div className="card-trend danger">
            <TrendingUp size={14} />
            <span>+4 from last hour</span>
          </div>
        </div>
      </div>

      <div className="summary-card">
        <div className="card-header">
          <span className="card-title">APPROVAL RATE</span>
          <CheckCircle2 size={18} color="var(--status-success)" />
        </div>
        <div className="card-content">
          <div className="card-value">94.2%</div>
          <div className="card-trend success">
            <TrendingUp size={14} />
            <span>Stable vs. Average</span>
          </div>
        </div>
      </div>

      <div className="summary-card">
        <div className="card-header">
          <span className="card-title">SETTLEMENT VOL</span>
          <BarChart3 size={18} color="var(--brand-primary)" />
        </div>
        <div className="card-content">
          <div className="card-value">$1.8M</div>
          <div className="card-trend default">
            <span className="dot-small"></span>
            <span>Rolling 24h window</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SummaryCards;
