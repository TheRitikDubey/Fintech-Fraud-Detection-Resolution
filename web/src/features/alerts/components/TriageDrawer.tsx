import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { X, Snowflake, FileWarning, ShieldCheck, AlertTriangle } from "lucide-react";
import { api } from "../../../api";
import type { AlertDTO, Severity, TransactionDTO } from "../../../api";
import { formatMoney, formatDateTime } from "../../../lib/format";
import { redactPII } from "../../../lib/redact";
import { useFocusTrap } from "../../../lib/useFocusTrap";

interface TriageDrawerProps {
  alert: AlertDTO;
  onClose: () => void;
  onActionComplete?: () => void; // let the queue refresh after a state-changing action
}

const SEVERITY_STYLES: Record<Severity, string> = {
  CRITICAL: "bg-red-100 text-red-700",
  HIGH: "bg-orange-100 text-orange-700",
  MEDIUM: "bg-yellow-100 text-yellow-700",
  LOW: "bg-gray-100 text-gray-600",
};

type ActionKind = "FREEZE_CARD" | "OPEN_DISPUTE" | "MARK_FALSE_POSITIVE";

const TriageDrawer: React.FC<TriageDrawerProps> = ({ alert, onClose, onActionComplete }) => {
  const containerRef = useFocusTrap<HTMLDivElement>(true, onClose);
  const currency = alert.transaction?.currency ?? "USD";

  const [recent, setRecent] = useState<TransactionDTO[]>([]);
  const [loadingRecent, setLoadingRecent] = useState(true);
  const [recentError, setRecentError] = useState<string | null>(null);

  const [actionStatus, setActionStatus] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [pending, setPending] = useState<ActionKind | null>(null);
  const [showOtp, setShowOtp] = useState(false);
  const [otp, setOtp] = useState("");

  useEffect(() => {
    let cancelled = false;
    setLoadingRecent(true);
    setRecentError(null);
    api
      .listCustomerTransactions(alert.customerId, { limit: 10 })
      .then((res) => {
        if (!cancelled) setRecent(res.items);
      })
      .catch((err: unknown) => {
        if (!cancelled) setRecentError(err instanceof Error ? err.message : "Failed to load activity");
      })
      .finally(() => {
        if (!cancelled) setLoadingRecent(false);
      });
    return () => {
      cancelled = true;
    };
  }, [alert.customerId]);

  const runAction = async (kind: ActionKind, fn: () => Promise<void>) => {
    setPending(kind);
    setActionError(null);
    try {
      await fn();
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Action failed");
    } finally {
      setPending(null);
    }
  };

  const handleFreeze = () =>
    runAction("FREEZE_CARD", async () => {
      const res = await api.freezeCard(alert.id, showOtp ? otp : undefined);
      if (res.status === "PENDING_OTP") {
        setShowOtp(true);
        setActionStatus("OTP required — enter the one-time code to confirm the freeze.");
      } else {
        setShowOtp(false);
        setOtp("");
        setActionStatus("Card frozen.");
        onActionComplete?.();
      }
    });

  const handleDispute = () =>
    runAction("OPEN_DISPUTE", async () => {
      const res = await api.openDispute(alert.id);
      setActionStatus(`Dispute opened — case ${res.caseId.slice(0, 8)}.`);
      onActionComplete?.();
    });

  const handleFalsePositive = () =>
    runAction("MARK_FALSE_POSITIVE", async () => {
      await api.markFalsePositive(alert.id);
      setActionStatus("Marked as false positive.");
      onActionComplete?.();
    });

  const txn = alert.transaction;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <motion.div
        className="absolute inset-0 bg-black/40"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Panel */}
      <motion.div
        ref={containerRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="triage-title"
        tabIndex={-1}
        className="relative h-full w-full max-w-xl bg-white shadow-2xl overflow-y-auto focus:outline-none"
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        exit={{ x: "100%" }}
        transition={{ type: "tween", duration: 0.25 }}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-start justify-between z-10">
          <div>
            <div className="flex items-center gap-3">
              <h2 id="triage-title" className="text-lg font-extrabold text-gray-900">
                Triage Alert
              </h2>
              <span
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${SEVERITY_STYLES[alert.severity]}`}
              >
                <AlertTriangle size={12} /> {alert.severity}
              </span>
            </div>
            <p className="text-sm text-gray-500 mt-1">
              Risk score{" "}
              <span className="font-bold text-gray-900">{alert.score}</span>/100 · alert {alert.id.slice(0, 8)}
            </p>
          </div>
          <button
            onClick={onClose}
            aria-label="Close triage"
            className="p-2 rounded-md text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="px-6 py-5 space-y-6">
          {/* Transaction details */}
          <section>
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Transaction</h3>
            {txn ? (
              <div className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
                <Detail label="Merchant" value={redactPII(txn.merchant) || "—"} />
                <Detail label="Amount" value={formatMoney(txn.amountCents, currency)} strong />
                <Detail label="MCC" value={txn.mcc || "—"} />
                <Detail label="Status" value={txn.status} />
                <Detail label="Location" value={[txn.city, txn.country].filter(Boolean).join(", ") || "—"} />
                <Detail label="When" value={formatDateTime(txn.ts)} />
                <Detail label="Txn ID" value={txn.txnId} />
                <Detail label="Customer" value={alert.customerId} to={`/customer/${alert.customerId}`} />
              </div>
            ) : (
              <p className="text-sm text-gray-400">Transaction details unavailable.</p>
            )}
          </section>

          {/* Why it was flagged — scoring reasons */}
          <section>
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">
              Why it was flagged
            </h3>
            <ul className="space-y-2">
              {alert.reasons.map((r, i) => (
                <li key={`${r.code}-${i}`} className="rounded-lg border border-gray-100 bg-gray-50/60 p-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-gray-700">{r.code.replace(/_/g, " ")}</span>
                    <span className="text-xs font-semibold text-gray-500">
                      +{r.points.toFixed(1)}
                      {r.weight > 0 ? ` / ${r.weight}` : ""}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">{redactPII(r.detail)}</p>
                  {r.weight > 0 && (
                    <div className="mt-2 h-1.5 rounded-full bg-gray-200 overflow-hidden">
                      <div
                        className="h-full bg-blue-500"
                        style={{ width: `${Math.min(100, (r.points / r.weight) * 100)}%` }}
                      />
                    </div>
                  )}
                </li>
              ))}
            </ul>
          </section>

          {/* Recent activity */}
          <section>
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">
              Recent activity (last 10)
            </h3>
            {loadingRecent ? (
              <p className="text-sm text-gray-400">Loading…</p>
            ) : recentError ? (
              <p className="text-sm text-red-500">{recentError}</p>
            ) : recent.length === 0 ? (
              <p className="text-sm text-gray-400">No recent transactions.</p>
            ) : (
              <ul className="divide-y divide-gray-100 border border-gray-100 rounded-lg overflow-hidden">
                {recent.map((t) => (
                  <li
                    key={t.id}
                    className={`flex items-center justify-between px-3 py-2 text-sm ${
                      t.id === alert.transactionId ? "bg-blue-50" : "bg-white"
                    }`}
                  >
                    <div className="min-w-0">
                      <div className="font-medium text-gray-800 truncate">{redactPII(t.merchant || t.txnId)}</div>
                      <div className="text-xs text-gray-400">{formatDateTime(t.ts)}</div>
                    </div>
                    <span className="font-semibold text-gray-700 shrink-0 ml-3">
                      {formatMoney(t.amountCents, t.currency)}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>

        {/* Actions */}
        <div className="sticky bottom-0 bg-white border-t border-gray-100 px-6 py-4 space-y-3">
          {actionError && (
            <p className="text-xs text-red-700 bg-red-50 border border-red-200 rounded-md px-3 py-2">
              {actionError}
            </p>
          )}
          {actionStatus && !actionError && (
            <p className="text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-md px-3 py-2">
              {actionStatus}
            </p>
          )}

          {showOtp && (
            <div className="flex items-center gap-2">
              <input
                type="text"
                inputMode="numeric"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="One-time code"
                aria-label="One-time code"
                className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm"
              />
              <button
                onClick={handleFreeze}
                disabled={otp.length === 0 || pending === "FREEZE_CARD"}
                className="px-3 py-2 rounded-lg text-sm font-semibold bg-red-600 text-white hover:bg-red-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                Confirm
              </button>
            </div>
          )}

          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={handleFreeze}
              disabled={pending !== null}
              className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-sm font-semibold bg-red-50 text-red-700 hover:bg-red-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <Snowflake size={15} /> {pending === "FREEZE_CARD" ? "…" : "Freeze Card"}
            </button>
            <button
              onClick={handleDispute}
              disabled={pending !== null}
              className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-sm font-semibold bg-orange-50 text-orange-700 hover:bg-orange-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <FileWarning size={15} /> {pending === "OPEN_DISPUTE" ? "…" : "Open Dispute"}
            </button>
            <button
              onClick={handleFalsePositive}
              disabled={pending !== null}
              className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-sm font-semibold bg-green-50 text-green-700 hover:bg-green-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ShieldCheck size={15} /> {pending === "MARK_FALSE_POSITIVE" ? "…" : "False Positive"}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

const Detail: React.FC<{ label: string; value: string; strong?: boolean; to?: string }> = ({
  label,
  value,
  strong,
  to,
}) => (
  <div>
    <div className="text-xs text-gray-400">{label}</div>
    {to ? (
      <Link to={to} className="block truncate text-blue-600 hover:underline" title={value}>
        {value}
      </Link>
    ) : (
      <div className={`truncate ${strong ? "font-bold text-gray-900" : "text-gray-700"}`} title={value}>
        {value}
      </div>
    )}
  </div>
);

export default TriageDrawer;
