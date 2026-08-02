import React from "react";
import { ShieldCheck } from "lucide-react";

const BRAND = "#004DFF";

const AuthShell: React.FC<{ title: string; subtitle: string; children: React.ReactNode }> = ({
  title,
  subtitle,
  children,
}) => (
  <div className="flex min-h-screen w-full items-center justify-center bg-gradient-to-br from-slate-50 via-white to-blue-50 p-4">
    <div className="w-full max-w-sm">
      <div className="mb-6 flex items-center justify-center gap-2">
        <span
          style={{ backgroundColor: BRAND }}
          className="flex h-10 w-10 items-center justify-center rounded-xl text-white shadow-md"
        >
          <ShieldCheck size={22} />
        </span>
        <span className="text-xl font-extrabold tracking-tight text-gray-900">Sentinel</span>
      </div>
      <div className="rounded-2xl bg-white p-7 shadow-xl ring-1 ring-gray-100">
        <h1 className="text-xl font-extrabold text-gray-900">{title}</h1>
        <p className="mb-6 mt-1 text-sm text-gray-500">{subtitle}</p>
        {children}
      </div>
    </div>
  </div>
);

export const Field: React.FC<{
  label: string;
  type: string;
  value: string;
  onChange: (v: string) => void;
  autoComplete?: string;
}> = ({ label, type, value, onChange, autoComplete }) => (
  <label className="block">
    <span className="mb-1.5 block text-sm font-medium text-gray-700">{label}</span>
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      autoComplete={autoComplete}
      required
      className="w-full rounded-xl border border-gray-200 px-3.5 py-2.5 text-sm text-gray-900 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
    />
  </label>
);

export default AuthShell;
