// UI Component
import { Toaster } from '@/components/ui/toaster';
import { Toaster as Sonner } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
// React Query
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
// import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useLocation,
  Outlet,
} from 'react-router-dom';

// Auth
import { AuthProvider } from './context/AuthContext';
// Protected Routes
import ProtectedRoute from './Routes/ProtectedRoute';
// Pages
import Login from './pages/Auth_Page/Login';
import Dashboard from './pages/Dashboard_Page/Dashboard';
import NotFound from './pages/Normal_Page/NotFound';
import InwardDashboard from './pages/Dashboard_Page/InwardDashboard';
import ProgramerDashboard from './pages/Dashboard_Page/ProgramerDashboard';
import AdminDashboard from './pages/Admin_Pages/AdminDashboard';
import Header from './layouts/Header';
import LoginRedirect from './Routes/LoginRedirect';
import QADashboard from './pages/Dashboard_Page/QADashBoard';
import AccountsDashboard from './pages/Dashboard_Page/AccountsDashBoard';

import Unauthorized from './pages/Normal_Page/Unauthorized';


interface ProtectedLayoutProps {
  roles?: string[];
}


const queryClient = new QueryClient();

const LayoutWithConditionalHeader = ({ children }) => {
  const location = useLocation();
  const hideHeader = location.pathname === '/login'; // Add more routes if needed

  return (
    <>
      {!hideHeader && <Header />}
      {children}
    </>
  );
};

const ProtectedLayout: React.FC<ProtectedLayoutProps> = ({ roles }) => {
  return (
    <ProtectedRoute roles={roles}>
      <Outlet />
    </ProtectedRoute>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          {/* <Header /> */}
          <LayoutWithConditionalHeader>
            <Routes>
              <Route path='/' element={<Navigate to='/login' replace />} />
              <Route path='/login' element={<LoginRedirect><Login /></LoginRedirect>} />

              {/* Authenticated group */}
              <Route element={<ProtectedLayout />}>
                <Route path="/dashboard" element={<Dashboard />} />

                <Route element={<ProtectedLayout roles={["inward"]} />}>
                  <Route path="/inward_dashboard" element={<InwardDashboard />} />
                </Route>

                <Route element={<ProtectedLayout roles={["qa"]} />}>
                  <Route path="/qa_dashboard" element={<QADashboard />} />
                </Route>

                <Route element={<ProtectedLayout roles={["accounts"]} />}>
                  <Route path="/accounts_dashboard" element={<AccountsDashboard />} />
                </Route>

                <Route element={<ProtectedLayout roles={["programer"]} />}>
                  <Route path="/programer_dashboard" element={<ProgramerDashboard />} />
                </Route>

                <Route element={<ProtectedLayout roles={["admin"]} />}>
                  <Route path="/admin_dashboard" element={<AdminDashboard />} />
                </Route>
              </Route>

              <Route path='/unauthorized' element={<Unauthorized />} />
              <Route path='*' element={<NotFound />} />
            </Routes>
          </LayoutWithConditionalHeader>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
