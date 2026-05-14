import { motion } from 'framer-motion';
import {
  ArrowDownToLine,
  ChartNoAxesColumnIncreasing,
  Circle,
  Funnel,
  Shield,
  Sparkles,
  Workflow,
} from 'lucide-react';
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

const weeklyFraudData = [
  { day: 'MON', incidents: 38 },
  { day: 'TUE', incidents: 44 },
  { day: 'WED', incidents: 31 },
  { day: 'THU', incidents: 52 },
  { day: 'FRI', incidents: 47 },
  { day: 'SAT', incidents: 36 },
  { day: 'SUN', incidents: 29 },
];

const auditRows = [
  {
    timestamp: 'Oct 24, 2023 · 14:22:05',
    actor: 'System',
    actorType: 'SY',
    actorBadge: 'bg-blue-100 text-blue-700',
    action: 'Auto-Blocked Transaction',
    note: 'High-velocity withdrawal attempt from ...',
    status: 'FLAGGED',
    statusClass: 'bg-red-100 text-red-700',
  },
  {
    timestamp: 'Oct 24, 2023 · 14:18:12',
    actor: 'RiskBot-4v',
    actorType: 'AI',
    actorBadge: 'bg-violet-100 text-violet-700',
    action: 'Pattern Analysis',
    note: 'Validated secondary account verificati...',
    status: 'SUCCESS',
    statusClass: 'bg-green-100 text-green-700',
  },
  {
    timestamp: 'Oct 24, 2023 · 14:05:44',
    actor: 'Sarah J.',
    actorType: 'SJ',
    actorBadge: 'bg-rose-100 text-rose-700',
    action: 'Manual Override',
    note: 'Customer provided proof of travel; unb...',
    status: 'MANUAL',
    statusClass: 'bg-amber-100 text-amber-700',
  },
  {
    timestamp: 'Oct 24, 2023 · 13:58:22',
    actor: 'System',
    actorType: 'SY',
    actorBadge: 'bg-blue-100 text-blue-700',
    action: 'Config Updated',
    note: 'Batch update of fraud rule set v2.4.1',
    status: 'SYSTEM',
    statusClass: 'bg-blue-100 text-blue-700',
  },
];

const streamItems = [
  { title: 'Rule Alpha triggered', time: '2 minutes ago', active: true },
  { title: 'DB Sync Complete', time: '5 minutes ago', active: false },
];

const containerVariants = {
  hidden: { opacity: 0, y: 8 },
  show: {
    opacity: 1,
    y: 0,
    transition: { staggerChildren: 0.08, duration: 0.26 },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: { duration: 0.26 } },
};

