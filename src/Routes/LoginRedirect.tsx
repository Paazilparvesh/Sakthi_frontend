import { useAuth } from "@/context/AuthContext";
import { Navigate } from "react-router-dom";

const LoginRedirect = ({ children }) => {
    const { isAuthenticated, user, isLoading } = useAuth();

    if (isLoading) return null;

    if (isAuthenticated && user) {
        if (user.isAdmin) return <Navigate to="/admin_dashboard" replace />;
        return <Navigate to="/dashboard" replace />;
    }

    return children;
};

export default LoginRedirect;
