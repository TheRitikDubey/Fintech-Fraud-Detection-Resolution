import React, { useEffect, useState } from 'react';
import { AlertTriangle, CheckCircle2, BarChart3 } from 'lucide-react';
import { api } from '../../../api';
import { formatMoney } from '../../../lib/format';
import './SummaryCards.css';

const SummaryCards: React.FC = () => {
  const [openAlerts, setOpenAlerts] = useState(0);
  const [falsePositiveRate, setFalsePositiveRate] = useState(0);
  const [volumeCents, setVolumeCents] = useState(0n);

  useEffect(() => {
    let cancelled = false;
    Promise.all([api.listAlerts({ limit: 100 }), api.listTransactions({ limit: 100 })]).then(([a, t]) => {
      if (cancelled) return;
      setOpenAlerts(a.items.filter((x) => x.status === 'OPEN').length);
      const fp = a.items.filter((x) => x.status === 'FALSE_POSITIVE').length;
      setFalsePositiveRate(a.items.length === 0 ? 0 : (fp / a.items.length) * 100);
      setVolumeCents(t.items.reduce((sum, x) => sum + BigInt(x.amountCents), 0n));
    });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="summary-cards-container">
      <div className="summary-card">
        <div className="card-header">
          <span className="card-title">OPEN ALERTS</span>
          <AlertTriangle size={18} color="var(--status-danger)" />
        </div>
        <div className="card-content">
          <div className="card-value danger">{openAlerts}</div>
        </div>
      </div>

      <div className="summary-card">
        <div className="card-header">
          <span className="card-title">FALSE POSITIVE RATE</span>
          <CheckCircle2 size={18} color="var(--status-success)" />
        </div>
        <div className="card-content">
          <div className="card-value">{falsePositiveRate.toFixed(1)}%</div>
        </div>
      </div>

      <div className="summary-card">
        <div className="card-header">
          <span className="card-title">RECENT VOLUME</span>
          <BarChart3 size={18} color="var(--brand-primary)" />
        </div>
        <div className="card-content">
          <div className="card-value">{formatMoney(volumeCents.toString())}</div>
          <div className="card-trend default">
            <span className="dot-small"></span>
            <span>Last 100 transactions</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SummaryCards;
