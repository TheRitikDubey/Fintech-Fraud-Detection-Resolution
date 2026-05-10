import React from 'react';
import { ChevronDown, Filter } from 'lucide-react';
import './TransactionsFilters.css';

const TransactionsFilters: React.FC = () => {
  return (
    <div className="filters-container">
      <div className="filter-group">
        <label>DATE RANGE</label>
        <div className="dropdown">
          <span>Last 24 Hours</span>
          <ChevronDown size={16} className="icon-subtle" />
        </div>
      </div>
      
      <div className="filter-group">
        <label>RISK LEVEL</label>
        <div className="dropdown">
          <span>All Risk Levels</span>
          <ChevronDown size={16} className="icon-subtle" />
        </div>
      </div>
      
      <div className="filter-group">
        <label>STATUS</label>
        <div className="dropdown">
          <span>All Statuses</span>
          <ChevronDown size={16} className="icon-subtle" />
        </div>
      </div>
      
      <div className="filter-group amount-group">
        <label>AMOUNT RANGE</label>
        <div className="amount-inputs">
          <input type="text" placeholder="Min" />
          <span className="separator">to</span>
          <input type="text" placeholder="Max" />
        </div>
      </div>
      
      <div className="filter-action">
        <button className="icon-btn-filter">
          <Filter size={20} color="#004DFF" />
        </button>
      </div>
    </div>
  );
};

export default TransactionsFilters;
