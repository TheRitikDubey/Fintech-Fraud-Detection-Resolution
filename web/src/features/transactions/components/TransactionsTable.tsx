import React, { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import StatusBadge from './StatusBadge';
import { api } from '../../../api';
import type { TransactionDTO } from '../../../api';
import { formatMoney, formatDateTime } from '../../../lib/format';
import './TransactionsTable.css';

const PAGE_SIZE = 20;

const TransactionsTable: React.FC = () => {
  const [items, setItems] = useState<TransactionDTO[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [pageCursor, setPageCursor] = useState<string | null>(null);
  const [prevStack, setPrevStack] = useState<Array<string | null>>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    api
      .listTransactions({ cursor: pageCursor ?? undefined, limit: PAGE_SIZE })
      .then((res) => {
        if (cancelled) return;
        setItems(res.items);
        setNextCursor(res.nextCursor);
      })
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [pageCursor]);

  const goNext = () => {
    if (!nextCursor) return;
    setPrevStack((s) => [...s, pageCursor]);
    setPageCursor(nextCursor);
  };
  const goPrev = () => {
    if (prevStack.length === 0) return;
    setPageCursor(prevStack[prevStack.length - 1]);
    setPrevStack((s) => s.slice(0, -1));
  };

  return (
    <div className="table-container">
      <table className="transactions-table">
        <thead>
          <tr>
            <th>TRANSACTION ID</th>
            <th>CUSTOMER ID</th>
            <th>AMOUNT</th>
            <th>MERCHANT</th>
            <th>LOCATION</th>
            <th>TIMESTAMP</th>
            <th>STATUS</th>
          </tr>
        </thead>
        <tbody>
          {!loading && items.length === 0 && (
            <tr>
              <td colSpan={7} className="txn-id">No transactions yet — upload a batch from the dashboard.</td>
            </tr>
          )}
          {items.map((txn) => (
            <tr key={txn.id}>
              <td>
                <div className="txn-id-cell">
                  <span className="txn-id">{txn.txnId}</span>
                </div>
              </td>
              <td>
                <span className="customer-id">{txn.customerId}</span>
              </td>
              <td>
                <span className="amount">{formatMoney(txn.amountCents, txn.currency)}</span>
              </td>
              <td>
                <div className="merchant-cell">
                  <span className="merchant-name">{txn.merchant || '—'}</span>
                </div>
              </td>
              <td>
                <div className="location-cell">
                  <span className="city">{txn.city || '—'}</span>
                  <span className="country">{txn.country}</span>
                </div>
              </td>
              <td>
                <div className="timestamp-cell">
                  <span className="date">{formatDateTime(txn.ts)}</span>
                </div>
              </td>
              <td>
                <StatusBadge type="status" value={txn.status} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="pagination">
        <span className="pagination-info">{loading ? 'Loading…' : `${items.length} transaction(s)`}</span>
        <div className="pagination-controls">
          <button className="page-btn" onClick={goPrev} disabled={prevStack.length === 0 || loading}>
            <ChevronLeft size={16} />
          </button>
          <button className="page-btn" onClick={goNext} disabled={!nextCursor || loading}>
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default TransactionsTable;
