import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const ProtectedRoute = () => {
  // const { isAdmin, loading } = useAuth();

  // if (loading) {
  //   // You can optionally render a loading spinner here
  //   return <div>Loading...</div>;
  // }

  return <Outlet />;
};

export default ProtectedRoute; 