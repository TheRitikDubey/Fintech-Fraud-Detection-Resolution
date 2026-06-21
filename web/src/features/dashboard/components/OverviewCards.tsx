import React from 'react';
import { Banknote, ShieldAlert, CheckCircle2, ClipboardList } from 'lucide-react';
import './OverviewCards.css';

const OverviewCards: React.FC = () => {
  return (
    <div className="overview-cards-grid">
      {/* Total Transactions Card */}
      <div className="overview-card">
        <div className="card-top">
          <div className="icon-wrapper blue-bg">
            <Banknote size={20} className="icon-blue" />
          </div>
          <span className="trend-badge success">
            +12% trend
          </span>
        </div>
        <div className="card-bottom">
          <span className="card-label">Total Transactions Today</span>
          <span className="card-value">$1.2M</span>
        </div>
      </div>

      {/* Fraud Alerts Card */}
      <div className="overview-card">
        <div className="card-top">
          <div className="icon-wrapper red-bg">
            <ShieldAlert size={20} className="icon-red" />
          </div>
          <span className="trend-badge danger">
            High risk
          </span>
        </div>
        <div className="card-bottom">
          <span className="card-label">Fraud Alerts Triggered</span>
          <span className="card-value">24</span>
        </div>
      </div>

      {/* Auto-Resolved Cases Card */}
      <div className="overview-card">
        <div className="card-top">
          <div className="icon-wrapper emerald-bg">
            <CheckCircle2 size={20} className="icon-emerald" />
          </div>
        </div>
        <div className="card-bottom">
          <span className="card-label">Auto-Resolved Cases</span>
          <span className="card-value">156</span>
        </div>
      </div>

      {/* Pending Reviews Card */}
      <div className="overview-card">
        <div className="card-top">
          <div className="icon-wrapper amber-bg">
            <ClipboardList size={20} className="icon-amber" />
          </div>
          <span className="trend-badge warning">
            Attention needed
          </span>
        </div>
        <div className="card-bottom">
          <span className="card-label">Pending Reviews</span>
          <span className="card-value">12</span>
        </div>
      </div>
    </div>
  );
};

export default OverviewCards;
