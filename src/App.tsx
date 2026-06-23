import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { PrivateRoute } from './components/PrivateRoute';
import { Layout } from './components/Layout';
import { Login } from './views/Login';
import { Dashboard } from './views/Dashboard';
import { Tropeles } from './views/Tropeles';
import { Signals } from './views/Signals';
import { SectorStory } from './views/SectorStory';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public authentication route */}
          <Route path="/login" element={<Login />} />

          {/* Protected operational routes */}
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
                  <Tropeles />
                </Layout>
              </PrivateRoute>
            }
          />

          <Route
            path="/signals"
            element={
              <PrivateRoute>
                <Layout>
                  <Signals />
                </Layout>
              </PrivateRoute>
            }
          />

          <Route
            path="/sectors/:id/story"
            element={
              <PrivateRoute>
                <Layout>
                  <SectorStory />
                </Layout>
              </PrivateRoute>
            }
          />

          {/* Default redirect routing */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
