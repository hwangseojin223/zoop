// src/routes/PublicOnlyRoute.jsx
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function PublicOnlyRoute({ children }) {
  const { authState, isInitialized } = useAuth();

  if (!isInitialized) return null;

  if (authState.token) {
    return <Navigate to="/company/dashboard" replace />;
  }

  return children;
}
