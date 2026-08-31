import React, { useEffect, useState } from 'react';
import { Banknote, ShieldAlert, CheckCircle2, ClipboardList } from 'lucide-react';
import { api } from '../../../api';
import type { AlertDTO, TransactionDTO } from '../../../api';
import { formatMoney } from '../../../lib/format';
import './OverviewCards.css';

const OverviewCards: React.FC = () => {
  const [alerts, setAlerts] = useState<AlertDTO[]>([]);
  const [txns, setTxns] = useState<TransactionDTO[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    Promise.all([api.listAlerts({ limit: 100 }), api.listTransactions({ limit: 100 })])
      .then(([a, t]) => {
        if (cancelled) return;
        setAlerts(a.items);
        setTxns(t.items);
      })
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, []);

  const totalCents = txns.reduce((sum, t) => sum + BigInt(t.amountCents), 0n);
  const open = alerts.filter((a) => a.status === 'OPEN').length;
  const resolved = alerts.filter((a) => a.status === 'RESOLVED' || a.status === 'FALSE_POSITIVE').length;

  const val = (v: string) => (loading ? '…' : v);

  return (
    <div className="overview-cards-grid">
      <div className="overview-card">
        <div className="card-top">
          <div className="icon-wrapper blue-bg">
            <Banknote size={20} className="icon-blue" />
          </div>
        </div>
        <div className="card-bottom">
          <span className="card-label">Recent Transaction Volume</span>
          <span className="card-value">{val(formatMoney(totalCents.toString()))}</span>
        </div>
      </div>

      <div className="overview-card">
        <div className="card-top">
          <div className="icon-wrapper red-bg">
            <ShieldAlert size={20} className="icon-red" />
          </div>
          {!loading && alerts.length > 0 && <span className="trend-badge danger">High risk</span>}
        </div>
        <div className="card-bottom">
          <span className="card-label">Fraud Alerts Triggered</span>
          <span className="card-value">{val(String(alerts.length))}</span>
        </div>
      </div>

      <div className="overview-card">
        <div className="card-top">
          <div className="icon-wrapper emerald-bg">
            <CheckCircle2 size={20} className="icon-emerald" />
          </div>
        </div>
        <div className="card-bottom">
          <span className="card-label">Resolved Alerts</span>
          <span className="card-value">{val(String(resolved))}</span>
        </div>
      </div>

      <div className="overview-card">
        <div className="card-top">
          <div className="icon-wrapper amber-bg">
            <ClipboardList size={20} className="icon-amber" />
          </div>
          {!loading && open > 0 && <span className="trend-badge warning">Attention needed</span>}
        </div>
        <div className="card-bottom">
          <span className="card-label">Pending Reviews</span>
          <span className="card-value">{val(String(open))}</span>
        </div>
      </div>
    </div>
  );
};

export default OverviewCards;
