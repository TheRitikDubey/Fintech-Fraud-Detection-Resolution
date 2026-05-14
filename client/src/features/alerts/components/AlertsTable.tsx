import React from 'react';
import { MoreHorizontal } from 'lucide-react';
import { motion } from 'framer-motion';
import type { Alert } from '../types';

interface AlertsTableProps {
  alerts: Alert[];
}

const AlertsTable: React.FC<AlertsTableProps> = ({ alerts }) => {
  const getRiskBadge = (level: string) => {
    switch (level) {
      case 'CRITICAL':
        return (
          <span className="inline-flex items-center gap-1.5 bg-red-100 text-red-700 px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wide">
            <span>!</span> CRITICAL
          </span>
        );
      case 'HIGH':
        return (
          <span className="inline-flex items-center gap-1.5 bg-orange-100 text-orange-700 px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wide">
            <span className="text-[10px]">▲</span> HIGH
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 bg-yellow-100 text-yellow-700 px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wide">
            MEDIUM
          </span>
        );
    }
  };

  const getStatusText = (status: string) => {
    let colorClass = '';
    switch (status) {
      case 'Pending Review': colorClass = 'text-blue-600'; break;
      case 'Investigating': colorClass = 'text-orange-600'; break;
      case 'Resolved Today': colorClass = 'text-green-600'; break;
      default: colorClass = 'text-gray-600';
    }
    
    return (
      <div className="flex items-center gap-2">
        <div className={`w-1.5 h-1.5 rounded-full ${colorClass.replace('text-', 'bg-')}`}></div>
        <span className={`text-sm font-semibold ${colorClass}`}>{status}</span>
      </div>
    );
  };

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden flex flex-col">
      <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100">
        <div className="flex items-center gap-4">
          <h3 className="text-sm font-semibold text-gray-800">Live Monitoring</h3>
          <span className="bg-green-100 text-green-700 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
            System Healthy
          </span>
        </div>
        <button className="p-1.5 hover:bg-gray-100 rounded-md transition-colors text-gray-400">
          <MoreHorizontal size={20} />
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50/50">
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Alert ID</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Transaction</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Risk Level</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Timestamp</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
            </tr>
          </thead>
          <tbody>
            {alerts.map((alert, index) => (
              <motion.tr 
                key={alert.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors group cursor-pointer"
              >
                <td className="px-6 py-4">
                  <span className="text-sm font-semibold text-blue-600 group-hover:underline">
                    {alert.id}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm font-bold text-gray-900">{alert.transactionId}</div>
                  <div className="text-xs text-gray-500 mt-1">
                    ${alert.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} • {alert.location}
                  </div>
                </td>
                <td className="px-6 py-4">
                  {getRiskBadge(alert.riskLevel)}
                </td>
                <td className="px-6 py-4 text-sm text-gray-600 font-medium">
                  {alert.timestamp}
                </td>
                <td className="px-6 py-4">
                  {getStatusText(alert.status)}
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="px-6 py-4 border-t border-gray-100 flex justify-between items-center bg-gray-50/30">
        <span className="text-sm text-gray-500 font-medium">Showing 1-{alerts.length} of 214 high-risk alerts</span>
        <div className="flex gap-2">
          <button className="px-3 py-1.5 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-md hover:bg-gray-50 disabled:opacity-50 transition-colors">Previous</button>
          <button className="px-3 py-1.5 text-sm font-medium text-gray-900 bg-white border border-gray-200 rounded-md hover:bg-gray-50 transition-colors shadow-sm">Next</button>
        </div>
      </div>
    </div>
  );
};

export default AlertsTable;
