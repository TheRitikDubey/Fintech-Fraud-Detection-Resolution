import React, { useEffect, useState } from 'react';
import { AlertTriangle, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { api } from '../../../api';

const StatCards: React.FC = () => {
  const [backlog, setBacklog] = useState(0);
  const [resolved, setResolved] = useState(0);

  useEffect(() => {
    let cancelled = false;
    Promise.all([
      api.listAlerts({ status: 'OPEN', limit: 100 }),
      api.listAlerts({ status: 'RESOLVED', limit: 100 }),
    ]).then(([open, done]) => {
      if (cancelled) return;
      setBacklog(open.items.length);
      setResolved(done.items.length);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="grid grid-cols-2 gap-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm flex items-center gap-4"
      >
        <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center">
          <AlertTriangle className="text-red-500" size={20} />
        </div>
        <div>
          <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Backlog</h4>
          <div className="text-2xl font-bold text-gray-900">{backlog} <span className="text-sm font-medium text-gray-500">Open</span></div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm flex items-center gap-4"
      >
        <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center">
          <CheckCircle2 className="text-green-500" size={20} />
        </div>
        <div>
          <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Resolved</h4>
          <div className="text-2xl font-bold text-gray-900">{resolved} <span className="text-sm font-medium text-gray-500">Cases</span></div>
        </div>
      </motion.div>
    </div>
  );
};

export default StatCards;