const SystemMonitoringReports = () => {
  return (
    <motion.div
      initial="hidden"
      animate="show"
      variants={containerVariants}
      className="mx-auto max-w-[1260px] space-y-6 pb-6"
    >
      <motion.header variants={cardVariants} className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-[2.35rem] font-extrabold leading-[1.08] tracking-tight text-slate-900">System Monitoring</h1>
          <p className="mt-1 text-base font-medium text-slate-500">Audit logs and operational performance analytics.</p>
        </div>

        <div className="flex items-center gap-3">
          <button className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-5 py-3 text-base font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50">
            <Funnel className="h-4 w-4" />
            Date Range
          </button>
          <button className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-base font-semibold text-white shadow-sm transition hover:bg-blue-700">
            <ArrowDownToLine className="h-4 w-4" />
            Export PDF
          </button>
        </div>
      </motion.header>

      <section className="grid grid-cols-1 gap-5 xl:grid-cols-12">
        <motion.article
          variants={cardVariants}
          whileHover={{ y: -1 }}
          className="flex min-h-[312px] flex-col rounded-2xl border border-slate-300 bg-white xl:col-span-8"
        >
          <div className="flex items-center justify-between px-6 py-5">
            <h2 className="text-[2rem] font-bold tracking-tight text-slate-900">Fraud Detection Rate (Weekly)</h2>
            <span className="inline-flex items-center gap-2 text-sm font-medium text-slate-500">
              <Circle className="h-2.5 w-2.5 fill-blue-600 text-blue-600" />
              Detected Incidents
            </span>
          </div>

          <div className="h-[230px] px-4 pb-4">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={weeklyFraudData} margin={{ top: 12, right: 18, left: 8, bottom: 4 }}>
                <CartesianGrid stroke="#E2E8F0" strokeDasharray="4 4" vertical={false} />
                <XAxis
                  dataKey="day"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#6B7280', fontSize: 12, fontWeight: 700 }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#94A3B8', fontSize: 11 }}
                  width={30}
                />
                <Tooltip
                  cursor={{ stroke: '#CBD5E1', strokeDasharray: '4 4' }}
                  contentStyle={{
                    borderRadius: '10px',
                    border: '1px solid #E2E8F0',
                    boxShadow: '0 8px 20px rgba(15, 23, 42, 0.08)',
                    fontSize: '12px',
                  }}
                  formatter={(value: number) => [`${value} incidents`, 'Detected']}
                  labelFormatter={(label: string) => `Day: ${label}`}
                />
                <Line
                  type="monotone"
                  dataKey="incidents"
                  stroke="#2563EB"
                  strokeWidth={3}
                  dot={{ r: 3, fill: '#2563EB', stroke: '#FFFFFF', strokeWidth: 2 }}
                  activeDot={{ r: 5, fill: '#2563EB', stroke: '#FFFFFF', strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </motion.article>

        <div className="space-y-5 xl:col-span-4">
          <motion.article
            variants={cardVariants}
            whileHover={{ y: -1 }}
            className="rounded-2xl bg-blue-700 px-6 py-6 text-white shadow-md"
          >
            <p className="text-[1.4rem] font-medium text-blue-100">Avg Resolution Time</p>
            <p className="mt-2 text-[2.7rem] font-extrabold leading-none">4.2 mins</p>
            <p className="mt-4 text-sm font-semibold text-blue-100">↘ 12% reduction from last week</p>
          </motion.article>

          <motion.article
            variants={cardVariants}
            whileHover={{ y: -1 }}
            className="rounded-2xl border border-slate-300 bg-white px-6 py-6"
          >
            <h3 className="text-[1.9rem] font-bold tracking-tight text-slate-900">Log Velocity</h3>
            <div className="mt-4 flex items-center gap-4">
              <div
                className="relative flex h-16 w-16 items-center justify-center rounded-full"
                style={{
                  background:
                    'conic-gradient(#5B537A 0 78%, #E7EAF0 78% 100%)',
                }}
              >
                <div className="h-12 w-12 rounded-full bg-white" />
                <span className="absolute text-xs font-bold text-slate-700">78%</span>
              </div>
              <div>
                <p className="text-[2rem] font-bold leading-none text-slate-900">2.4k</p>
                <p className="mt-1 text-[0.82rem] font-semibold uppercase tracking-[0.11em] text-slate-500">Entries / Hour</p>
              </div>
            </div>
          </motion.article>
        </div>
      </section>

      <motion.section
        variants={cardVariants}
        whileHover={{ y: -1 }}
        className="overflow-hidden rounded-2xl border border-slate-300 bg-white"
      >
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 px-6 py-4">
          <h2 className="text-[2rem] font-bold tracking-tight text-slate-900">Audit Log Table</h2>

          <div className="inline-flex rounded-xl border border-slate-300 bg-slate-50 p-0.5 text-[0.75rem] font-semibold uppercase tracking-[0.08em] text-slate-700">
            <button className="rounded-lg bg-slate-200 px-3 py-1.5">All</button>
            <button className="rounded-lg px-3 py-1.5 hover:bg-slate-100">System</button>
            <button className="rounded-lg px-3 py-1.5 hover:bg-slate-100">AI</button>
            <button className="rounded-lg px-3 py-1.5 hover:bg-slate-100">Agent</button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full text-left">
            <thead className="bg-white">
              <tr className="border-b border-slate-200">
                <th className="px-6 py-3 text-xs font-bold uppercase tracking-[0.15em] text-slate-500">Timestamp</th>
                <th className="px-6 py-3 text-xs font-bold uppercase tracking-[0.15em] text-slate-500">Actor</th>
                <th className="px-6 py-3 text-xs font-bold uppercase tracking-[0.15em] text-slate-500">Action</th>
                <th className="px-6 py-3 text-xs font-bold uppercase tracking-[0.15em] text-slate-500">Reason/Note</th>
                <th className="px-6 py-3 text-xs font-bold uppercase tracking-[0.15em] text-slate-500">Status</th>
              </tr>
            </thead>
            <tbody>
              {auditRows.map((row, index) => (
                <motion.tr
                  key={`${row.timestamp}-${row.actor}`}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.12 + index * 0.05 }}
                  className="border-b border-slate-200 last:border-b-0"
                >
                  <td className="whitespace-nowrap px-6 py-4 text-[0.95rem] font-medium text-slate-500">{row.timestamp}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2.5">
                      <span
                        className={`inline-flex h-6 w-6 items-center justify-center rounded-full text-[0.62rem] font-bold ${row.actorBadge}`}
                      >
                        {row.actorType}
                      </span>
                      <span className="text-[1.03rem] font-semibold text-slate-900">{row.actor}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-[1rem] font-medium text-slate-900">{row.action}</td>
                  <td className="max-w-[280px] truncate px-6 py-4 text-[0.95rem] italic text-slate-500">{row.note}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex rounded-full px-2.5 py-1 text-[0.66rem] font-bold uppercase ${row.statusClass}`}>
                      {row.status}
                    </span>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between border-t border-slate-200 px-6 py-4">
          <p className="text-[0.92rem] font-medium text-slate-500">Showing 1-15 of 2,482 entries</p>
          <div className="flex items-center gap-2">
            <button className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-slate-200 text-slate-400">‹</button>
            <button className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-slate-300 text-slate-700">›</button>
          </div>
        </div>
      </motion.section>

      <section className="grid grid-cols-1 gap-5 xl:grid-cols-12">
        <motion.article
          variants={cardVariants}
          whileHover={{ y: -1 }}
          className="rounded-2xl border border-slate-300 bg-white px-6 py-5 xl:col-span-4"
        >
          <div className="flex items-center gap-2 text-[1.65rem] font-bold tracking-tight text-slate-900">
            <Sparkles className="h-5 w-5 text-blue-600" />
            Real-time Stream
          </div>

          <div className="mt-5 space-y-4">
            {streamItems.map((item) => (
              <div key={item.title} className="flex items-start gap-3">
                <span
                  className={`mt-0.5 inline-flex h-4 w-4 rounded-full border-2 ${
                    item.active ? 'border-blue-600 bg-blue-50' : 'border-slate-300 bg-white'
                  }`}
                />
                <div>
                  <p className="text-base font-semibold text-slate-900">{item.title}</p>
                  <p className="text-[0.8rem] font-medium text-slate-500">{item.time}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.article>

        <motion.article
          variants={cardVariants}
          whileHover={{ y: -1 }}
          className="rounded-2xl border border-slate-300 bg-white px-6 py-5 xl:col-span-4"
        >
          <div className="flex items-center gap-2 text-[1.65rem] font-bold tracking-tight text-slate-900">
            <Shield className="h-5 w-5 text-slate-600" />
            Access Summary
          </div>

          <div className="mt-5 space-y-4">
            <div>
              <div className="mb-1 flex items-center justify-between text-[0.95rem] font-medium text-slate-700">
                <span>Admin Logins</span>
                <span className="font-bold text-slate-900">24</span>
              </div>
              <div className="h-1.5 rounded-full bg-slate-100">
                <div className="h-full w-[72%] rounded-full bg-slate-600" />
              </div>
            </div>

            <div>
              <div className="mb-1 flex items-center justify-between text-[0.95rem] font-medium text-slate-700">
                <span>Failed Attempts</span>
                <span className="font-bold text-red-700">2</span>
              </div>
              <div className="h-1.5 rounded-full bg-slate-100">
                <div className="h-full w-[9%] rounded-full bg-red-700" />
              </div>
            </div>
          </div>
        </motion.article>

        <motion.article
          variants={cardVariants}
          whileHover={{ y: -1 }}
          className="rounded-2xl border border-slate-300 bg-white px-6 py-5 xl:col-span-4"
        >
          <div className="flex items-center gap-2 text-[1.65rem] font-bold tracking-tight text-slate-900">
            <ChartNoAxesColumnIncreasing className="h-5 w-5 text-slate-600" />
            System Health
          </div>

          <div className="mt-5 flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-violet-100 text-violet-700">
              <Workflow className="h-6 w-6" />
            </div>
            <div>
              <p className="text-[2rem] font-extrabold leading-none text-slate-900">99.98%</p>
              <p className="mt-1 text-[0.8rem] font-semibold uppercase tracking-[0.1em] text-slate-500">Uptime (24H)</p>
            </div>
          </div>
        </motion.article>
      </section>
    </motion.div>
  );
};

export default SystemMonitoringReports;
