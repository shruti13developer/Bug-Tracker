
import { useEffect, useState } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { getCurrentUser, logoutUser } from "../services/authService";

function ProtectedRoute() {
  const [authenticated, setAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const verifyUser = async () => {
      const token = sessionStorage.getItem("bugtracker_token");

      if (!token) {
        setLoading(false);
        return;
      }

      try {
        await getCurrentUser();
        setAuthenticated(true);
      } catch (error) {
        logoutUser();
        setAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };

    verifyUser();
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#09090b] text-zinc-400">
        Checking authentication...
      </div>
    );
  }

  return authenticated ? <Outlet /> : <Navigate to="/login" replace />;
}

export default ProtectedRoute;
