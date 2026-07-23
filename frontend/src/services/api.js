// src/services/api.js
// Central API client — all backend calls go through here
// Automatically includes Firebase Auth token in every request
import { auth } from '../firebase/config';

const API_URL = import.meta.env.VITE_API_URL || '';

/**
 * Get the current user's Firebase ID token for Authorization header
 */
async function getAuthToken() {
  const user = auth.currentUser;
  if (!user) return null;
  try {
    return await user.getIdToken();
  } catch (err) {
    console.error('Failed to get auth token:', err);
    return null;
  }
}

/**
 * Make an authenticated API call to the backend
 * @param {string} endpoint - API path (e.g., '/api/products')
 * @param {object} options - fetch options (method, body, etc.)
 * @returns {Promise<any>} - parsed JSON response
 */
export async function apiCall(endpoint, options = {}) {
  const token = await getAuthToken();

  const headers = {
    ...options.headers,
  };

  // Add auth token if available
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  // If body is not FormData, set Content-Type to JSON
  if (options.body && !(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
    if (typeof options.body === 'object') {
      options.body = JSON.stringify(options.body);
    }
  }

  const url = `${API_URL}${endpoint}`;

  const response = await fetch(url, {
    ...options,
    headers,
  });

  // Parse response
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const error = new Error(data.error || `Request failed (${response.status})`);
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data;
}

/**
 * Shorthand helpers
 */
export const api = {
  get: (endpoint) => apiCall(endpoint, { method: 'GET' }),
  post: (endpoint, body) => apiCall(endpoint, { method: 'POST', body }),
  put: (endpoint, body) => apiCall(endpoint, { method: 'PUT', body }),
  patch: (endpoint, body) => apiCall(endpoint, { method: 'PATCH', body }),
  delete: (endpoint) => apiCall(endpoint, { method: 'DELETE' }),

  // Special: Upload file(s) via FormData
  upload: (endpoint, formData) =>
    apiCall(endpoint, { method: 'POST', body: formData }),
};
