
import { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";

import {
  ArrowLeft,
  Bug,
  Calendar,
  User,
  FolderKanban,
  AlertCircle,
  Loader2,
  RefreshCw,
} from "lucide-react";

import { getTicketById } from "../services/ticketService";
import PulseDiscussions from "../components/PulseDiscussions";

function TicketDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadTicket = async () => {
    setLoading(true);
    setError("");

    try {
      const result = await getTicketById(id);
      setTicket(result.ticket);
    } catch (error) {
      setError(error.message || "Unable to load ticket.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTicket();
  }, [id]);

  const formatDate = (date) => {
    if (!date) return "Not available";

    return new Date(date).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const getPriorityStyle = (priority) => {
    switch (priority) {
      case "critical":
        return "bg-red-500/10 text-red-400";

      case "high":
        return "bg-orange-500/10 text-orange-400";

      case "medium":
        return "bg-yellow-500/10 text-yellow-400";

      case "low":
        return "bg-emerald-500/10 text-emerald-400";

      default:
        return "bg-zinc-800 text-zinc-300";
    }
  };

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
        <Loader2 className="mr-2 animate-spin" size={20} />
        Loading ticket...
      </div>
    );
  }

  if (error || !ticket) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-[#09090b] px-6 text-center text-white">
        <AlertCircle size={35} className="mb-4 text-red-400" />

        <h2 className="text-xl font-semibold">
          Unable to open ticket
        </h2>

        <p className="mt-2 text-sm text-zinc-500">
          {error || "Ticket not found"}
        </p>

        <div className="mt-5 flex gap-3">
          <button
            onClick={loadTicket}
            className="flex items-center gap-2 rounded-lg border border-zinc-700 px-4 py-2 text-sm hover:bg-zinc-800"
          >
            <RefreshCw size={15} />
            Retry
          </button>

          <button
            onClick={() => navigate("/tickets")}
            className="rounded-lg bg-indigo-600 px-4 py-2 text-sm hover:bg-indigo-500"
          >
            Back to tickets
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#09090b] text-white">

      {/* NAVBAR */}
      <header className="flex h-16 items-center justify-between border-b border-zinc-800 px-6 lg:px-10">
        <Link
          to="/dashboard"
          className="flex items-center gap-3"
        >
          <div className="rounded-lg bg-indigo-600 p-2">
            <Bug size={20} />
          </div>

          <span className="text-lg font-bold">BugTracker</span>
        </Link>

        <Link
          to="/tickets"
          className="text-sm text-zinc-400 transition hover:text-white"
        >
          All Issues
        </Link>
      </header>

      <main className="mx-auto max-w-5xl px-6 py-8">

        {/* BACK BUTTON */}
        <button
          onClick={() => navigate("/tickets")}
          className="mb-7 flex items-center gap-2 text-sm text-zinc-400 transition hover:text-white"
        >
          <ArrowLeft size={17} />
          Back to Issues
        </button>

        {/* TICKET HEADER */}
        <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-6">

          <div className="mb-5 flex flex-wrap items-center gap-2">
            <span className="rounded-md bg-indigo-500/10 px-3 py-1 text-xs font-semibold text-indigo-400">
              {ticket.ticketId}
            </span>

            <span className={`rounded-full px-3 py-1 text-xs font-medium capitalize ${getStatusStyle(ticket.status)}`}>
              {ticket.status?.replace("-", " ")}
            </span>

            <span className={`rounded-full px-3 py-1 text-xs font-medium capitalize ${getPriorityStyle(ticket.priority)}`}>
              {ticket.priority} priority
            </span>
          </div>

          <h1 className="text-2xl font-bold leading-tight sm:text-3xl">
            {ticket.title}
          </h1>

          <div className="mt-6 border-t border-zinc-800 pt-5">

            <h2 className="mb-3 text-sm font-semibold text-zinc-300">
              Description
            </h2>

            <p className="whitespace-pre-wrap text-sm leading-7 text-zinc-400">
              {ticket.description}
            </p>

          </div>

          {/* TICKET INFORMATION */}
          <div className="mt-7 grid gap-5 border-t border-zinc-800 pt-6 sm:grid-cols-2 lg:grid-cols-3">

            <div>
              <div className="mb-2 flex items-center gap-2 text-xs text-zinc-500">
                <FolderKanban size={15} />
                Project
              </div>

              <p className="text-sm font-medium">
                {ticket.project?.name || "Not assigned"}
              </p>
            </div>

            <div>
              <div className="mb-2 flex items-center gap-2 text-xs text-zinc-500">
                <User size={15} />
                Reporter
              </div>

              <p className="text-sm font-medium">
                {ticket.reporter?.name || "Unknown"}
              </p>
            </div>

            <div>
              <div className="mb-2 flex items-center gap-2 text-xs text-zinc-500">
                <User size={15} />
                Assignee
              </div>

              <p className="text-sm font-medium">
                {ticket.assignee?.name || "Unassigned"}
              </p>
            </div>

            <div>
              <div className="mb-2 flex items-center gap-2 text-xs text-zinc-500">
                <AlertCircle size={15} />
                Severity
              </div>

              <p className="text-sm font-medium capitalize">
                {ticket.severity || "Not specified"}
              </p>
            </div>

            <div>
              <div className="mb-2 flex items-center gap-2 text-xs text-zinc-500">
                <Calendar size={15} />
                Created
              </div>

              <p className="text-sm font-medium">
                {formatDate(ticket.createdAt)}
              </p>
            </div>

            <div>
              <div className="mb-2 flex items-center gap-2 text-xs text-zinc-500">
                <Calendar size={15} />
                Last Updated
              </div>

              <p className="text-sm font-medium">
                {formatDate(ticket.updatedAt)}
              </p>
            </div>

          </div>

          {ticket.environment && (
            <div className="mt-6 border-t border-zinc-800 pt-5">
              <h3 className="mb-2 text-sm font-semibold text-zinc-300">
                Environment
              </h3>

              <p className="text-sm text-zinc-400">
                {ticket.environment}
              </p>
            </div>
          )}

        </div>

        {/* PULSE DISCUSSIONS */}
        <PulseDiscussions ticketId={ticket._id} />

      </main>
    </div>
  );
}

export default TicketDetails;
