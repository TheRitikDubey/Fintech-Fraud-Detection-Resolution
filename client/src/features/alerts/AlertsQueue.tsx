import React from 'react';
import { Search, Bell, HelpCircle, Download, RefreshCw } from 'lucide-react';
import QueueFilters from './components/QueueFilters';
import AlertsTable from './components/AlertsTable';
import PriorityCard from './components/PriorityCard';
import StatCards from './components/StatCards';
import { mockAlerts } from './data/mockAlerts';

const AlertsQueue: React.FC = () => {
  return (
    <div className="flex-1 bg-[#F9FAFB] min-h-screen text-gray-900 font-sans">
      {/* Page Header */}
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 mb-2 tracking-tight">Risk Alerts Queue</h1>
          <p className="text-gray-500 text-sm font-medium">Monitoring 1,242 real-time transactions for suspicious activity.</p>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 font-semibold rounded-lg text-sm hover:bg-gray-50 transition-all shadow-sm">
            <Download size={16} />
            Export List
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg text-sm hover:bg-blue-700 transition-all shadow-md shadow-blue-500/20">
            <RefreshCw size={16} />
            Refresh Queue
          </button>
        </div>
      </div>

      {/* Main Content Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Sidebar (Filters + Priority) */}
        <div className="lg:col-span-3 flex flex-col gap-6">
          <QueueFilters />
          <div className="flex-1 min-h-[220px]">
            <PriorityCard />
          </div>
        </div>

        {/* Right Main Area (Table + Stats) */}
        <div className="lg:col-span-9 flex flex-col gap-6">
          <div className="flex-1">
            <AlertsTable alerts={mockAlerts} />
          </div>
          <StatCards />
        </div>

      </div>
    </div>
  );
};

export default AlertsQueue;
