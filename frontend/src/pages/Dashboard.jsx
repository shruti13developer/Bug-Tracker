
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import {
  Bug,
  LayoutDashboard,
  LogOut,
  User,
  ShieldCheck,
  FolderKanban,
  Plus,
  ArrowRight,
  CircleDot,
  Clock,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
} from "lucide-react";

import {
  getCurrentUser,
  logoutUser,
} from "../services/authService";

import { getTickets } from "../services/ticketService";
import { getProjects } from "../services/projectService";

function Dashboard() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const [stats, setStats] = useState({
    total: 0,
    open: 0,
    inProgress: 0,
    completed: 0,
  });

  const [recentTickets, setRecentTickets] = useState([]);
  const [projectCount, setProjectCount] = useState(0);
  const [dataLoading, setDataLoading] = useState(true);
  const [dataError, setDataError] = useState("");

  const navigate = useNavigate();

  // LOAD USER
  useEffect(() => {
    const loadUser = async () => {
      try {
        const result = await getCurrentUser();
        setUser(result.user);
      } catch (error) {
        logoutUser();
        navigate("/login", { replace: true });
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, [navigate]);

  // LOAD DASHBOARD DATA
  useEffect(() => {
    if (!user) return;

    const loadDashboardData = async () => {
      setDataLoading(true);
      setDataError("");

      try {
        const [ticketResult, projectResult] = await Promise.all([
          getTickets(),
          getProjects(),
        ]);

        const tickets = ticketResult.tickets || [];
        const projects = projectResult.projects || [];

        const completed = tickets.filter(
          (ticket) => ticket.status === "done"
        ).length;

        const inProgress = tickets.filter(
          (ticket) => ticket.status === "in-progress"
        ).length;

        const open = tickets.filter(
          (ticket) => ticket.status !== "done"
        ).length;

        setStats({
          total: tickets.length,
          open,
          inProgress,
          completed,
        });

        setProjectCount(projects.length);

        const sortedTickets = [...tickets]
          .sort(
            (a, b) =>
              new Date(b.updatedAt || b.createdAt) -
              new Date(a.updatedAt || a.createdAt)
          )
          .slice(0, 5);

        setRecentTickets(sortedTickets);
      } catch (error) {
        setDataError(error.message || "Unable to load dashboard data.");
      } finally {
        setDataLoading(false);
      }
    };

    loadDashboardData();
  }, [user]);

  // LOGOUT
  const handleLogout = () => {
    logoutUser();
    navigate("/login", { replace: true });
  };

  // DATE FORMAT
  const formatDate = (date) => {
    if (!date) return "Recently";

    return new Date(date).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  // STATUS COLOR
  const getStatusStyle = (status) => {
    switch (status) {
      case "todo":
        return "bg-zinc-800 text-zinc-300";

      case "in-progress":
        return "bg-blue-500/10 text-blue-400";

      case "done":
        return "bg-emerald-500/10 text-emerald-400";

      default:
        return "bg-zinc-800 text-zinc-300";
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#09090b] text-zinc-400">
        Verifying your session...
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-[#09090b] text-white">

      {/* NAVBAR */}
      <header className="flex h-16 items-center justify-between border-b border-zinc-800 px-6 lg:px-10">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-indigo-600 p-2">
            <Bug size={20} />
          </div>

          <span className="text-lg font-bold">BugTracker</span>
        </div>

        <button
          onClick={handleLogout}
          className="flex items-center gap-2 rounded-lg border border-zinc-800 px-4 py-2 text-sm text-zinc-300 transition hover:bg-zinc-800 hover:text-white"
        >
          <LogOut size={17} />
          Logout
        </button>
      </header>

      {/* MAIN CONTENT */}
      <main className="mx-auto max-w-7xl px-6 py-10">

        {/* WELCOME */}
        <div className="mb-8 flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
          <div>
            <p className="text-sm font-medium text-indigo-400">
              YOUR WORKSPACE
            </p>

            <h1 className="mt-2 text-3xl font-bold">
              Welcome, {user.name}!
            </h1>

          </div>

          <Link
            to="/tickets"
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-indigo-600 px-5 py-3 text-sm font-medium transition hover:bg-indigo-500"
          >
            <Plus size={18} />
            Create Issue
          </Link>
        </div>

        {/* QUICK NAVIGATION */}
        <div className="mb-8 grid gap-3 sm:grid-cols-3">

          <Link
            to="/projects"
            className="flex items-center justify-between rounded-xl border border-zinc-800 bg-zinc-900 p-4 transition hover:border-indigo-500/50 hover:bg-zinc-800"
          >
            <div className="flex items-center gap-3">
              <FolderKanban className="text-indigo-400" size={21} />
              <span className="text-sm font-medium">Manage Projects</span>
            </div>
            <ArrowRight size={17} className="text-zinc-500" />
          </Link>

          <Link
            to="/tickets"
            className="flex items-center justify-between rounded-xl border border-zinc-800 bg-zinc-900 p-4 transition hover:border-indigo-500/50 hover:bg-zinc-800"
          >
            <div className="flex items-center gap-3">
              <Bug className="text-indigo-400" size={21} />
              <span className="text-sm font-medium">Manage Issues</span>
            </div>
            <ArrowRight size={17} className="text-zinc-500" />
          </Link>

          <Link
            to="/board"
            className="flex items-center justify-between rounded-xl border border-zinc-800 bg-zinc-900 p-4 transition hover:border-indigo-500/50 hover:bg-zinc-800"
          >
            <div className="flex items-center gap-3">
              <LayoutDashboard className="text-indigo-400" size={21} />
              <span className="text-sm font-medium">Kanban Board</span>
            </div>
            <ArrowRight size={17} className="text-zinc-500" />
          </Link>

        </div>

        {/* STATISTICS */}
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Issue Overview</h2>

          {dataLoading && (
            <RefreshCw size={16} className="animate-spin text-zinc-500" />
          )}
        </div>

        {dataError && (
          <div className="mb-5 rounded-lg border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-400">
            {dataError}
          </div>
        )}

        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

          {/* TOTAL ISSUES */}
          <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-5">
            <div className="mb-4 flex items-center justify-between">
              <span className="text-sm text-zinc-400">Total Issues</span>
              <Bug size={21} className="text-indigo-400" />
            </div>

            <p className="text-3xl font-bold tabular-nums">
              {dataLoading ? "—" : stats.total}
            </p>

            <p className="mt-2 text-xs text-zinc-500">
              All reported issues
            </p>
          </div>

          {/* OPEN ISSUES */}
          <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-5">
            <div className="mb-4 flex items-center justify-between">
              <span className="text-sm text-zinc-400">Open Issues</span>
              <AlertCircle size={21} className="text-orange-400" />
            </div>

            <p className="text-3xl font-bold tabular-nums">
              {dataLoading ? "—" : stats.open}
            </p>

            <p className="mt-2 text-xs text-zinc-500">
              Not yet completed
            </p>
          </div>

          {/* IN PROGRESS */}
          <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-5">
            <div className="mb-4 flex items-center justify-between">
              <span className="text-sm text-zinc-400">In Progress</span>
              <Clock size={21} className="text-blue-400" />
            </div>

            <p className="text-3xl font-bold tabular-nums">
              {dataLoading ? "—" : stats.inProgress}
            </p>

            <p className="mt-2 text-xs text-zinc-500">
              Currently being worked on
            </p>
          </div>

          {/* COMPLETED */}
          <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-5">
            <div className="mb-4 flex items-center justify-between">
              <span className="text-sm text-zinc-400">Completed</span>
              <CheckCircle2 size={21} className="text-emerald-400" />
            </div>

            <p className="text-3xl font-bold tabular-nums">
              {dataLoading ? "—" : stats.completed}
            </p>

            <p className="mt-2 text-xs text-zinc-500">
              Successfully resolved
            </p>
          </div>

        </div>

        {/* RECENT ISSUES + WORKSPACE DETAILS */}
        <div className="grid gap-6 lg:grid-cols-3">

          {/* RECENT ISSUES */}
          <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-5 lg:col-span-2">

            <div className="mb-5 flex items-center justify-between">
              <div>
                <h2 className="font-semibold">Recent Issues</h2>
                <p className="mt-1 text-xs text-zinc-500">
                  Your latest updated tickets
                </p>
              </div>

              <Link
                to="/tickets"
                className="flex items-center gap-1 text-xs font-medium text-indigo-400 hover:text-indigo-300"
              >
                View all
                <ArrowRight size={14} />
              </Link>
            </div>

            {dataLoading ? (
              <p className="py-8 text-center text-sm text-zinc-500">
                Loading recent issues...
              </p>
            ) : recentTickets.length === 0 ? (
              <div className="py-10 text-center">
                <Bug size={30} className="mx-auto mb-3 text-zinc-600" />

                <p className="text-sm text-zinc-400">
                  No issues created yet.
                </p>

                <Link
                  to="/tickets"
                  className="mt-3 inline-block text-sm text-indigo-400 hover:text-indigo-300"
                >
                  Create your first issue
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {recentTickets.map((ticket) => (
                  <div
                    key={ticket._id}
                    className="flex flex-col justify-between gap-3 rounded-lg border border-zinc-800 bg-[#111113] p-4 sm:flex-row sm:items-center"
                  >
                    <div className="min-w-0">
                      <div className="mb-1 flex flex-wrap items-center gap-2">
                        <span className="text-xs font-medium text-indigo-400">
                          {ticket.ticketId}
                        </span>

                        <span
                          className={`rounded-full px-2 py-1 text-[10px] font-medium ${getStatusStyle(ticket.status)}`}
                        >
                          {ticket.status?.replace("-", " ")}
                        </span>
                      </div>

                      <h3 className="truncate text-sm font-medium text-zinc-200">
                        {ticket.title}
                      </h3>

                      <p className="mt-1 text-xs text-zinc-500">
                        {ticket.project?.name || "No project"}
                      </p>
                    </div>

                    <div className="shrink-0 text-xs text-zinc-500">
                      {formatDate(ticket.updatedAt || ticket.createdAt)}
                    </div>
                  </div>
                ))}
              </div>
            )}

          </div>

          {/* WORKSPACE DETAILS */}
          <div className="space-y-5">

            <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-5">
              <h2 className="mb-5 font-semibold">Your Workspace</h2>

              <div className="flex items-center gap-3 border-b border-zinc-800 pb-4">
                <div className="rounded-lg bg-indigo-500/10 p-3">
                  <User size={21} className="text-indigo-400" />
                </div>

                <div>
                  <p className="text-xs text-zinc-500">Account Name</p>
                  <p className="mt-1 text-sm font-medium">{user.name}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 border-b border-zinc-800 py-4">
                <div className="rounded-lg bg-emerald-500/10 p-3">
                  <ShieldCheck size={21} className="text-emerald-400" />
                </div>

                <div>
                  <p className="text-xs text-zinc-500">Account Role</p>
                  <p className="mt-1 text-sm font-medium capitalize">
                    {user.role}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 pt-4">
                <div className="rounded-lg bg-purple-500/10 p-3">
                  <FolderKanban size={21} className="text-purple-400" />
                </div>

                <div>
                  <p className="text-xs text-zinc-500">Total Projects</p>
                  <p className="mt-1 text-sm font-medium">
                    {dataLoading ? "—" : projectCount}
                  </p>
                </div>
              </div>
            </div>

            {/* WORKSPACE STATUS */}
            <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-5">
              <div className="flex items-center gap-2">
                <CircleDot size={18} className="text-emerald-400" />
                <h2 className="font-semibold">System Status</h2>
              </div>

              <p className="mt-3 text-sm text-emerald-400">
                Workspace Connected
              </p>

              <p className="mt-1 text-xs leading-5 text-zinc-500">
                Your account is authenticated and connected to the BugTracker workspace.
              </p>
            </div>

          </div>

        </div>

        <p className="mt-10 text-center text-xs text-zinc-600">
          BugTracker · Issue Management Workspace
        </p>

      </main>
    </div>
  );
}

export default Dashboard;
