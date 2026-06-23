import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { PrivateRoute } from './components/PrivateRoute';
import { Layout } from './components/Layout';
import { Login } from './views/Login';
import { Dashboard } from './views/Dashboard';
import TropelesPage from './pages/TropelesPage';
import SignalsFeedPage from './pages/SignalsFeedPage';
import { SectorStory } from './views/SectorStory';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />

          <Route
            path="/dashboard"
            element={
              <PrivateRoute>
                <Layout>
                  <Dashboard />
                </Layout>
              </PrivateRoute>
            }
          />

          <Route
            path="/tropels"
            element={
              <PrivateRoute>
                <Layout>
                  <TropelesPage />
                </Layout>
              </PrivateRoute>
            }
          />

          <Route
            path="/signals"
            element={
              <PrivateRoute>
                <Layout>
                  <SignalsFeedPage />
                </Layout>
              </PrivateRoute>
            }
          />

          <Route
            path="/sectors/:id/story"
            element={
              <PrivateRoute>
                <SectorStory />
              </PrivateRoute>
            }
          />

          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;