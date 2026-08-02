import type { ReactNode } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import AppLayout from './components/Layout/AppLayout';
import TransactionsLedger from './features/transactions/TransactionsLedger';
import DashboardOverview from './features/dashboard/DashboardOverview';
import AlertsQueue from './features/alerts/AlertsQueue';
import CustomerDetail from './features/customer/CustomerDetail';
import CasesResolution from './features/cases/CasesResolution';
import SystemMonitoringReports from './features/reports/SystemMonitoringReports';
import LoginPage from './features/auth/LoginPage';
import SignupPage from './features/auth/SignupPage';
import { AuthProvider, useAuth } from './auth/AuthContext';
import './index.css';

function RequireAuth({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center text-gray-400 text-sm">Loading…</div>
    );
  }
  if (!user) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

function ProtectedApp() {
  return (
    <RequireAuth>
      <AppLayout>
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<DashboardOverview />} />
          <Route path="/transactions" element={<TransactionsLedger />} />
          <Route path="/alerts" element={<AlertsQueue />} />
          <Route path="/customer/:id" element={<CustomerDetail />} />
          <Route path="/cases" element={<CasesResolution />} />
          <Route path="/reports" element={<SystemMonitoringReports />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </AppLayout>
    </RequireAuth>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/*" element={<ProtectedApp />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
