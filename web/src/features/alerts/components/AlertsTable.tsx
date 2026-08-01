import React from "react";
import { motion } from "framer-motion";
import type { AlertDTO, AlertStatus, Severity } from "../../../api";
import { formatMoney, timeAgo } from "../../../lib/format";
import { redactPII } from "../../../lib/redact";

interface AlertsTableProps {
  alerts: AlertDTO[];
  loading: boolean;
  error: string | null;
  onOpenTriage: (alert: AlertDTO) => void;
}

const RISK_BADGE: Record<Severity, string> = {
  CRITICAL: "bg-red-100 text-red-700",
  HIGH: "bg-orange-100 text-orange-700",
  MEDIUM: "bg-yellow-100 text-yellow-700",
  LOW: "bg-gray-100 text-gray-600",
};

const STATUS_COLOR: Record<AlertStatus, string> = {
  OPEN: "text-blue-600",
  TRIAGED: "text-orange-600",
  RESOLVED: "text-green-600",
  FALSE_POSITIVE: "text-gray-500",
};

const AlertsTable: React.FC<AlertsTableProps> = ({ alerts, loading, error, onOpenTriage }) => {
  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden flex flex-col">
      <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100">
        <div className="flex items-center gap-4">
          <h3 className="text-sm font-semibold text-gray-800">Live Monitoring</h3>
          <span className="bg-green-100 text-green-700 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
            {loading ? "Loading…" : "Live"}
          </span>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50/50">
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Transaction</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Risk</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Raised</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Action</th>
            </tr>
          </thead>
          <tbody>
            {error && (
              <tr>
                <td colSpan={5} className="px-6 py-10 text-center text-sm text-red-500">
                  {error}
                </td>
              </tr>
            )}
            {!error && !loading && alerts.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-10 text-center text-sm text-gray-400">
                  No alerts match the current filters.
                </td>
              </tr>
            )}
            {alerts.map((alert, index) => {
              const txn = alert.transaction;
              const location = txn ? [txn.city, txn.country].filter(Boolean).join(", ") : "";
              return (
                <motion.tr
                  key={alert.id}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: Math.min(index * 0.04, 0.4) }}
                  className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors"
                >
                  <td className="px-6 py-4">
                    <div className="text-sm font-bold text-gray-900">{redactPII(txn?.merchant || txn?.txnId || "—")}</div>
                    <div className="text-xs text-gray-500 mt-1">
                      {txn ? formatMoney(txn.amountCents, txn.currency) : "—"}
                      {location ? ` • ${location}` : ""}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${RISK_BADGE[alert.severity]}`}
                    >
                      {alert.severity} · {alert.score}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600 font-medium">{timeAgo(alert.createdAt)}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <span className={`w-1.5 h-1.5 rounded-full bg-current ${STATUS_COLOR[alert.status]}`} />
                      <span className={`text-sm font-semibold ${STATUS_COLOR[alert.status]}`}>
                        {alert.status.replace(/_/g, " ")}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => onOpenTriage(alert)}
                      className="px-3 py-1.5 text-sm font-semibold text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors shadow-sm"
                    >
                      Open Triage
                    </button>
                  </td>
                </motion.tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AlertsTable;
