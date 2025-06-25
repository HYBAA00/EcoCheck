import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Provider } from 'react-redux';
import { store } from './store';
import { useSelector } from 'react-redux';
import { RootState } from './store';
import { ROLES } from './constants';

// Layouts
import MainLayout from './layouts/MainLayout';
import AuthLayout from './layouts/AuthLayout';
import AdminLayout from './layouts/AdminLayout';
import UserLayout from './layouts/UserLayout';
import EmployeeLayout from './layouts/EmployeeLayout';
import EnterpriseLayout from './layouts/EnterpriseLayout';
import AuthorityLayout from './layouts/AuthorityLayout';

// Pages
import Home from './pages/Home';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import CertificationRequest from './pages/certification/CertificationRequest';
import CertificationList from './pages/certification/CertificationList';
import EnterpriseProfile from './pages/enterprise/Profile';
import AuthProvider from './components/AuthProvider';
import AdminDashboard from './pages/admin/Dashboard';
import UserManagement from './pages/admin/UserManagement';
import Reports from './pages/admin/Reports';
import PaymentManagement from './pages/admin/PaymentManagement';
import AdminCertificationRequests from './pages/admin/CertificationRequests';
import AdminProfile from './pages/admin/Profile';
import EmployeeDashboard from './pages/employee/Dashboard';
import EmployeeCertifications from './pages/employee/Certifications';
import EmployeeRequests from './pages/employee/Requests';
import ValidationPage from './pages/employee/Validation';
import RequestDetails from './pages/employee/RequestDetails';
import EmployeeProfile from './pages/employee/Profile';
import EnterpriseDashboard from './pages/enterprise/Dashboard';
import CertificationRequests from './pages/enterprise/CertificationRequests';
import CertificationForm from './pages/enterprise/CertificationForm';
import DailyInfo from './pages/enterprise/DailyInfo';
import PaymentPage from './pages/enterprise/Payment';
import PaymentsPage from './pages/enterprise/Payments';
import CertificatesPage from './pages/enterprise/Certificates';
import HistoryPage from './pages/enterprise/History';

// Authority Pages
import AuthorityDashboard from './pages/authority/Dashboard';
import CertificateConsultation from './pages/authority/CertificateConsultation';
import AuditJournal from './pages/authority/AuditJournal';
import AuditReport from './pages/authority/AuditReport';
import ExportHistorical from './pages/authority/ExportHistorical';
import AuthorityDocuments from './pages/authority/Documents';
import AuthorityProfile from './pages/authority/Profile';
import AuthoritySettings from './pages/authority/Settings';
import CertificatePage from './pages/CertificatePage';

// Create theme
const theme = createTheme({
  palette: {
    primary: {
      main: '#00A896',
      light: '#02C39A',
      dark: '#028090',
    },
    secondary: {
      main: '#1976d2',
      light: '#42a5f5',
      dark: '#1565c0',
    },
    background: {
      default: '#f8fafc',
      paper: '#ffffff',
    },
  },
  typography: {
    fontFamily: '"Poppins", sans-serif',
    h1: {
      fontWeight: 700,
    },
    h2: {
      fontWeight: 700,
    },
    h3: {
      fontWeight: 600,
    },
    h4: {
      fontWeight: 600,
    },
    h5: {
      fontWeight: 500,
    },
    h6: {
      fontWeight: 500,
    },
    button: {
      textTransform: 'none',
      fontWeight: 500,
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          padding: '8px 16px',
        },
        contained: {
          boxShadow: '0 4px 14px rgba(0, 0, 0, 0.1)',
          '&:hover': {
            boxShadow: '0 6px 20px rgba(0, 0, 0, 0.2)',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0 4px 14px rgba(0, 0, 0, 0.1)',
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          boxShadow: 'none',
        },
      },
    },
  },
});

// Protected Route Component
const ProtectedRoute = ({ children, allowedRoles }: { children: JSX.Element, allowedRoles?: string[] }) => {
  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);
  
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  if (allowedRoles && (!user?.role || !allowedRoles.includes(user.role))) {
    // Rediriger vers la page appropriée selon le rôle
    switch (user.role) {
      case 'admin':
        return <Navigate to="/admin/dashboard" />;
      case 'enterprise':
        return <Navigate to="/enterprise/dashboard" />;
      case 'employee':
        return <Navigate to="/employee/dashboard" />;
      case 'authority':
        return <Navigate to="/authority/dashboard" />;
      default:
        return <Navigate to="/login" />;
    }
  }

  return children;
};

