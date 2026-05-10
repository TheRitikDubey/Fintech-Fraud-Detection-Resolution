import React from 'react';
import { Download, Plus } from 'lucide-react';
import TransactionsFilters from './components/TransactionsFilters';
import TransactionsTable from './components/TransactionsTable';
import SummaryCards from './components/SummaryCards';
import './TransactionsLedger.css';

const TransactionsLedger: React.FC = () => {
  return (
    <div className="ledger-container">
      <div className="ledger-header">
        <div className="title-section">
          <h1>Transactions Ledger</h1>
          <p>Monitoring real-time payment flows and security scoring.</p>
        </div>
        <div className="actions-section">
          <button className="btn btn-outline">
            <Download size={16} />
            Export CSV
          </button>
          <button className="btn btn-primary">
            <Plus size={16} />
            New Manual Entry
          </button>
        </div>
      </div>

      <TransactionsFilters />
      <TransactionsTable />
      <SummaryCards />
      
      <div className="system-footer">
        <div className="status">
          <span className="dot"></span>
          System Status: Operational
          <span className="version">Version 4.2.1-stable</span>
        </div>
        <div className="links">
          <a href="#">Privacy Policy</a>
          <a href="#">Support Center</a>
        </div>
      </div>
    </div>
  );
};

export default TransactionsLedger;
