import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const RoleProtectedRoute = ({ allowedRole, children }) => {
  const { role, loading } = useAuth();

  if (loading) return null;
  if (role !== allowedRole) return <Navigate to="/dashboard" replace />;

  return children;
};

export default RoleProtectedRoute;