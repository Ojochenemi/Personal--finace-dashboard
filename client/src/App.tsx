import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Shell from './components/layout/Shell';
import DashboardPage from './pages/DashboardPage';
import TransactionsPage from './pages/TransactionsPage';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Shell />}>
          <Route index element={<DashboardPage />} />
          <Route path="transactions" element={<TransactionsPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
