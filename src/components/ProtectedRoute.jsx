import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ requiredRole, children }) {
  const role = localStorage.getItem("role");

  if (!role) return <Navigate to="/login" />;
  if (requiredRole && role !== requiredRole)
    return <Navigate to="/unauthorized" />;
  console.log("role in ProtectedRoute:", role);
  console.log("requiredRole:", requiredRole);
  return children;
}
