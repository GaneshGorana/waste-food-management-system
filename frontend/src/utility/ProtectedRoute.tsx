import { Navigate, Outlet, useLocation } from "react-router-dom";

const ProtectedRoute = () => {
  const token = document.cookie.split("token=")[1];
  const location = useLocation();

  if (!token) {
    if (location.pathname.startsWith("/dashboard/admin")) {
      return <Navigate to="/admin/login" replace />;
    }
    if (location.pathname.startsWith("/dashboard/service-worker")) {
      return <Navigate to="/service-worker/login" replace />;
    }
    if (location.pathname.startsWith("/dashboard/user")) {
      return <Navigate to="/login" replace />;
    }
    return <Navigate to="/login" replace />;
  }
  return <Outlet />;
};

export default ProtectedRoute;
