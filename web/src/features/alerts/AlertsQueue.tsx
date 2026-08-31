import React, { useCallback, useEffect, useState } from "react";
import { Download, RefreshCw, ChevronLeft, ChevronRight } from "lucide-react";
import { AnimatePresence } from "framer-motion";
import QueueFilters from "./components/QueueFilters";
import AlertsTable from "./components/AlertsTable";
import StatCards from "./components/StatCards";
import TriageDrawer from "./components/TriageDrawer";
import { api } from "../../api";
import type { AlertDTO, AlertStatus, Severity } from "../../api";

const PAGE_SIZE = 15;

const AlertsQueue: React.FC = () => {
  const [status, setStatus] = useState<AlertStatus | "">("");
  const [risk, setRisk] = useState<Severity | "">("");

  const [items, setItems] = useState<AlertDTO[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [pageCursor, setPageCursor] = useState<string | null>(null);
  const [prevStack, setPrevStack] = useState<Array<string | null>>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const [selected, setSelected] = useState<AlertDTO | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    api
      .listAlerts({
        status: status || undefined,
        risk: risk || undefined,
        cursor: pageCursor ?? undefined,
        limit: PAGE_SIZE,
      })
      .then((res) => {
        if (cancelled) return;
        setItems(res.items);
        setNextCursor(res.nextCursor);
      })
      .catch((err: unknown) => {
        if (!cancelled) setError(err instanceof Error ? err.message : "Failed to load alerts");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [status, risk, pageCursor, refreshKey]);

  // Changing a filter resets pagination to the first page.
  const changeStatus = (next: AlertStatus | "") => {
    setStatus(next);
    setPageCursor(null);
    setPrevStack([]);
  };
  const changeRisk = (next: Severity | "") => {
    setRisk(next);
    setPageCursor(null);
    setPrevStack([]);
  };

  const goNext = () => {
    if (!nextCursor) return;
    setPrevStack((s) => [...s, pageCursor]);
    setPageCursor(nextCursor);
  };
  const goPrev = () => {
    if (prevStack.length === 0) return;
    const prev = prevStack[prevStack.length - 1];
    setPrevStack((s) => s.slice(0, -1));
    setPageCursor(prev);
  };

  const closeDrawer = useCallback(() => setSelected(null), []);

  return (
    <div className="flex-1 bg-[#F9FAFB] min-h-screen text-gray-900 font-sans">
      {/* Page Header */}
      <div className="flex justify-between items-end mb-4">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900 mb-1 tracking-tight">Risk Alerts Queue</h1>
          <p className="text-gray-500 text-sm font-medium">
            Transactions flagged by the rank-order scoring engine.
          </p>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 font-semibold rounded-lg text-sm hover:bg-gray-50 transition-all shadow-sm">
            <Download size={16} />
            Export List
          </button>
          <button
            onClick={() => setRefreshKey((k) => k + 1)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg text-sm hover:bg-blue-700 transition-all shadow-md"
          >
            <RefreshCw size={16} />
            Refresh Queue
          </button>
        </div>
      </div>

      {/* Main Content Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Sidebar */}
        <div className="lg:col-span-3 flex flex-col gap-2">
          <QueueFilters />
        </div>

        {/* Right Main Area */}
        <div className="lg:col-span-9 flex flex-col gap-6">
          {/* Functional filters */}
          <div className="flex flex-wrap items-center gap-3">
            <label className="text-sm font-medium text-gray-600">
              Status
              <select
                value={status}
                onChange={(e) => changeStatus(e.target.value as AlertStatus | "")}
                className="ml-2 px-3 py-1.5 bg-white border border-gray-200 rounded-md text-sm"
              >
                <option value="">All</option>
                <option value="OPEN">Open</option>
                <option value="TRIAGED">Triaged</option>
                <option value="RESOLVED">Resolved</option>
                <option value="FALSE_POSITIVE">False positive</option>
              </select>
            </label>
            <label className="text-sm font-medium text-gray-600">
              Risk
              <select
                value={risk}
                onChange={(e) => changeRisk(e.target.value as Severity | "")}
                className="ml-2 px-3 py-1.5 bg-white border border-gray-200 rounded-md text-sm"
              >
                <option value="">All</option>
                <option value="CRITICAL">Critical</option>
                <option value="HIGH">High</option>
                <option value="MEDIUM">Medium</option>
                <option value="LOW">Low</option>
              </select>
            </label>
          </div>

          <AlertsTable alerts={items} loading={loading} error={error} onOpenTriage={setSelected} />

          {/* Keyset pagination */}
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-500 font-medium">
              Page {prevStack.length + 1}
              {loading ? " · loading…" : ` · ${items.length} alert(s)`}
            </span>
            <div className="flex gap-2">
              <button
                onClick={goPrev}
                disabled={prevStack.length === 0 || loading}
                className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-md hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft size={16} /> Previous
              </button>
              <button
                onClick={goNext}
                disabled={!nextCursor || loading}
                className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-md hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                Next <ChevronRight size={16} />
              </button>
            </div>
          </div>

          <StatCards />
        </div>
      </div>

      <AnimatePresence>
        {selected && (
          <TriageDrawer
            key={selected.id}
            alert={selected}
            onClose={closeDrawer}
            onActionComplete={() => setRefreshKey((k) => k + 1)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default AlertsQueue;
