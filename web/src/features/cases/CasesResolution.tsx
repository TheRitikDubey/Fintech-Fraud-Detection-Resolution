import { motion } from 'framer-motion';
import {
  Bot,
  CircleDot,
  Flame,
  MapPin,
  MessageSquare,
  RefreshCcw,
  Save,
  Snowflake,
  UserRound,
  UserRoundCheck,
} from 'lucide-react';

const timelineEvents = [
  {
    id: 'velocity-rule',
    title: 'Velocity Rule Triggered',
    description: 'System detected 5 transactions exceeding $500 in under 60 seconds.',
    time: '10:01',
    icon: Flame,
    iconColor: 'text-red-500',
    iconBg: 'bg-red-50',
    meta: 'System',
    metaClass: 'bg-slate-100 text-slate-500',
  },
  {
    id: 'ai-freeze',
    title: 'AI Suggested Freeze',
    description: 'Anomaly detected: Geographical mismatch with user history.',
    time: '10:02',
    icon: Bot,
    iconColor: 'text-blue-500',
    iconBg: 'bg-blue-50',
    meta: '94% Confidence (AI Engine v4.2)',
    metaClass: 'border border-blue-200 bg-blue-50 text-blue-600',
  },
  {
    id: 'agent-assigned',
    title: 'Agent assigned to case',
    description: 'Case automatically routed to Fraud Response Tier 2.',
    time: '10:03',
    icon: UserRound,
    iconColor: 'text-slate-500',
    iconBg: 'bg-slate-100',
    meta: 'Agent: Alex Chen',
    metaClass: 'bg-slate-100 text-slate-500',
  },
  {
    id: 'card-frozen',
    title: 'Card frozen',
    description: 'Temporary lock applied to Visa Debit ending in *4412.',
    time: '10:04',
    icon: Snowflake,
    iconColor: 'text-slate-700',
    iconBg: 'bg-slate-200',
    meta: 'Action Taken',
    metaClass: 'bg-slate-900 uppercase tracking-wide text-white',
  },
];

const linkedTransactions = [
  {
    id: '#TXN-9022-FA',
    merchant: 'Luxury Electronics Store',
    location: 'London, GB',
    amount: '$1,299.00',
    risk: 'High',
    riskClass: 'bg-red-100 text-red-700',
  },
  {
    id: '#TXN-9023-FA',
    merchant: 'Apple Online Store',
    location: 'Cupertino, US',
    amount: '$999.00',
    risk: 'High',
    riskClass: 'bg-red-100 text-red-700',
  },
  {
    id: '#TXN-9024-FA',
    merchant: 'Global VPN Services',
    location: 'Remote',
    amount: '$45.00',
    risk: 'Medium',
    riskClass: 'bg-blue-100 text-blue-700',
  },
];

const containerVariants = {
  hidden: { opacity: 0, y: 10 },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      staggerChildren: 0.08,
      duration: 0.3,
    },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0, transition: { duration: 0.3 } },
};

