
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const projectRequest = async (endpoint, options = {}) => {
  const token = sessionStorage.getItem("bugtracker_token");

  try {
    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options.headers,
      },
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(data.message || "Request failed");
    }

    return data;
  } catch (error) {
    console.error("Project API error:", error);
    throw error;
  }
};

export const getProjects = async () => {
  return await projectRequest("/api/projects");
};

export const createProject = async (projectData) => {
  return await projectRequest("/api/projects", {
    method: "POST",
    body: JSON.stringify(projectData),
  });
};

export const updateProject = async (id, projectData) => {
  return await projectRequest(`/api/projects/${id}`, {
    method: "PUT",
    body: JSON.stringify(projectData),
  });
};

export const deleteProject = async (id) => {
  return await projectRequest(`/api/projects/${id}`, {
    method: "DELETE",
  });
};
