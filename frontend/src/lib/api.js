function getApiUrl() {
  if (typeof window !== "undefined") {
    const port = process.env.NEXT_PUBLIC_API_PORT || "5000";
    return `http://${window.location.hostname}:${port}`;
  }
  return process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
}

const API_URL = getApiUrl();

async function api(endpoint, options = {}) {
  if (typeof window === "undefined") {
    return fetch(`${API_URL}${endpoint}`, options);
  }

  const token = localStorage.getItem("medibook_token");

  const headers = {
    "Content-Type": "application/json",
    ...options.headers,
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (response.status === 401 && token) {
    localStorage.removeItem("medibook_token");
    localStorage.removeItem("medibook_user");
    window.location.href = "/login";
    throw new Error("Session expirée");
  }

  return response;
}

export { api };

// Also keep default export for compatibility
export default api;
