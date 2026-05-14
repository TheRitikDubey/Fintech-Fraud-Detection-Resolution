import React from 'react';
import { AlertTriangle, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';

const StatCards: React.FC = () => {
  return (
    <div className="grid grid-cols-2 gap-4">
      {/* Backlog Card */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm flex items-center justify-between"
      >
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center">
            <AlertTriangle className="text-red-500" size={20} />
          </div>
          <div>
            <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Backlog</h4>
            <div className="text-2xl font-bold text-gray-900">142 <span className="text-sm font-medium text-gray-500">Items</span></div>
          </div>
        </div>
        <div className="text-right flex flex-col items-end">
          <span className="text-red-500 font-semibold text-sm">+12%</span>
          <span className="text-xs text-gray-400 mt-1">Since 8AM</span>
        </div>
      </motion.div>

      {/* Resolved Today Card */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm flex items-center justify-between"
      >
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center">
            <CheckCircle2 className="text-green-500" size={20} />
          </div>
          <div>
            <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Resolved Today</h4>
            <div className="text-2xl font-bold text-gray-900">89 <span className="text-sm font-medium text-gray-500">Cases</span></div>
          </div>
        </div>
        <div className="text-right flex flex-col items-end">
          <span className="text-green-500 font-semibold text-sm">Avg 8.4m</span>
          <span className="text-xs text-gray-400 mt-1">Resolution Time</span>
        </div>
      </motion.div>
    </div>
  );
};

export default StatCards;
