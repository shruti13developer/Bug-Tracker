
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import Projects from "./pages/Projects";
import Tickets from "./pages/Tickets";
import Board from "./pages/Board";
import TicketDetails from "./pages/TicketDetails";

import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* LOGIN */}
        <Route
          path="/login"
          element={<Auth initialMode="login" />}
        />

        {/* REGISTER */}
        <Route
          path="/register"
          element={<Auth initialMode="register" />}
        />

        {/* PROTECTED PAGES */}
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/projects" element={<Projects />} />
          <Route path="/tickets" element={<Tickets />} />
          <Route path="/board" element={<Board />} />

          {/* TICKET DETAILS */}
          <Route
            path="/tickets/:id"
            element={<TicketDetails />}
          />
        </Route>

        {/* DEFAULT PAGE */}
        <Route
          path="/"
          element={<Navigate to="/dashboard" replace />}
        />

        {/* UNKNOWN URL */}
        <Route
          path="*"
          element={<Navigate to="/login" replace />}
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
