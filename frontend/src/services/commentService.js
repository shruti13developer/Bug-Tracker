
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const commentRequest = async (endpoint, options = {}) => {
  const token = sessionStorage.getItem("bugtracker_token");

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
    throw new Error(data.message || "Something went wrong");
  }

  return data;
};

// Get comments for a ticket
export const getComments = async (ticketId) => {
  return await commentRequest(`/api/comments/${ticketId}`);
};

// Add a comment or reply
export const createComment = async (commentData) => {
  return await commentRequest("/api/comments", {
    method: "POST",
    body: JSON.stringify(commentData),
  });
};

// Edit a comment
export const updateComment = async (id, content) => {
  return await commentRequest(`/api/comments/${id}`, {
    method: "PUT",
    body: JSON.stringify({ content }),
  });
};

// Delete a comment
export const deleteComment = async (id) => {
  return await commentRequest(`/api/comments/${id}`, {
    method: "DELETE",
  });
};
