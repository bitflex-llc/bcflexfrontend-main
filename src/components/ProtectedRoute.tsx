import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children, redirectPath = '/signin' }) => {
    if (!localStorage.getItem('access_token')) {
        return <Navigate to={redirectPath} replace />;
    }

    return children;
};