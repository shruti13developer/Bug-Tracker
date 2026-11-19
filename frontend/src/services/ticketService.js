
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const ticketRequest = async (endpoint, options = {}) => {
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

// Get all tickets
export const getTickets = async (filters = {}) => {
  const query = new URLSearchParams(filters).toString();

  return await ticketRequest(
    `/api/tickets${query ? `?${query}` : ""}`
  );
};

// Get a single ticket
export const getTicketById = async (id) => {
  return await ticketRequest(`/api/tickets/${id}`);
};

// Create ticket
export const createTicket = async (ticketData) => {
  return await ticketRequest("/api/tickets", {
    method: "POST",
    body: JSON.stringify(ticketData),
  });
};

// Update ticket
export const updateTicket = async (id, ticketData) => {
  return await ticketRequest(`/api/tickets/${id}`, {
    method: "PUT",
    body: JSON.stringify(ticketData),
  });
};

// Delete ticket
export const deleteTicket = async (id) => {
  return await ticketRequest(`/api/tickets/${id}`, {
    method: "DELETE",
  });
};