function AppContent() {
  const user = useSelector((state: RootState) => state.auth.user);
  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);

  // Debug logs
  console.log('AppContent - isAuthenticated:', isAuthenticated);
  console.log('AppContent - user:', user);
  console.log('AppContent - user role:', user?.role);

  // Fonction pour vérifier si l'utilisateur est administrateur
  const isAdmin = () => {
    return user?.role === ROLES.ADMIN;
  };

  // Redirection en fonction du rôle
  const getDefaultRoute = () => {
    if (!isAuthenticated) return '/';
    if (isAdmin()) return '/admin/dashboard';
    if (user?.role === 'employee') return '/employee/dashboard';
    if (user?.role === 'enterprise') return '/enterprise/dashboard';
    if (user?.role === 'authority') return '/authority/dashboard';
    return '/dashboard';
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          <Routes>
            {/* Route publique - Homepage */}
            <Route path="/" element={!isAuthenticated ? <Home /> : <Navigate to={getDefaultRoute()} />} />
            
            {/* Routes publiques */}
            <Route path="/login" element={!isAuthenticated ? <Login /> : <Navigate to={getDefaultRoute()} />} />
            <Route path="/register" element={!isAuthenticated ? <Register /> : <Navigate to={getDefaultRoute()} />} />
            
            {/* Route certificat (accessible à tous les utilisateurs authentifiés) */}
            <Route path="/certificate/:requestId" element={
              <ProtectedRoute>
                <CertificatePage />
              </ProtectedRoute>
            } />

            {/* Routes administrateur */}
            <Route
              path="/admin/*"
              element={
                isAuthenticated && isAdmin() ? (
                  <AdminLayout>
                    <Routes>
                      <Route path="dashboard" element={<AdminDashboard />} />
                      <Route path="users" element={<UserManagement />} />
                      <Route path="certification-requests" element={<AdminCertificationRequests />} />
                      <Route path="reports" element={<Reports />} />
                      <Route path="payments" element={<PaymentManagement />} />
                      <Route path="profile" element={<AdminProfile />} />
                      <Route path="*" element={<Navigate to="/admin/dashboard" />} />
                    </Routes>
                  </AdminLayout>
                ) : (
                  <Navigate to="/" />
                )
              }
            />

            {/* Routes employé */}
            <Route
              path="/employee/*"
              element={
                isAuthenticated && user?.role === 'employee' ? (
                  <EmployeeLayout>
                    <Routes>
                      <Route path="dashboard" element={<EmployeeDashboard />} />
                      <Route path="certifications" element={<EmployeeCertifications />} />
                      <Route path="requests" element={<EmployeeRequests />} />
                      <Route path="requests/:id" element={<RequestDetails />} />
                      <Route path="assignments" element={<EmployeeRequests />} />
                      <Route path="validation" element={<EmployeeRequests />} />
                      <Route path="validation/:id" element={<ValidationPage />} />
                      <Route path="rejections" element={<div>Rapports de Refus</div>} />
                      <Route path="forms" element={<div>Formulaires Dynamiques</div>} />
                      <Route path="laws" element={<div>Checklist des Lois</div>} />
                      <Route path="archives" element={<div>Archives</div>} />
                      <Route path="history" element={<div>Historique Employé</div>} />
                      <Route path="profile" element={<EmployeeProfile />} />
                      <Route path="*" element={<Navigate to="/employee/dashboard" />} />
                    </Routes>
                  </EmployeeLayout>
                ) : (
                  <Navigate to="/" />
                )
              }
            />

            {/* Routes entreprise */}
            <Route
              path="/enterprise/*"
              element={
                isAuthenticated && user?.role === 'enterprise' ? (
                  <EnterpriseLayout>
                    <Routes>
                      <Route path="dashboard" element={<EnterpriseDashboard />} />
                      <Route path="requests" element={<CertificationRequests />} />
                      <Route path="requests/new" element={<CertificationForm />} />
                      <Route path="certification-form" element={<CertificationForm />} />
                      <Route path="payment/:requestId" element={<PaymentPage />} />
                      <Route path="payments" element={<PaymentsPage />} />
                      <Route path="certificates" element={<CertificatesPage />} />
                      <Route path="history" element={<HistoryPage />} />
                      <Route path="resubmit/:requestId" element={<CertificationForm />} />
                      <Route path="daily-info" element={<DailyInfo />} />
                      <Route path="profile" element={<EnterpriseProfile />} />
                      <Route path="*" element={<Navigate to="/enterprise/dashboard" />} />
                    </Routes>
                  </EnterpriseLayout>
                ) : (
                  <Navigate to="/" />
                )
              }
            />

            {/* Routes autorité */}
            <Route
              path="/authority/*"
              element={
                isAuthenticated && user?.role === 'authority' ? (
                  <AuthorityLayout />
                ) : (
                  <Navigate to="/" />
                )
              }
            >
              <Route path="dashboard" element={<AuthorityDashboard />} />
              <Route path="certificates" element={<CertificateConsultation />} />
              <Route path="audit-journal" element={<AuditJournal />} />
              <Route path="audit-report" element={<AuditReport />} />
              <Route path="export" element={<ExportHistorical />} />
              <Route path="documents" element={<AuthorityDocuments />} />
              <Route path="compliance-report" element={<div>Rapport de Conformité</div>} />
              <Route path="profile" element={<AuthorityProfile />} />
              <Route path="settings" element={<AuthoritySettings />} />
              <Route path="*" element={<Navigate to="/authority/dashboard" />} />
            </Route>

            {/* Routes utilisateur - Redirection vers les dashboards spécifiques */}
            <Route
              path="/dashboard"
              element={<Navigate to={getDefaultRoute()} />}
            />
            <Route
              path="/profile"
              element={
                isAuthenticated ? (
                  <UserLayout>
                    <EnterpriseProfile />
                  </UserLayout>
                ) : (
                  <Navigate to="/" />
                )
              }
            />
            <Route
              path="/certification-request"
              element={
                isAuthenticated ? (
                  <UserLayout>
                    <CertificationRequest />
                  </UserLayout>
                ) : (
                  <Navigate to="/" />
                )
              }
            />
            <Route
              path="/certifications"
              element={
                isAuthenticated ? (
                  <UserLayout>
                    <CertificationList />
                  </UserLayout>
                ) : (
                  <Navigate to="/" />
                )
              }
            />

            {/* Redirection par défaut */}
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </BrowserRouter>
      </ThemeProvider>
  );
}

function App() {
  return (
    <Provider store={store}>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Provider>
  );
}

export default App; 