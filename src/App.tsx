import { BrowserRouter, Routes, Route } from 'react-router-dom';
import TropelesPage from './pages/TropelesPage';
import SignalsFeedPage from './pages/SignalsFeedPage';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/tropels" element={<TropelesPage />} />
        <Route path="/signals/feed" element={<SignalsFeedPage />} />
      </Routes>
    </BrowserRouter>
  );
}
