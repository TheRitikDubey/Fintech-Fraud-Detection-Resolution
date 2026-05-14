import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import AppLayout from './components/Layout/AppLayout';
import TransactionsLedger from './features/transactions/TransactionsLedger';
import DashboardOverview from './features/dashboard/DashboardOverview';
import AlertsQueue from './features/alerts/AlertsQueue';
import './index.css';

function App() {
  return (
    <Router>
      <AppLayout>
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<DashboardOverview />} />
          <Route path="/transactions" element={<TransactionsLedger />} />
          <Route path="/alerts" element={<AlertsQueue />} />
          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </AppLayout>
    </Router>
  );
}

export default App;
