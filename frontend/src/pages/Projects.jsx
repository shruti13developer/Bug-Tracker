
import { useEffect, useMemo, useState } from "react";
import {
  Plus,
  Search,
  FolderKanban,
  Pencil,
  Trash2,
  X,
  CalendarDays,
  Loader2,
} from "lucide-react";

import {
  getProjects,
  createProject,
  updateProject,
  deleteProject,
} from "../services/projectService";

const emptyForm = {
  name: "",
  description: "",
  status: "active",
  startDate: "",
  dueDate: "",
};

function Projects() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [form, setForm] = useState(emptyForm);

  // LOAD PROJECTS
  const loadProjects = async () => {
    try {
      setError("");
      const data = await getProjects();
      setProjects(data.projects || []);
    } catch (err) {
      setError(err.message || "Unable to load projects.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProjects();
  }, []);

  // SEARCH AND FILTER
  const filteredProjects = useMemo(() => {
    return projects.filter((project) => {
      const matchesSearch =
        project.name.toLowerCase().includes(search.toLowerCase()) ||
        (project.description || "")
          .toLowerCase()
          .includes(search.toLowerCase());

      const matchesStatus =
        statusFilter === "all" ||
        project.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [projects, search, statusFilter]);

  // OPEN CREATE MODAL
  const openCreateModal = () => {
    setEditingProject(null);
    setForm(emptyForm);
    setError("");
    setModalOpen(true);
  };

  // OPEN EDIT MODAL
  const openEditModal = (project) => {
    setEditingProject(project);

    setForm({
      name: project.name || "",
      description: project.description || "",
      status: project.status || "active",
      startDate: project.startDate
        ? project.startDate.slice(0, 10)
        : "",
      dueDate: project.dueDate
        ? project.dueDate.slice(0, 10)
        : "",
    });

    setError("");
    setModalOpen(true);
  };

  // CLOSE MODAL
  const closeModal = () => {
    setModalOpen(false);
    setEditingProject(null);
    setForm(emptyForm);
    setError("");
  };

  // HANDLE FORM INPUTS
  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));
  };

  // CREATE OR UPDATE PROJECT
  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!form.name.trim()) {
      setError("Please enter a project name.");
      return;
    }

    if (
      form.startDate &&
      form.dueDate &&
      form.dueDate < form.startDate
    ) {
      setError("Due date cannot be earlier than the start date.");
      return;
    }

    try {
      setSaving(true);
      setError("");

      if (editingProject) {
        await updateProject(editingProject._id, form);
      } else {
        await createProject(form);
      }

      closeModal();
      await loadProjects();
    } catch (err) {
      setError(err.message || "Unable to save project.");
    } finally {
      setSaving(false);
    }
  };

  // DELETE PROJECT
  const handleDelete = async (project) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${project.name}"?`
    );

    if (!confirmed) return;

    try {
      setError("");

      await deleteProject(project._id);

      setProjects((current) =>
        current.filter((item) => item._id !== project._id)
      );
    } catch (err) {
      setError(err.message || "Unable to delete project.");
    }
  };

  // STATUS STYLES
  const statusStyle = {
    active: "bg-emerald-500/10 text-emerald-400",
    "on-hold": "bg-amber-500/10 text-amber-400",
    completed: "bg-blue-500/10 text-blue-400",
  };

  // FORMAT DATE
  const formatDate = (date) => {
    if (!date) return "Not set";

    return new Date(date).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <div className="min-h-screen bg-[#09090b] px-5 py-8 text-zinc-100 sm:px-8">
      <div className="mx-auto max-w-7xl">

        {/* HEADER */}
        <div className="mb-8 flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
          <div>
            <p className="mb-2 text-sm text-zinc-500">
              Workspace / Projects
            </p>

            <h1 className="text-3xl font-semibold tracking-tight">
              Projects
            </h1>

            <p className="mt-2 text-sm text-zinc-400">
              Organize and manage your team's projects.
            </p>
          </div>

          <button
            type="button"
            onClick={openCreateModal}
            className="flex items-center justify-center gap-2 rounded-lg bg-indigo-500 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-indigo-400"
          >
            <Plus size={18} />
            New project
          </button>
        </div>

        {/* PROJECT COUNTS */}
        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
          {[
            {
              label: "Total projects",
              value: projects.length,
              color: "text-white",
            },
            {
              label: "Active projects",
              value: projects.filter(
                (p) => p.status === "active"
              ).length,
              color: "text-emerald-400",
            },
            {
              label: "Completed projects",
              value: projects.filter(
                (p) => p.status === "completed"
              ).length,
              color: "text-blue-400",
            },
          ].map((item) => (
            <div
              key={item.label}
              className="rounded-xl border border-zinc-800 bg-[#111113] p-5"
            >
              <p className="text-sm text-zinc-500">
                {item.label}
              </p>

              <p className={`mt-2 text-3xl font-semibold ${item.color}`}>
                {item.value}
              </p>
            </div>
          ))}
        </div>

        {/* SEARCH AND FILTER */}
        <div className="mb-5 flex flex-col gap-3 sm:flex-row">

          <div className="relative flex-1">
            <label
              htmlFor="projectSearch"
              className="sr-only"
            >
              Search projects
            </label>

            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500"
            />

            <input
              id="projectSearch"
              name="projectSearch"
              type="text"
              autoComplete="off"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search projects..."
              className="w-full rounded-lg border border-zinc-800 bg-[#111113] py-3 pl-10 pr-4 text-sm outline-none placeholder:text-zinc-600 focus:border-indigo-500"
            />
          </div>

          <div>
            <label
              htmlFor="statusFilter"
              className="sr-only"
            >
              Filter by project status
            </label>

            <select
              id="statusFilter"
              name="statusFilter"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full rounded-lg border border-zinc-800 bg-[#111113] px-4 py-3 text-sm text-zinc-300 outline-none focus:border-indigo-500 sm:w-auto"
            >
              <option value="all">All statuses</option>
              <option value="active">Active</option>
              <option value="on-hold">On hold</option>
              <option value="completed">Completed</option>
            </select>
          </div>
        </div>

        {/* ERROR MESSAGE */}
        {error && !modalOpen && (
          <div
            role="alert"
            className="mb-5 rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400"
          >
            {error}
          </div>
        )}

        {/* PROJECT LIST */}
        {loading ? (
          <div className="flex items-center justify-center gap-2 py-20 text-zinc-400">
            <Loader2 className="animate-spin" size={20} />
            Loading projects...
          </div>
        ) : filteredProjects.length === 0 ? (
          <div className="rounded-xl border border-dashed border-zinc-800 py-16 text-center">
            <FolderKanban
              size={34}
              className="mx-auto mb-4 text-zinc-600"
            />

            <h3 className="text-lg font-medium">
              No projects found
            </h3>

            <p className="mt-2 text-sm text-zinc-500">
              Create a project or change your search filters.
            </p>

            <button
              type="button"
              onClick={openCreateModal}
              className="mt-5 rounded-lg bg-indigo-500 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-400"
            >
              Create your first project
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            {filteredProjects.map((project) => (
              <div
                key={project._id}
                className="rounded-xl border border-zinc-800 bg-[#111113] p-5 transition hover:border-zinc-700"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex min-w-0 items-start gap-3">
                    <div className="rounded-lg bg-indigo-500/10 p-3 text-indigo-400">
                      <FolderKanban size={21} />
                    </div>

                    <div className="min-w-0">
                      <h3 className="truncate font-semibold text-zinc-100">
                        {project.name}
                      </h3>

                      <p className="mt-1 line-clamp-2 text-sm text-zinc-500">
                        {project.description || "No description provided."}
                      </p>
                    </div>
                  </div>

                  <span
                    className={`shrink-0 rounded-full px-3 py-1 text-xs font-medium capitalize ${
                      statusStyle[project.status] ||
                      "bg-zinc-800 text-zinc-400"
                    }`}
                  >
                    {project.status.replace("-", " ")}
                  </span>
                </div>

                <div className="mt-6 flex flex-wrap gap-5 border-t border-zinc-800 pt-4 text-xs text-zinc-500">
                  <span className="flex items-center gap-2">
                    <CalendarDays size={14} />
                    Start: {formatDate(project.startDate)}
                  </span>

                  <span className="flex items-center gap-2">
                    <CalendarDays size={14} />
                    Due: {formatDate(project.dueDate)}
                  </span>
                </div>

                <div className="mt-5 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => openEditModal(project)}
                    className="flex items-center gap-2 rounded-lg border border-zinc-700 px-3 py-2 text-xs text-zinc-300 hover:bg-zinc-800"
                  >
                    <Pencil size={14} />
                    Edit
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDelete(project)}
                    className="flex items-center gap-2 rounded-lg border border-red-500/20 px-3 py-2 text-xs text-red-400 hover:bg-red-500/10"
                  >
                    <Trash2 size={14} />
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* CREATE / EDIT MODAL */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/70 p-4">
          <div className="my-auto w-full max-w-lg rounded-2xl border border-zinc-800 bg-[#141416] p-6 shadow-2xl">

            <div className="mb-6 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold">
                  {editingProject ? "Edit project" : "Create project"}
                </h2>

                <p className="mt-1 text-sm text-zinc-500">
                  Enter your project details below.
                </p>
              </div>

              <button
                type="button"
                onClick={closeModal}
                className="rounded-lg p-2 text-zinc-400 hover:bg-zinc-800 hover:text-white"
                aria-label="Close modal"
              >
                <X size={20} />
              </button>
            </div>

            {error && (
              <div
                role="alert"
                className="mb-4 rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-400"
              >
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">

              {/* PROJECT NAME */}
              <div>
                <label
                  htmlFor="projectName"
                  className="mb-2 block text-sm text-zinc-300"
                >
                  Project name *
                </label>

                <input
                  id="projectName"
                  name="name"
                  type="text"
                  autoComplete="off"
                  value={form.name}
                  onChange={handleChange}
                  required
                  maxLength={100}
                  placeholder="e.g. Website redesign"
                  className="w-full rounded-lg border border-zinc-700 bg-[#09090b] px-4 py-3 text-sm outline-none focus:border-indigo-500"
                />
              </div>

              {/* DESCRIPTION */}
              <div>
                <label
                  htmlFor="projectDescription"
                  className="mb-2 block text-sm text-zinc-300"
                >
                  Description
                </label>

                <textarea
                  id="projectDescription"
                  name="description"
                  autoComplete="off"
                  value={form.description}
                  onChange={handleChange}
                  rows={3}
                  placeholder="What is this project about?"
                  className="w-full resize-none rounded-lg border border-zinc-700 bg-[#09090b] px-4 py-3 text-sm outline-none focus:border-indigo-500"
                />
              </div>

              {/* STATUS */}
              <div>
                <label
                  htmlFor="projectStatus"
                  className="mb-2 block text-sm text-zinc-300"
                >
                  Status
                </label>

                <select
                  id="projectStatus"
                  name="status"
                  value={form.status}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-zinc-700 bg-[#09090b] px-4 py-3 text-sm outline-none focus:border-indigo-500"
                >
                  <option value="active">Active</option>
                  <option value="on-hold">On hold</option>
                  <option value="completed">Completed</option>
                </select>
              </div>

              {/* DATES */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="startDate"
                    className="mb-2 block text-sm text-zinc-300"
                  >
                    Start date
                  </label>

                  <input
                    id="startDate"
                    type="date"
                    name="startDate"
                    autoComplete="off"
                    value={form.startDate}
                    onChange={handleChange}
                    className="w-full rounded-lg border border-zinc-700 bg-[#09090b] px-3 py-3 text-sm outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label
                    htmlFor="dueDate"
                    className="mb-2 block text-sm text-zinc-300"
                  >
                    Due date
                  </label>

                  <input
                    id="dueDate"
                    type="date"
                    name="dueDate"
                    autoComplete="off"
                    value={form.dueDate}
                    onChange={handleChange}
                    className="w-full rounded-lg border border-zinc-700 bg-[#09090b] px-3 py-3 text-sm outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              {/* BUTTONS */}
              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={closeModal}
                  disabled={saving}
                  className="rounded-lg border border-zinc-700 px-4 py-2.5 text-sm text-zinc-300 hover:bg-zinc-800"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="flex items-center gap-2 rounded-lg bg-indigo-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-indigo-400 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {saving && (
                    <Loader2 size={16} className="animate-spin" />
                  )}

                  {saving
                    ? "Saving..."
                    : editingProject
                      ? "Save changes"
                      : "Create project"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Projects;
