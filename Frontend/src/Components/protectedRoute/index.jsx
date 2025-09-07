import { Navigate, Outlet } from "react-router-dom";
import Cookies from "js-cookie";

const ProtectedRoute = ({ allowedRole }) => {
    const token = Cookies.get("jwt_token");
    const role = Cookies.get("role");

    if (!token || !role) {
        return <Navigate to="/login" replace />;
    }

    
    if (allowedRole && role !== allowedRole) {
        return <Navigate to="/not-found" replace />;
    }


    return <Outlet />;
};

export default ProtectedRoute;
