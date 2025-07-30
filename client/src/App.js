import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { QueryClient, QueryClientProvider } from 'react-query';

import { AuthProvider, useAuth } from './contexts/AuthContext';
import { SocketProvider } from './contexts/SocketContext';

import Login from './pages/Login';
import Register from './pages/Register';
import Home from './pages/Home';
import Profile from './pages/Profile';
import Chat from './pages/Chat';
import Explore from './pages/Explore';
import Notifications from './pages/Notifications';
import Settings from './pages/Settings';

import Layout from './components/Layout/Layout';
import LoadingSpinner from './components/Common/LoadingSpinner';
import ErrorBoundary from './components/Common/ErrorBoundary';

import './App.css';
const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
    background: {
      default: '#f5f5f5',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
  },
});

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <LoadingSpinner />;
  }
    if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  return children;
};

const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <LoadingSpinner />;
  }
    if (user) {
    return <Navigate to="/" replace />;
  }
  
  return children;
};

function AppContent() {
  return (    <Router>
      <Routes>
        <Route 
          path="/login" 
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          } 
        />
        <Route 
          path="/register" 
          element={
            <PublicRoute>
              <Register />
            </PublicRoute>
          }        />
        
        <Route
          path="/" 
          element={
            <ProtectedRoute>
              <Layout>
                <Home />
              </Layout>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/explore" 
          element={
            <ProtectedRoute>
              <Layout>
                <Explore />
              </Layout>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/chat" 
          element={
            <ProtectedRoute>
              <Layout>
                <Chat />
              </Layout>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/chat/:chatId" 
          element={
            <ProtectedRoute>
              <Layout>
                <Chat />
              </Layout>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/notifications" 
          element={
            <ProtectedRoute>
              <Layout>
                <Notifications />
              </Layout>
            </ProtectedRoute>
          }        />
        <Route 
          path="/profile/:username" 
          element={
            <ProtectedRoute>
              <Layout>
                <Profile />
              </Layout>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/settings" 
          element={
            <ProtectedRoute>
              <Layout>
                <Settings />
              </Layout>
            </ProtectedRoute>
          }        />
        <Route path="*" element={
          <ProtectedRoute>
            <Navigate to="/" replace />
          </ProtectedRoute>
        } />
      </Routes>
    </Router>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <AuthProvider>
            <SocketProvider>
              <AppContent />
            </SocketProvider>
          </AuthProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
