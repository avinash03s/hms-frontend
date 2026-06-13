import { jwtDecode } from "jwt-decode";
import type { JSX } from "react";
import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";

interface PublicRouteProps {
  children: JSX.Element;
}

const PublicRoute: React.FC<PublicRouteProps> = ({ children }) => {
  const token = useSelector((state: any) => state.jwt);

  if (token) {
    try {
      const user: any = jwtDecode(token);

      if (user?.role === "PATIENT") {
        return <Navigate to="/find-doctor" />;
      }

      return <Navigate to={`/${user?.role?.toLowerCase()}/dashboard`} />;
    } catch {
      return children;
    }
  }

  return children;
};

export default PublicRoute;