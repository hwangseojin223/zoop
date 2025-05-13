import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function PrivateRoute({ children, allowedUserType }) {
  const { authState, isInitialized } = useAuth();

  if (!isInitialized) return null; // ✅ 복원 완료 전에는 아무것도 안 보여줌

  if (!authState.token) {
    return <Navigate to="/auth/login" replace />;
  }

  if (allowedUserType && authState.userType !== allowedUserType) {
    return <Navigate to="/auth/login" replace />;
  }

  return children;
}
