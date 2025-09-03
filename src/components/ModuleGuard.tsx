import React from 'react';
import { Navigate } from 'react-router-dom';
import { Center, Spinner, Box, Text } from '@chakra-ui/react';
import { useAuth } from '../context/AuthContext';

const ModuleGuard: React.FC<{ moduleKey: string; children: React.ReactNode }> = ({ moduleKey, children }) => {
  const { isLoading, isAuthenticated, isAdmin, allowedModules } = useAuth();

  if (isLoading) {
    return (
      <Center h="100vh">
        <Spinner size="xl" color="blue.500" />
      </Center>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (isAdmin) return <>{children}</>;

  const allowed = Array.isArray(allowedModules) && allowedModules.includes(moduleKey);
  if (!allowed) {
    return <Navigate to="/welcome" replace />;
  }

  return <>{children}</>;
};

export default ModuleGuard;
