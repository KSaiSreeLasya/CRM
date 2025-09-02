import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ChakraProvider, Box, Center, Text } from '@chakra-ui/react';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import DashboardTG from './pages/DashboardTG';
import DashboardAP from './pages/DashboardAP';
import DashboardChitoor from './pages/DashboardChitoor';
import Projects from './components/Projects';
import ProjectDetails from './components/ProjectDetails';
import Reports from './components/Reports';
import Finance from './pages/Finance';
import Payments from './pages/Payments';
import ServiceTickets from './pages/ServiceTickets';
import TelanganaProjects from './pages/TelanganaProjects';
import APProjects from './pages/APProjects';
import ChitoorProjects from './pages/ChitoorProjects';
import Admin from './pages/Admin';
import StockWarehouse from './pages/StockWarehouse';
import Logistics from './pages/Logistics';
import Procurement from './pages/Procurement';
import PrivateRoute from './components/PrivateRoute';
import Layout from './components/Layout';
import { AuthProvider } from './context/AuthContext';

// Finance route is handled by PrivateRoute, so this is no longer needed

class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <Center h="100vh">
          <Box textAlign="center">
            <Text fontSize="xl" color="red.500" mb={4}>
              Something went wrong
            </Text>
            <Text color="gray.600">
              {this.state.error?.message || 'An unexpected error occurred'}
            </Text>
          </Box>
        </Center>
      );
    }

    return this.props.children;
  }
}

const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <ChakraProvider>
        <Router>
          <AuthProvider>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route
                path="/"
                element={
                  <PrivateRoute>
                    <Navigate to="/dashboard" replace />
                  </PrivateRoute>
                }
              />
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
                path="/dashboard/tg"
                element={
                  <PrivateRoute>
                    <Layout>
                      <DashboardTG />
                    </Layout>
                  </PrivateRoute>
                }
              />
              <Route
                path="/dashboard/ap"
                element={
                  <PrivateRoute>
                    <Layout>
                      <DashboardAP />
                    </Layout>
                  </PrivateRoute>
                }
              />
              <Route
                path="/dashboard/chitoor"
                element={
                  <PrivateRoute>
                    <Layout>
                      <DashboardChitoor />
                    </Layout>
                  </PrivateRoute>
                }
              />
              <Route
                path="/finance"
                element={
                  <PrivateRoute>
                    <Layout>
                      <Finance />
                    </Layout>
                  </PrivateRoute>
                }
              />
              <Route
                path="/payments"
                element={
                  <PrivateRoute>
                    <Layout>
                      <Payments />
                    </Layout>
                  </PrivateRoute>
                }
              />
              <Route
                path="/projects"
                element={
                  <PrivateRoute>
                    <Layout>
                      <Projects />
                    </Layout>
                  </PrivateRoute>
                }
              />
              <Route
                path="/modules"
                element={
                  <PrivateRoute>
                    <Layout>
                      {React.createElement(require('./components/ModulesPage').default)}
                    </Layout>
                  </PrivateRoute>
                }
              />
              <Route
                path="/logistics/modules"
                element={
                  <PrivateRoute>
                    <Layout>
                      {React.createElement(require('./components/ModulesPage').default)}
                    </Layout>
                  </PrivateRoute>
                }
              />
              <Route
                path="/projects/:id"
                element={
                  <PrivateRoute>
                    <Layout>
                      <ProjectDetails />
                    </Layout>
                  </PrivateRoute>
                }
              />
              <Route
                path="/reports"
                element={
                  <PrivateRoute>
                    <Layout>
                      <Reports />
                    </Layout>
                  </PrivateRoute>
                }
              />
              <Route
                path="/reports/tg"
                element={
                  <PrivateRoute>
                    <Layout>
                      {React.createElement(require('./components/Reports').default, { stateFilter: 'Telangana' })}
                    </Layout>
                  </PrivateRoute>
                }
              />
              <Route
                path="/reports/ap"
                element={
                  <PrivateRoute>
                    <Layout>
                      {React.createElement(require('./components/Reports').default, { stateFilter: 'Andhra Pradesh' })}
                    </Layout>
                  </PrivateRoute>
                }
              />
              <Route
                path="/reports/chitoor"
                element={
                  <PrivateRoute>
                    <Layout>
                      {React.createElement(require('./components/Reports').default, { stateFilter: 'Chitoor' })}
                    </Layout>
                  </PrivateRoute>
                }
              />
              <Route
                path="/service-tickets"
                element={
                  <PrivateRoute>
                    <Layout>
                      <ServiceTickets />
                    </Layout>
                  </PrivateRoute>
                }
              />
              <Route
                path="/projects/telangana"
                element={
                  <PrivateRoute>
                    <Layout>
                      <TelanganaProjects />
                    </Layout>
                  </PrivateRoute>
                }
              />
              <Route
                path="/projects/ap"
                element={
                  <PrivateRoute>
                    <Layout>
                      <APProjects />
                    </Layout>
                  </PrivateRoute>
                }
              />
              <Route
                path="/projects/chitoor"
                element={
                  <PrivateRoute>
                    <Layout>
                      <ChitoorProjects />
                    </Layout>
                  </PrivateRoute>
                }
              />
              <Route
                path="/projects/chitoor/:id"
                element={
                  <PrivateRoute>
                    <Layout>
                      {/* Chitoor Project Details */}
                      {React.createElement(require('./components/ChitoorProjectDetails').default)}
                    </Layout>
                  </PrivateRoute>
                }
              />
              <Route
                path="/admin"
                element={
                  <PrivateRoute>
                    <Layout>
                      <Admin />
                    </Layout>
                  </PrivateRoute>
                }
              />
              <Route
                path="/stock"
                element={
                  <PrivateRoute>
                    <Layout>
                      <StockWarehouse />
                    </Layout>
                  </PrivateRoute>
                }
              />
              <Route
                path="/logistics"
                element={
                  <PrivateRoute>
                    <Layout>
                      <Logistics />
                    </Layout>
                  </PrivateRoute>
                }
              />
            </Routes>
          </AuthProvider>
        </Router>
      </ChakraProvider>
    </ErrorBoundary>
  );
};

export default App;
