import React from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { LMSProvider } from './contexts/LMSContext';
import { AuthPage } from './components/auth/AuthPage';
import { Layout } from './components/layout/Layout';
import { AppRouter } from './components/router/AppRouter';
import TokenExpirationWarning from './components/TokenExpirationWarning';

const AppContent: React.FC = () => {
  const { user, isAuthenticated } = useAuth();

  if (!user) {
    return <AuthPage />;
  }

  return (
    <LMSProvider>
      <Layout>
        <AppRouter />
      </Layout>
      {isAuthenticated && <TokenExpirationWarning warningThresholdMinutes={5} />}
    </LMSProvider>
  );
};

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;