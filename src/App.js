import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

// Páginas e componentes
import Login from './pages/Login';
import EmployeeDashboard from './pages/EmployeeDashboard';
import AdminDashboard from './pages/AdminDashboard';
import AdminMap from './pages/AdminMap';
import AdminEmployees from './pages/AdminEmployees';
import AdminProjects from './pages/AdminProjects';
import AdminReports from './pages/AdminReports';
import NotFound from './pages/NotFound';

// Contexto de autenticação
import { AuthProvider } from './contexts/AuthContext';

// Tema personalizado
const theme = createTheme({
  palette: {
    primary: {
      main: '#0F1A20', // Azul escuro
    },
    secondary: {
      main: '#C69C6D', // Dourado
    },
    background: {
      default: '#f8f9fa',
      paper: '#ffffff',
    },
  },
  typography: {
    fontFamily: [
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      'Roboto',
      '"Helvetica Neue"',
      'Arial',
      'sans-serif',
    ].join(','),
  },
});

// Componente de rota protegida
const ProtectedRoute = ({ children, userType }) => {
  const isAuthenticated = localStorage.getItem('user');
  const user = isAuthenticated ? JSON.parse(isAuthenticated) : null;
  
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }
  
  if (userType && user.role !== userType) {
    return <Navigate to={user.role === 'admin' ? '/admin' : '/'} />;
  }
  
  return children;
};

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/login" element={<Login />} />
            
            {/* Rotas do Funcionário */}
            <Route 
              path="/" 
              element={
                <ProtectedRoute userType="employee">
                  <EmployeeDashboard />
                </ProtectedRoute>
              } 
            />
            
            {/* Rotas do Administrador */}
            <Route 
              path="/admin" 
              element={
                <ProtectedRoute userType="admin">
                  <AdminDashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/map" 
              element={
                <ProtectedRoute userType="admin">
                  <AdminMap />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/employees" 
              element={
                <ProtectedRoute userType="admin">
                  <AdminEmployees />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/projects" 
              element={
                <ProtectedRoute userType="admin">
                  <AdminProjects />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/reports" 
              element={
                <ProtectedRoute userType="admin">
                  <AdminReports />
                </ProtectedRoute>
              } 
            />
            
            {/* Rota 404 */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
