import React, { useCallback, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Plus, X, UploadCloud, FileText, CheckCircle2, AlertCircle, ArrowRight } from "lucide-react";
import { api, ApiError } from "../../../api";
import type { IngestResult } from "../../../api";
import { useFocusTrap } from "../../../lib/useFocusTrap";

type Status = "idle" | "uploading" | "done" | "error";

const BRAND = "#004DFF";

function formatOf(name: string): "csv" | "json" | null {
  const lower = name.toLowerCase();
  if (lower.endsWith(".csv")) return "csv";
  if (lower.endsWith(".json")) return "json";
  return null;
}

const UploadFab: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [status, setStatus] = useState<Status>("idle");
  const [result, setResult] = useState<IngestResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const reset = useCallback(() => {
    setFile(null);
    setStatus("idle");
    setResult(null);
    setError(null);
    setDragOver(false);
  }, []);

  const close = useCallback(() => {
    setOpen(false);
    reset();
  }, [reset]);

  const containerRef = useFocusTrap<HTMLDivElement>(open, close);

  const pickFile = (next: File | null) => {
    setError(null);
    setResult(null);
    setStatus("idle");
    if (next && !formatOf(next.name)) {
      setFile(null);
      setError("Please choose a .csv or .json file.");
      return;
    }
    setFile(next);
  };

  const upload = async () => {
    if (!file) return;
    const format = formatOf(file.name);
    if (!format) {
      setError("Please choose a .csv or .json file.");
      return;
    }
    setStatus("uploading");
    setError(null);
    try {
      const text = await file.text();
      if (format === "json") {
        try {
          JSON.parse(text);
        } catch {
          throw new ApiError(400, "The file is not valid JSON.");
        }
      }
      const res = await api.ingestTransactions(text, format);
      setResult(res);
      setStatus("done");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed.");
      setStatus("error");
    }
  };

  return (
    <>
      {/* Fixed pill FAB — stays put while the dashboard scrolls */}
      <button
        onClick={() => setOpen(true)}
        aria-label="Upload transactions"
        style={{ backgroundColor: BRAND }}
        className="fixed bottom-8 right-8 z-40 flex items-center gap-2 rounded-full px-5 py-3.5 text-white shadow-xl shadow-blue-900/30 ring-1 ring-white/20 hover:brightness-110 active:scale-95 focus:outline-none focus:ring-4 focus:ring-blue-300 transition-all"
      >
        <Plus size={20} strokeWidth={2.75} />
        <span className="text-sm font-bold tracking-tight">Upload</span>
      </button>

      <AnimatePresence>
        {open && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={close}
              aria-hidden="true"
            />

            <motion.div
              ref={containerRef}
              role="dialog"
              aria-modal="true"
              aria-labelledby="upload-title"
              tabIndex={-1}
              className="relative w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl focus:outline-none"
              initial={{ opacity: 0, y: 20, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.96 }}
              transition={{ type: "spring", stiffness: 320, damping: 28 }}
            >
              {/* Header */}
              <div className="flex items-center gap-3 border-b border-gray-100 px-6 py-5">
                <span
                  style={{ backgroundColor: BRAND }}
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-white shadow-sm"
                >
                  <UploadCloud size={20} />
                </span>
                <div className="min-w-0 flex-1">
                  <h2 id="upload-title" className="text-base font-extrabold text-gray-900">
                    Upload transactions
                  </h2>
                  <p className="text-xs text-gray-500">CSV or JSON — scored on ingest against each customer's history.</p>
                </div>
                <button
                  onClick={close}
                  aria-label="Close"
                  className="grid h-8 w-8 place-items-center rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="p-6">
                {status === "done" && result ? (
                  <div className="py-4 text-center">
                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50">
                      <CheckCircle2 size={36} className="text-emerald-500" />
                    </div>
                    <p className="mt-4 text-lg font-extrabold text-gray-900">
                      Ingested {result.count} transaction{result.count === 1 ? "" : "s"}
                    </p>
                    <p className="mt-1 inline-block rounded-full bg-gray-100 px-2.5 py-0.5 font-mono text-[11px] text-gray-500">
                      req {result.requestId.slice(0, 8)}
                    </p>
                    <div className="mt-6 flex items-center justify-center gap-3">
                      <Link
                        to="/alerts"
                        onClick={close}
                        style={{ backgroundColor: BRAND }}
                        className="inline-flex items-center gap-1.5 rounded-xl px-4 py-2.5 text-sm font-bold text-white hover:brightness-110 transition-all"
                      >
                        View alerts <ArrowRight size={15} />
                      </Link>
                      <button
                        onClick={reset}
                        className="rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        Upload another
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div
                      onDragOver={(e) => {
                        e.preventDefault();
                        setDragOver(true);
                      }}
                      onDragLeave={() => setDragOver(false)}
                      onDrop={(e) => {
                        e.preventDefault();
                        setDragOver(false);
                        pickFile(e.dataTransfer.files[0] ?? null);
                      }}
                      onClick={() => inputRef.current?.click()}
                      style={dragOver ? { borderColor: BRAND, backgroundColor: "#EFF4FF" } : undefined}
                      className={`group flex cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed px-6 py-9 text-center transition-colors ${
                        dragOver ? "" : "border-gray-200 bg-gray-50/60 hover:border-gray-300 hover:bg-gray-50"
                      }`}
                    >
                      {file ? (
                        <>
                          <span
                            style={{ backgroundColor: "#EFF4FF", color: BRAND }}
                            className="flex h-12 w-12 items-center justify-center rounded-xl"
                          >
                            <FileText size={22} />
                          </span>
                          <div>
                            <div className="text-sm font-bold text-gray-900">{file.name}</div>
                            <div className="text-xs text-gray-400">{(file.size / 1024).toFixed(1)} KB · click to change</div>
                          </div>
                        </>
                      ) : (
                        <>
                          <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-white text-gray-400 shadow-sm ring-1 ring-gray-100 group-hover:text-gray-500">
                            <UploadCloud size={24} />
                          </span>
                          <div>
                            <div className="text-sm font-bold text-gray-800">Drop a file or click to browse</div>
                            <div className="text-xs text-gray-400">.csv or .json · up to 5 MB</div>
                          </div>
                        </>
                      )}
                      <input
                        ref={inputRef}
                        type="file"
                        accept=".csv,.json,text/csv,application/json"
                        className="hidden"
                        onChange={(e) => pickFile(e.target.files?.[0] ?? null)}
                      />
                    </div>

                    {error && (
                      <p className="mt-3 flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-600">
                        <AlertCircle size={16} className="mt-0.5 shrink-0" />
                        <span>{error}</span>
                      </p>
                    )}

                    <div className="mt-6 flex items-center justify-end gap-3">
                      <button
                        onClick={close}
                        className="rounded-xl px-4 py-2.5 text-sm font-semibold text-gray-500 hover:bg-gray-100 transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={upload}
                        disabled={!file || status === "uploading"}
                        style={!file || status === "uploading" ? undefined : { backgroundColor: BRAND }}
                        className={`inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-bold text-white transition-all ${
                          !file || status === "uploading"
                            ? "cursor-not-allowed bg-gray-300"
                            : "hover:brightness-110 active:scale-95"
                        }`}
                      >
                        {status === "uploading" ? (
                          "Uploading…"
                        ) : (
                          <>
                            <UploadCloud size={16} /> Upload &amp; score
                          </>
                        )}
                      </button>
                    </div>
                  </>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};

export default UploadFab;
