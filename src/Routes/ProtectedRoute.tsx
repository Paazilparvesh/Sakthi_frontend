import { useAuth } from '@/context/AuthContext';
import { UserRole } from '@/types/user.type';
import { Navigate } from 'react-router-dom';

interface ProtectedRouteProps {
  children: JSX.Element;
  roles?: string[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, roles }) => {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className='flex h-screen items-center justify-center text-muted-foreground'>
        Checking session...
      </div>
    );
  }

  // Not logged in → redirect to login
  if (!isAuthenticated || !user) {
    return <Navigate to='/login' replace />;
  }

  // Admin bypass (admin can open all)
  if (user.isAdmin) {
    return children;
  }
  // Check role access
  if (roles && !roles.some(role => user.roles.includes(role as UserRole))) {
    return <Navigate to='/unauthorized' replace />;
  }

  // User allowed → show the requested page
  return children;
};

export default ProtectedRoute;
