import React, { useEffect, useState } from 'react';
import { Filter } from 'lucide-react';
import { api } from '../../../api';

const QueueFilters: React.FC = () => {
  const [counts, setCounts] = useState({ CRITICAL: 0, HIGH: 0, MEDIUM: 0 });

  useEffect(() => {
    let cancelled = false;
    Promise.all([
      api.listAlerts({ risk: 'CRITICAL', limit: 100 }),
      api.listAlerts({ risk: 'HIGH', limit: 100 }),
      api.listAlerts({ risk: 'MEDIUM', limit: 100 }),
    ]).then(([critical, high, medium]) => {
      if (cancelled) return;
      setCounts({ CRITICAL: critical.items.length, HIGH: high.items.length, MEDIUM: medium.items.length });
    });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-sm font-semibold text-gray-800">Queue Filters</h3>
        <Filter className="text-gray-400" size={16} />
      </div>

      <div className="space-y-4">
        <div>
          <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Severity Level</h4>
          <div className="space-y-2">
            <label className="flex items-center justify-between cursor-pointer group">
              <div className="flex items-center gap-2">
                <input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" defaultChecked />
                <span className="text-sm text-gray-700 group-hover:text-gray-900">Critical Risk</span>
              </div>
              <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded font-medium">{counts.CRITICAL}</span>
            </label>
            <label className="flex items-center justify-between cursor-pointer group">
              <div className="flex items-center gap-2">
                <input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" defaultChecked />
                <span className="text-sm text-gray-700 group-hover:text-gray-900">High Risk</span>
              </div>
              <span className="text-xs bg-orange-100 text-orange-600 px-2 py-0.5 rounded font-medium">{counts.HIGH}</span>
            </label>
            <label className="flex items-center justify-between cursor-pointer group">
              <div className="flex items-center gap-2">
                <input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                <span className="text-sm text-gray-700 group-hover:text-gray-900">Medium Risk</span>
              </div>
              <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded font-medium">{counts.MEDIUM}</span>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QueueFilters;