const CasesResolution = () => {
  return (
    <motion.div
      className="relative mx-auto max-w-[1260px] space-y-6 pb-6 text-slate-900"
      variants={containerVariants}
      initial="hidden"
      animate="show"
    >
      <motion.header variants={cardVariants} className="space-y-3">
        <p className="text-sm font-medium text-slate-500">Cases &nbsp;›&nbsp; CS-89241-XP</p>

        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="space-y-3">
            <h1 className="text-[2.2rem] font-extrabold leading-[1.1] tracking-tight text-slate-900 md:text-[2.45rem]">Case ID: CS-89241-XP</h1>
            <div className="flex flex-wrap items-center gap-x-7 gap-y-2 text-sm">
              <span className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1 font-semibold text-blue-700">
                <CircleDot className="h-3.5 w-3.5" />
                In-Progress
              </span>
              <span className="font-medium text-slate-500">
                Assigned to: <strong className="font-semibold text-slate-700">Alex Chen</strong>
              </span>
              <span className="font-medium text-slate-500">
                Created: <strong className="font-semibold text-slate-700">Oct 24, 2023 · 10:01 AM</strong>
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <motion.button
              whileHover={{ y: -1 }}
              whileTap={{ scale: 0.98 }}
              className="rounded-xl border border-slate-200 bg-white px-6 py-3 text-base font-semibold text-slate-700 shadow-sm transition-colors hover:bg-slate-50"
            >
              Assign New Agent
            </motion.button>
            <motion.button
              whileHover={{ y: -1 }}
              whileTap={{ scale: 0.98 }}
              className="rounded-xl bg-blue-600 px-6 py-3 text-base font-semibold text-white shadow-sm transition-colors hover:bg-blue-700"
            >
              Resolve Case
            </motion.button>
          </div>
        </div>
      </motion.header>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-12">
        <motion.section
          variants={cardVariants}
          whileHover={{ y: -1 }}
          className="overflow-hidden rounded-2xl border border-slate-200 bg-white xl:col-span-5"
        >
          <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">
            <h2 className="text-[1.95rem] font-bold tracking-tight text-slate-900">Investigation Timeline</h2>
            <button className="inline-flex items-center gap-2 text-base font-semibold text-blue-600 hover:text-blue-700">
              <RefreshCcw className="h-4 w-4" />
              Refresh
            </button>
          </div>

          <div className="relative space-y-8 px-6 py-7">
            <div className="absolute left-[39px] top-10 h-[calc(100%-78px)] w-px bg-slate-200" />

            {timelineEvents.map((event, index) => {
              const Icon = event.icon;
              return (
                <motion.article
                  key={event.id}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.08 * index + 0.24 }}
                  className="relative grid grid-cols-[30px_1fr_auto] items-start gap-4"
                >
                  <div className={`relative z-10 mt-0.5 flex h-7 w-7 items-center justify-center rounded-full ${event.iconBg}`}>
                    <Icon className={`h-3.5 w-3.5 ${event.iconColor}`} />
                  </div>

                  <div className="space-y-1.5 pr-2">
                    <h3 className="text-[1.05rem] font-bold tracking-tight text-slate-900">{event.title}</h3>
                    <p className="max-w-[450px] text-[0.9rem] leading-[1.5] text-slate-600">{event.description}</p>
                    <span className={`inline-flex rounded-md px-2.5 py-1 text-sm font-medium ${event.metaClass}`}>
                      {event.meta}
                    </span>
                  </div>

                  <span className="pt-0.5 text-sm font-medium text-slate-400">{event.time}</span>
                </motion.article>
              );
            })}
          </div>
        </motion.section>

        <div className="space-y-6 xl:col-span-7">
          <motion.section
            variants={cardVariants}
            whileHover={{ y: -1 }}
            className="overflow-hidden rounded-2xl border border-slate-200 bg-white"
          >
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">
              <h2 className="text-[1.95rem] font-bold tracking-tight text-slate-900">Linked Transactions</h2>
              <span className="text-xs font-bold uppercase tracking-[0.24em] text-slate-400">3 Items Found</span>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full text-left">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-6 py-3 text-xs font-semibold uppercase tracking-[0.15em] text-slate-500">
                      Transaction ID
                    </th>
                    <th className="px-6 py-3 text-xs font-semibold uppercase tracking-[0.15em] text-slate-500">Merchant</th>
                    <th className="px-6 py-3 text-xs font-semibold uppercase tracking-[0.15em] text-slate-500">Amount</th>
                    <th className="px-6 py-3 text-xs font-semibold uppercase tracking-[0.15em] text-slate-500">Risk</th>
                  </tr>
                </thead>
                <tbody>
                  {linkedTransactions.map((txn, index) => (
                    <motion.tr
                      key={txn.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.06 + 0.34 }}
                      className="border-b border-slate-200 last:border-b-0"
                    >
                      <td className="px-6 py-4 text-[1.15rem] font-semibold text-slate-800">{txn.id}</td>
                      <td className="px-6 py-4">
                        <div className="text-[1.15rem] font-bold leading-tight text-slate-900">{txn.merchant}</div>
                        <div className="mt-1 text-[0.9rem] text-slate-500">{txn.location}</div>
                      </td>
                      <td className="px-6 py-4 text-[1.6rem] font-extrabold text-slate-900">{txn.amount}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex rounded-md px-2.5 py-1 text-sm font-medium ${txn.riskClass}`}>
                          {txn.risk}
                        </span>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.section>

          <motion.section
            variants={cardVariants}
            whileHover={{ y: -1 }}
            className="overflow-hidden rounded-2xl border border-slate-200 bg-white"
          >
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">
              <h2 className="text-[1.95rem] font-bold tracking-tight text-slate-900">Agent Investigation Notes</h2>
              <span className="inline-flex items-center gap-2 text-sm font-medium text-slate-400">
                <Save className="h-4 w-4" />
                Auto-saved at 10:45 AM
              </span>
            </div>

            <div className="px-6 py-6">
              <div className="rounded-xl bg-slate-50 px-5 py-4 text-[0.95rem] leading-[1.55] text-slate-800">
                <p>
                  Case review initiated. User&apos;s primary location is San Francisco, CA. Rapid sequence of high-value
                  transactions detected in London and Cupertino within 5 minutes.
                </p>
                <p className="mt-5">User reached via SMS verification - failed.</p>
                <p>Card frozen as a preventative measure.</p>
                <p className="mt-5">Pending merchant verification for TXN-9022-FA.</p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-7 border-t border-slate-200 px-6 py-4">
              <button className="text-base font-semibold text-slate-500 hover:text-slate-700">Clear</button>
              <motion.button
                whileTap={{ scale: 0.985 }}
                whileHover={{ y: -1 }}
                className="rounded-xl bg-slate-900 px-8 py-3 text-base font-semibold text-white shadow-sm transition-colors hover:bg-slate-800"
              >
                Submit Investigation Report
              </motion.button>
            </div>
          </motion.section>

          <motion.div variants={cardVariants} className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <motion.article
              whileHover={{ y: -1 }}
              className="rounded-2xl border border-slate-200 bg-white px-5 py-4"
            >
              <div className="mb-3 inline-flex items-center gap-2 text-[1.7rem] font-bold tracking-tight text-slate-800">
                <UserRoundCheck className="h-5 w-5 text-slate-400" />
                User Trust Score
              </div>
              <div className="flex items-end gap-2">
                <span className="text-5xl font-extrabold text-blue-700">842</span>
                <span className="pb-2 text-lg font-medium text-slate-500">/1000</span>
              </div>
              <div className="mt-3 h-2 w-full rounded-full bg-slate-100">
                <div className="h-full w-[84.2%] rounded-full bg-blue-700" />
              </div>
            </motion.article>

            <motion.article
              whileHover={{ y: -1 }}
              className="rounded-2xl border border-slate-200 bg-white px-5 py-4"
            >
              <div className="mb-3 inline-flex items-center gap-2 text-[1.7rem] font-bold tracking-tight text-slate-800">
                <MapPin className="h-5 w-5 text-slate-400" />
                Last Verified Location
              </div>
              <p className="text-4xl font-bold text-slate-900">San Francisco, CA</p>
              <p className="mt-1 text-xl font-medium text-slate-500">Last IP: 192.168.1.42 (Oct 23)</p>
            </motion.article>
          </motion.div>
        </div>
      </div>

      <motion.button
        aria-label="Open support chat"
        whileHover={{ y: -2, scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="fixed bottom-8 right-8 flex h-16 w-16 items-center justify-center rounded-full bg-blue-600 text-white shadow-[0_12px_26px_rgba(37,99,235,0.35)] transition-colors hover:bg-blue-700"
      >
        <MessageSquare className="h-7 w-7" />
      </motion.button>
    </motion.div>
  );
};

export default CasesResolution;
