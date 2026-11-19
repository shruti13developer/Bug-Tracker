
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  Plus,
  Search,
  Bug,
  X,
  Loader2,
  RefreshCw,
  Pencil,
  Trash2,
} from "lucide-react";

import {
  getTickets,
  createTicket,
  updateTicket,
  deleteTicket,
} from "../services/ticketService";

import { getProjects } from "../services/projectService";

function Tickets() {
  const [tickets, setTickets] = useState([]);
  const [projects, setProjects] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");

  const [showModal, setShowModal] = useState(false);

  const [form, setForm] = useState({
    title: "",
    description: "",
    project: "",
    priority: "medium",
    severity: "minor",
    status: "todo",
    environment: "",
  });
  const [editingTicket, setEditingTicket] = useState(null);

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");

      const [ticketData, projectData] = await Promise.all([
        getTickets(),
        getProjects(),
      ]);

      setTickets(ticketData.tickets || []);
      setProjects(projectData.projects || []);
    } catch (err) {
      setError(err.message || "Failed to load tickets");
    } finally {
      setLoading(false);
    }
  };
  const handleEdit = (ticket) => {
  setEditingTicket(ticket);
  setForm({
    title: ticket.title,
    description: ticket.description,
    project: ticket.project?._id || "",
    priority: ticket.priority,
    severity: ticket.severity,
    status: ticket.status,
    environment: ticket.environment || "",
  });
  setShowModal(true);
};

