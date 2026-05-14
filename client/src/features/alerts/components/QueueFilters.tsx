import React from 'react';
import { Filter } from 'lucide-react';

const QueueFilters: React.FC = () => {
  return (
    <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-sm font-semibold text-gray-800">Queue Filters</h3>
        <Filter className="text-gray-400" size={16} />
      </div>

      <div className="space-y-6">
        {/* Severity Level */}
        <div>
          <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Severity Level</h4>
          <div className="space-y-2">
            <label className="flex items-center justify-between cursor-pointer group">
              <div className="flex items-center gap-2">
                <input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" defaultChecked />
                <span className="text-sm text-gray-700 group-hover:text-gray-900">Critical Risk</span>
              </div>
              <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded font-medium">12</span>
            </label>
            <label className="flex items-center justify-between cursor-pointer group">
              <div className="flex items-center gap-2">
                <input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" defaultChecked />
                <span className="text-sm text-gray-700 group-hover:text-gray-900">High Risk</span>
              </div>
              <span className="text-xs bg-orange-100 text-orange-600 px-2 py-0.5 rounded font-medium">48</span>
            </label>
            <label className="flex items-center justify-between cursor-pointer group">
              <div className="flex items-center gap-2">
                <input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                <span className="text-sm text-gray-700 group-hover:text-gray-900">Medium Risk</span>
              </div>
              <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded font-medium">156</span>
            </label>
          </div>
        </div>

        {/* Alert Status */}
        <div>
          <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Alert Status</h4>
          <div className="space-y-1">
            <button className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors">
              <div className="w-2 h-2 rounded-full bg-blue-500"></div>
              Pending Review
            </button>
            <button className="w-full flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-900 bg-gray-50 border border-gray-200 rounded-lg transition-colors shadow-sm">
              <div className="w-2 h-2 rounded-full bg-orange-500"></div>
              Investigating
            </button>
            <button className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors">
              <div className="w-2 h-2 rounded-full bg-green-500"></div>
              Resolved Today
            </button>
          </div>
        </div>

        {/* Assigned To */}
        <div>
          <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Assigned To</h4>
          <select className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent">
            <option>Me (Current User)</option>
            <option>Unassigned</option>
            <option>All Users</option>
          </select>
        </div>
      </div>
    </div>
  );
};

export default QueueFilters;
