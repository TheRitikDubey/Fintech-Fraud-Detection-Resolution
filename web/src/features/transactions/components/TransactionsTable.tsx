import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import StatusBadge from './StatusBadge';
import './TransactionsTable.css';

const MOCK_DATA = [
  {
    id: 'TXN-849201',
    cardType: 'Visa Debit',
    cardEnd: '4210',
    customerId: 'CUST-9021',
    amount: '$1,240.50',
    merchant: 'Apple Store Soho',
    merchantIcon: '🍎',
    location: 'New York, US',
    timestamp: 'Oct 24, 2023 14:32',
    riskScore: 88,
    riskLevel: 'high',
    status: 'pending'
  },
  {
    id: 'TXN-849202',
    cardType: 'Mastercard',
    cardEnd: '9901',
    customerId: 'CUST-4432',
    amount: '$42.15',
    merchant: 'Starbucks #442',
    merchantIcon: '☕',
    location: 'Seattle, US',
    timestamp: 'Oct 24, 2023 14:35',
    riskScore: 12,
    riskLevel: 'low',
    status: 'completed'
  },
  {
    id: 'TXN-849203',
    cardType: 'Amex',
    cardEnd: '1004',
    customerId: 'CUST-1120',
    amount: '$3,400.00',
    merchant: 'Delta Airlines',
    merchantIcon: '✈️',
    location: 'London, GB',
    timestamp: 'Oct 24, 2023 14:38',
    riskScore: 45,
    riskLevel: 'med',
    status: 'flagged'
  },
  {
    id: 'TXN-849204',
    cardType: 'Visa Debit',
    cardEnd: '8821',
    customerId: 'CUST-8871',
    amount: '$256.40',
    merchant: 'Amazon Marketplace',
    merchantIcon: '📦',
    location: 'Berlin, DE',
    timestamp: 'Oct 24, 2023 15:02',
    riskScore: 8,
    riskLevel: 'low',
    status: 'completed'
  }
];

const TransactionsTable: React.FC = () => {
  return (
    <div className="table-container">
      <table className="transactions-table">
        <thead>
          <tr>
            <th className="checkbox-col"><input type="checkbox" /></th>
            <th>TRANSACTION ID</th>
            <th>CUSTOMER ID</th>
            <th>AMOUNT</th>
            <th>MERCHANT</th>
            <th>LOCATION</th>
            <th>TIMESTAMP</th>
            <th>RISK SCORE</th>
            <th>STATUS</th>
          </tr>
        </thead>
        <tbody>
          {MOCK_DATA.map((txn, index) => (
            <tr key={index}>
              <td className="checkbox-col"><input type="checkbox" /></td>
              <td>
                <div className="txn-id-cell">
                  <span className="txn-id">{txn.id}</span>
                  <span className="txn-card">{txn.cardType} **** {txn.cardEnd}</span>
                </div>
              </td>
              <td>
                <span className="customer-id">{txn.customerId}</span>
              </td>
              <td>
                <span className="amount">{txn.amount}</span>
              </td>
              <td>
                <div className="merchant-cell">
                  <span className="merchant-icon">{txn.merchantIcon}</span>
                  <span className="merchant-name">{txn.merchant}</span>
                </div>
              </td>
              <td>
                <div className="location-cell">
                  <span className="city">{txn.location.split(',')[0]}</span>
                  <span className="country">{txn.location.split(',')[1]}</span>
                </div>
              </td>
              <td>
                <div className="timestamp-cell">
                  <span className="date">{txn.timestamp.split(' ')[0]} {txn.timestamp.split(' ')[1]} {txn.timestamp.split(' ')[2]}</span>
                  <span className="time">{txn.timestamp.split(' ')[3]}</span>
                </div>
              </td>
              <td>
                <StatusBadge type="risk" value={txn.riskLevel} score={txn.riskScore} />
              </td>
              <td>
                <StatusBadge type="status" value={txn.status} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      
      <div className="pagination">
        <span className="pagination-info">Showing 1 to 4 of 2,492 transactions</span>
        <div className="pagination-controls">
          <button className="page-btn"><ChevronLeft size={16} /></button>
          <button className="page-btn active">1</button>
          <button className="page-btn">2</button>
          <button className="page-btn">3</button>
          <span className="page-ellipsis">...</span>
          <button className="page-btn">249</button>
          <button className="page-btn"><ChevronRight size={16} /></button>
        </div>
      </div>
    </div>
  );
};

export default TransactionsTable;
