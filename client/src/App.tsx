import AppLayout from './components/Layout/AppLayout';
import TransactionsLedger from './features/transactions/TransactionsLedger';
import './index.css';

function App() {
  return (
    <AppLayout>
      <TransactionsLedger />
    </AppLayout>
  );
}

export default App;
