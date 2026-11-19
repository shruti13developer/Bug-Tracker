
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

// Reusable API request function
const apiRequest = async (endpoint, options = {}) => {
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

// Save JWT token
const saveToken = (data) => {
  if (data.token) {
    sessionStorage.setItem("bugtracker_token", data.token);
  }
};

// Register a new user
export const registerUser = async (userData) => {
  const data = await apiRequest("/api/auth/register", {
    method: "POST",
    body: JSON.stringify(userData),
  });

  saveToken(data);
  return data;
};

// Login existing user
export const loginUser = async (credentials) => {
  const data = await apiRequest("/api/auth/login", {
    method: "POST",
    body: JSON.stringify(credentials),
  });

  saveToken(data);
  return data;
};

// Get logged-in user's profile
export const getCurrentUser = async () => {
  return await apiRequest("/api/auth/me", {
    method: "GET",
  });
};

// Logout
export const logoutUser = () => {
  sessionStorage.removeItem("bugtracker_token");
};