const handleDelete = async (id) => {
  const confirmed = window.confirm(
    "Are you sure you want to delete this ticket?"
  );

  if (!confirmed) return;

  try {
    await deleteTicket(id);
    await loadData();
  } catch (error) {
    alert(error.message);
  }
};

  useEffect(() => {
    loadData();
  }, []);

  const filteredTickets = useMemo(() => {
    return tickets.filter((ticket) => {
      const searchText = search.toLowerCase();

      const matchesSearch =
        ticket.ticketId?.toLowerCase().includes(searchText) ||
        ticket.title?.toLowerCase().includes(searchText) ||
        ticket.description?.toLowerCase().includes(searchText);

      const matchesStatus =
        statusFilter === "all" || ticket.status === statusFilter;

      const matchesPriority =
        priorityFilter === "all" ||
        ticket.priority === priorityFilter;

      return matchesSearch && matchesStatus && matchesPriority;
    });
  }, [tickets, search, statusFilter, priorityFilter]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  
const handleCreateTicket = async (e) => {
  e.preventDefault();

  try {
    setSaving(true);
    setError("");

    if (editingTicket) {
      await updateTicket(editingTicket._id, form);
    } else {
      await createTicket(form);
    }

    setForm({
      title: "",
      description: "",
      project: "",
      priority: "medium",
      severity: "minor",
      status: "todo",
      environment: "",
    });

    setEditingTicket(null);
    setShowModal(false);
    await loadData();
    } catch (err) {
    setError(err.message || "Failed to save ticket");
    } finally {
    setSaving(false);
    }
    };


  const priorityStyle = {
    critical: "text-red-400 bg-red-400/10",
    high: "text-orange-400 bg-orange-400/10",
    medium: "text-yellow-400 bg-yellow-400/10",
    low: "text-green-400 bg-green-400/10",
  };

  const statusStyle = {
    todo: "text-zinc-400 bg-zinc-400/10",
    "in-progress": "text-blue-400 bg-blue-400/10",
    done: "text-green-400 bg-green-400/10",
  };

  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-100 p-6 md:p-10">

      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <p className="text-sm text-zinc-500 mb-2">
            Workspace / Issues
          </p>

          <h1 className="text-3xl font-semibold tracking-tight">
            Issues
          </h1>

          <p className="text-zinc-500 text-sm mt-2">
            Manage and track your project bugs.
          </p>
        </div>

        <button
        onClick={() => {
            setEditingTicket(null);
            setForm({
                title: "",
                description: "",
                project: "",
                priority: "medium",
                severity: "minor",
                status: "todo",
                environment: "",
            });
            setShowModal(true);
            }}        
            >
          <Plus size={17} />
          Create issue
        </button>
      </div>

      {/* ERROR */}
      {error && (
        <div className="mb-5 p-3 rounded-lg border border-red-500/30 bg-red-500/10 text-red-400 text-sm">
          {error}
        </div>
      )}

      {/* EMPTY PROJECT WARNING */}
      {!loading && projects.length === 0 && (
        <div className="mb-5 p-4 rounded-lg border border-yellow-500/20 bg-yellow-500/5 text-yellow-300 text-sm">
          Create a project before adding issues.
        </div>
      )}

      {/* FILTERS */}
      <div className="flex flex-col lg:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search
            size={17}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500"
          />

          <label htmlFor="ticketSearch" className="sr-only">
            Search issues
          </label>

          <input
            id="ticketSearch"
            name="ticketSearch"
            autoComplete="off"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search issues..."
            className="w-full bg-[#111113] border border-zinc-800 rounded-lg pl-10 pr-4 py-3 text-sm outline-none focus:border-zinc-600"
          />
        </div>

        <label className="sr-only" htmlFor="statusFilter">
          Filter by status
        </label>

        <select
          id="statusFilter"
          name="statusFilter"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="bg-[#111113] border border-zinc-800 rounded-lg px-4 py-3 text-sm outline-none"
        >
          <option value="all">All statuses</option>
          <option value="todo">To Do</option>
          <option value="in-progress">In Progress</option>
          <option value="done">Done</option>
        </select>

        <label className="sr-only" htmlFor="priorityFilter">
          Filter by priority
        </label>

        <select
          id="priorityFilter"
          name="priorityFilter"
          value={priorityFilter}
          onChange={(e) => setPriorityFilter(e.target.value)}
          className="bg-[#111113] border border-zinc-800 rounded-lg px-4 py-3 text-sm outline-none"
        >
          <option value="all">All priorities</option>
          <option value="critical">Critical</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>

        <button
          onClick={loadData}
          className="flex items-center justify-center gap-2 px-4 py-3 border border-zinc-800 rounded-lg text-sm text-zinc-400 hover:text-white"
        >
          <RefreshCw size={15} />
          Refresh
        </button>
      </div>

      {/* TICKET LIST */}
      <div className="border border-zinc-800 rounded-xl overflow-hidden bg-[#111113]">

        <div className="grid grid-cols-12 gap-3 px-5 py-4 border-b border-zinc-800 text-xs uppercase tracking-wider text-zinc-500">
          <div className="col-span-6 md:col-span-5">Issue</div>
          <div className="hidden md:block md:col-span-2">Status</div>
          <div className="col-span-3 md:col-span-2">Priority</div>
          <div className="col-span-3 md:col-span-3">Project</div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-16 text-zinc-500">
            <Loader2 className="animate-spin mr-2" size={20} />
            Loading issues...
          </div>
        ) : filteredTickets.length === 0 ? (
          <div className="text-center py-16">
            <Bug size={32} className="mx-auto text-zinc-600 mb-3" />

            <p className="text-zinc-300 font-medium">
              No issues found
            </p>

            <p className="text-sm text-zinc-500 mt-2">
              Create an issue or change your search filters.
            </p>
          </div>
        ) : (
          filteredTickets.map((ticket) => (
            <div
              key={ticket._id}
              className="grid grid-cols-12 gap-3 items-center px-5 py-4 border-b border-zinc-800/70 hover:bg-white/[0.02]"
            >
              <div className="col-span-6 md:col-span-5 min-w-0">
                <div className="flex items-center gap-1">
                  
                  <Link
                  to={`/tickets/${ticket._id}`}
                  title="View issue details"
                  className="rounded-md px-3 py-2 text-xs font-medium text-indigo-400 hover:bg-indigo-500/10"
                  >
                    View
                    </Link>
                    
                    <button
                    type="button"
                    onClick={() => handleEdit(ticket)}
                    title="Edit issue"
                    className="p-2 rounded-md text-zinc-400 hover:text-white hover:bg-zinc-800"
                    >
                      <Pencil size={15} />
                      </button>
                      <button
                      type="button"
                      onClick={() => handleDelete(ticket._id)}
                      title="Delete issue"
                      className="p-2 rounded-md text-zinc-400 hover:text-red-400 hover:bg-red-400/10"
                      >
                        <Trash2 size={15} />
                      </button>
                        
                    </div>

                <p className="text-xs text-zinc-500 mt-1 ml-6">
                  {ticket.ticketId}
                </p>
              </div>

              <div className="hidden md:block md:col-span-2">
                <span className={`px-2.5 py-1 rounded-md text-xs ${statusStyle[ticket.status] || statusStyle.todo}`}>
                  {ticket.status === "in-progress"
                    ? "In Progress"
                    : ticket.status === "todo"
                    ? "To Do"
                    : "Done"}
                </span>
              </div>

              <div className="col-span-3 md:col-span-2">
                <span className={`px-2.5 py-1 rounded-md text-xs capitalize ${priorityStyle[ticket.priority] || priorityStyle.medium}`}>
                  {ticket.priority}
                </span>
              </div>

              <div className="col-span-3 md:col-span-3 flex flex-col md:flex-row md:items-center gap-2">
                <span className="text-xs text-zinc-400 truncate">
                    {ticket.project?.name || "Unknown project"}
                    </span>
                    
                    <div className="flex items-center gap-2">
                        <button
                        type="button"
                        onClick={() => handleEdit(ticket)}
                        title="Edit issue"
                        className="p-2 rounded-md text-zinc-400 hover:text-white hover:bg-zinc-800"
                        >
                            <Pencil size={15} />
                            </button>
                            
                            <button
                            type="button"
                            onClick={() => handleDelete(ticket._id)}
                            title="Delete issue"
                            className="p-2 rounded-md text-zinc-400 hover:text-red-400 hover:bg-red-400/10"
                            >
                                <Trash2 size={15} />
                            </button>
                        </div>
                    </div>
                </div>
            ))
        )}
    </div>

      <p className="text-xs text-zinc-600 mt-4">
        Showing {filteredTickets.length} of {tickets.length} issues
      </p>

      {/* CREATE TICKET MODAL */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-4 overflow-y-auto">
          <div className="w-full max-w-xl bg-[#151518] border border-zinc-800 rounded-2xl p-6 my-auto">

            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-semibold">
                    {editingTicket ? "Edit issue" : "Create issue"}
                </h2>
                <p className="text-sm text-zinc-500 mt-1">
                  Add a new bug or issue to your project.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowModal(false)}
                aria-label="Close create issue dialog"
                className="text-zinc-500 hover:text-white"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateTicket} className="space-y-4">

              <div>
                <label htmlFor="title" className="block text-sm text-zinc-300 mb-2">
                  Issue title *
                </label>
                <input
                  id="title"
                  name="title"
                  value={form.title}
                  onChange={handleChange}
                  required
                  maxLength={150}
                  placeholder="Example: Login button not working"
                  className="w-full bg-[#09090b] border border-zinc-800 rounded-lg px-3 py-3 text-sm outline-none focus:border-zinc-600"
                />
              </div>

              <div>
                <label htmlFor="description" className="block text-sm text-zinc-300 mb-2">
                  Description *
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  required
                  rows={4}
                  placeholder="Describe the issue..."
                  className="w-full bg-[#09090b] border border-zinc-800 rounded-lg px-3 py-3 text-sm outline-none focus:border-zinc-600 resize-none"
                />
              </div>

              <div>
                <label htmlFor="project" className="block text-sm text-zinc-300 mb-2">
                  Project *
                </label>
                <select
                  id="project"
                  name="project"
                  value={form.project}
                  onChange={handleChange}
                  required
                  className="w-full bg-[#09090b] border border-zinc-800 rounded-lg px-3 py-3 text-sm outline-none"
                >
                  <option value="">Select a project</option>
                  {projects.map((project) => (
                    <option key={project._id} value={project._id}>
                      {project.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="priority" className="block text-sm text-zinc-300 mb-2">
                    Priority
                  </label>
                  <select
                    id="priority"
                    name="priority"
                    value={form.priority}
                    onChange={handleChange}
                    className="w-full bg-[#09090b] border border-zinc-800 rounded-lg px-3 py-3 text-sm outline-none"
                  >
                    <option value="critical">Critical</option>
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="severity" className="block text-sm text-zinc-300 mb-2">
                    Severity
                  </label>
                  <select
                    id="severity"
                    name="severity"
                    value={form.severity}
                    onChange={handleChange}
                    className="w-full bg-[#09090b] border border-zinc-800 rounded-lg px-3 py-3 text-sm outline-none"
                  >
                    <option value="blocker">Blocker</option>
                    <option value="critical">Critical</option>
                    <option value="major">Major</option>
                    <option value="minor">Minor</option>
                    <option value="trivial">Trivial</option>
                  </select>
                </div>
              </div>

              <div>
                <label htmlFor="status" className="block text-sm text-zinc-300 mb-2">
                  Status
                </label>
                <select
                  id="status"
                  name="status"
                  value={form.status}
                  onChange={handleChange}
                  className="w-full bg-[#09090b] border border-zinc-800 rounded-lg px-3 py-3 text-sm outline-none"
                >
                  <option value="todo">To Do</option>
                  <option value="in-progress">In Progress</option>
                  <option value="done">Done</option>
                </select>
              </div>

              <div>
                <label htmlFor="environment" className="block text-sm text-zinc-300 mb-2">
                  Environment
                </label>
                <input
                  id="environment"
                  name="environment"
                  value={form.environment}
                  onChange={handleChange}
                  placeholder="Example: Windows 11, Chrome"
                  className="w-full bg-[#09090b] border border-zinc-800 rounded-lg px-3 py-3 text-sm outline-none focus:border-zinc-600"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2.5 rounded-lg border border-zinc-700 text-sm text-zinc-300 hover:bg-zinc-800"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving || projects.length === 0}
                  className="px-5 py-2.5 rounded-lg bg-white text-black text-sm font-medium hover:bg-zinc-200 disabled:opacity-50 flex items-center gap-2"
                >
                  {saving && <Loader2 size={16} className="animate-spin" />}
                  {saving
                  ? editingTicket
                  ? "Saving..."
                  : "Creating..."
                  : editingTicket
                  ? "Save changes"
                  : "Create issue"}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}

export default Tickets;
