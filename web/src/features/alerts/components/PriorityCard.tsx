import React from 'react';
import { Zap } from 'lucide-react';
import { motion } from 'framer-motion';

const PriorityCard: React.FC = () => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="bg-blue-600 rounded-xl p-5 text-white shadow-lg shadow-blue-500/30 flex flex-col justify-between h-full"
      style={{
        backgroundImage: 'linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)'
      }}
    >
      <div>
        <div className="flex justify-between items-start mb-4">
          <div className="bg-white/20 p-2 rounded-lg">
            <Zap size={20} className="text-white" />
          </div>
          <span className="text-[10px] font-bold uppercase tracking-wider bg-white/20 px-2 py-1 rounded">Priority</span>
        </div>
        
        <h3 className="text-lg font-bold mb-2">Fast Resolve Active</h3>
        <p className="text-blue-100 text-sm leading-relaxed mb-6">
          Auto-routing high-risk cases to your workstation based on previous resolutions.
        </p>
      </div>

      <div className="flex justify-between items-end">
        <span className="text-sm text-blue-100 font-medium">Efficiency</span>
        <span className="text-2xl font-bold">94%</span>
      </div>
    </motion.div>
  );
};

export default PriorityCard;
