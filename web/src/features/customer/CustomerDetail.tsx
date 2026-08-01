import React, { useCallback, useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import { ArrowLeft, TrendingUp, AlertTriangle } from "lucide-react";
import { api } from "../../api";
import type { AlertDTO, CustomerSummaryDTO, Severity, TransactionDTO } from "../../api";
import { formatMoney, formatDateTime } from "../../lib/format";

const SEVERITY_STYLES: Record<Severity, string> = {
  CRITICAL: "bg-red-100 text-red-700",
  HIGH: "bg-orange-100 text-orange-700",
  MEDIUM: "bg-yellow-100 text-yellow-700",
  LOW: "bg-gray-100 text-gray-600",
};

const CustomerDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const customerId = id ?? "";

  const [summary, setSummary] = useState<CustomerSummaryDTO | null>(null);
  const [summaryError, setSummaryError] = useState<string | null>(null);

  const [txns, setTxns] = useState<TransactionDTO[]>([]);
  const [cursor, setCursor] = useState<string | null>(null);
  const [loadingTxns, setLoadingTxns] = useState(false);

  useEffect(() => {
    if (!customerId) return;
    let cancelled = false;
    setSummaryError(null);
    api
      .getCustomerSummary(customerId)
      .then((res) => {
        if (!cancelled) setSummary(res);
      })
      .catch((err: unknown) => {
        if (!cancelled) setSummaryError(err instanceof Error ? err.message : "Failed to load summary");
      });
    return () => {
      cancelled = true;
    };
  }, [customerId]);

  const loadTxns = useCallback(
    async (nextCursor?: string) => {
      if (!customerId) return;
      setLoadingTxns(true);
      try {
        const res = await api.listCustomerTransactions(customerId, { cursor: nextCursor, limit: 20 });
        setTxns((prev) => (nextCursor ? [...prev, ...res.items] : res.items));
        setCursor(res.nextCursor);
      } finally {
        setLoadingTxns(false);
      }
    },
    [customerId],
  );

  useEffect(() => {
    setTxns([]);
    setCursor(null);
    void loadTxns();
  }, [loadTxns]);

  const trendData = (summary?.monthlyTrend ?? []).map((m) => ({
    month: m.month,
    spend: Number(m.totalCents) / 100,
  }));

  return (
    <div className="flex-1 bg-[#F9FAFB] min-h-screen text-gray-900 font-sans">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Link
          to="/alerts"
          className="p-2 rounded-md text-gray-500 hover:bg-gray-100 hover:text-gray-800 transition-colors"
          aria-label="Back to alerts"
        >
          <ArrowLeft size={18} />
        </Link>
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">Customer</h1>
          <p className="text-gray-500 text-sm font-mono">{customerId}</p>
        </div>
      </div>

      {summaryError && (
        <div className="mb-6 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-3">
          {summaryError}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: timeline */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          <Panel title="Transaction timeline">
            {txns.length === 0 && !loadingTxns ? (
              <Empty>No transactions for this customer.</Empty>
            ) : (
              <ol className="relative border-l border-gray-200 ml-2">
                {txns.map((t) => (
                  <li key={t.id} className="ml-4 pb-4">
                    <span className="absolute -left-1.5 mt-1.5 w-3 h-3 rounded-full bg-blue-500 border-2 border-white" />
                    <div className="flex justify-between items-start">
                      <div className="min-w-0">
                        <div className="text-sm font-semibold text-gray-900 truncate">
                          {t.merchant || t.txnId}
                        </div>
                        <div className="text-xs text-gray-400">
                          {formatDateTime(t.ts)} · {[t.city, t.country].filter(Boolean).join(", ") || "—"} · {t.status}
                        </div>
                      </div>
                      <span className="text-sm font-bold text-gray-800 shrink-0 ml-3">
                        {formatMoney(t.amountCents, t.currency)}
                      </span>
                    </div>
                  </li>
                ))}
              </ol>
            )}
            {cursor && (
              <button
                onClick={() => loadTxns(cursor)}
                disabled={loadingTxns}
                className="mt-2 px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-md hover:bg-gray-50 disabled:opacity-40 transition-colors"
              >
                {loadingTxns ? "Loading…" : "Load more"}
              </button>
            )}
          </Panel>
        </div>

        {/* Right: breakdowns + anomalies */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          <Panel title="Monthly spend" icon={<TrendingUp size={15} className="text-blue-500" />}>
            {trendData.length === 0 ? (
              <Empty>No spend data.</Empty>
            ) : (
              <div className="h-40">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={trendData} margin={{ top: 4, right: 4, bottom: 0, left: -16 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#EEF2F7" vertical={false} />
                    <XAxis dataKey="month" tick={{ fill: "#94A3B8", fontSize: 10 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: "#94A3B8", fontSize: 10 }} axisLine={false} tickLine={false} width={40} />
                    <Tooltip
                      formatter={(value) => [`$${Number(value).toLocaleString()}`, "Spend"]}
                      labelFormatter={(label) => `Month: ${String(label)}`}
                    />
                    <Bar dataKey="spend" fill="#2563EB" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </Panel>

          <Panel title="Merchant mix">
            <RankedBars
              items={(summary?.topMerchants ?? []).map((m) => ({
                label: m.merchant || "—",
                value: m.count,
                sub: formatMoney(m.totalCents),
              }))}
            />
          </Panel>

          <Panel title="Category spend (MCC)">
            <RankedBars
              items={(summary?.topCategories ?? []).map((c) => ({
                label: c.mcc || "—",
                value: c.count,
                sub: formatMoney(c.totalCents),
              }))}
            />
          </Panel>

          <Panel title="Anomalies" icon={<AlertTriangle size={15} className="text-red-500" />}>
            {summary && summary.anomalies.length > 0 ? (
              <ul className="space-y-2">
                {summary.anomalies.map((a) => (
                  <AnomalyRow key={a.id} alert={a} />
                ))}
              </ul>
            ) : (
              <Empty>No anomalies flagged.</Empty>
            )}
          </Panel>
        </div>
      </div>
    </div>
  );
};

const Panel: React.FC<{ title: string; icon?: React.ReactNode; children: React.ReactNode }> = ({
  title,
  icon,
  children,
}) => (
  <section className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
    <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4 flex items-center gap-2">
      {icon}
      {title}
    </h3>
    {children}
  </section>
);

const Empty: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <p className="text-sm text-gray-400">{children}</p>
);

const RankedBars: React.FC<{ items: { label: string; value: number; sub: string }[] }> = ({ items }) => {
  if (items.length === 0) return <Empty>No data.</Empty>;
  const max = Math.max(...items.map((i) => i.value), 1);
  return (
    <ul className="space-y-2.5">
      {items.map((item) => (
        <li key={item.label}>
          <div className="flex justify-between items-baseline text-sm">
            <span className="font-medium text-gray-800 truncate">{item.label}</span>
            <span className="text-gray-500 text-xs shrink-0 ml-3">
              {item.value} · {item.sub}
            </span>
          </div>
          <div className="mt-1 h-1.5 rounded-full bg-gray-100 overflow-hidden">
            <div className="h-full bg-blue-500" style={{ width: `${(item.value / max) * 100}%` }} />
          </div>
        </li>
      ))}
    </ul>
  );
};

const AnomalyRow: React.FC<{ alert: AlertDTO }> = ({ alert }) => (
  <li className="rounded-lg border border-gray-100 bg-gray-50/60 p-3">
    <div className="flex items-center justify-between">
      <span
        className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold uppercase tracking-wide ${SEVERITY_STYLES[alert.severity]}`}
      >
        {alert.severity} · {alert.score}
      </span>
      <span className="text-xs text-gray-400">{formatDateTime(alert.createdAt)}</span>
    </div>
    {alert.transaction && (
      <div className="text-sm font-semibold text-gray-800 mt-1.5">
        {alert.transaction.merchant || alert.transaction.txnId} ·{" "}
        {formatMoney(alert.transaction.amountCents, alert.transaction.currency)}
      </div>
    )}
    {alert.reasons[0] && <p className="text-xs text-gray-500 mt-0.5">{alert.reasons[0].detail}</p>}
  </li>
);

export default CustomerDetail;
