import { Navigate, Outlet, useLocation } from "react-router-dom";
import { clearAuth, isAuthenticated } from "../utils/auth";

const AuthGuard = () => {
  const location = useLocation();

  if (!isAuthenticated()) {
    clearAuth();
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return <Outlet />;
};

export default AuthGuard;
