// apiUtils.js - Utility functions for API requests

const API_URL = "http://127.0.0.1:8000";

/**
 * Get the authentication token from local storage
 * @returns {string|null} The authentication token or null if not found
 */
export const getAuthToken = () => {
  return localStorage.getItem('accessToken');
}

/**
 * Check if the user is authenticated
 * @returns {boolean} True if authenticated, false otherwise
 */
export const isAuthenticated = () => {
  return !!getAuthToken();
}

/**
 * Create headers with authentication token
 * @param {boolean} includeContentType - Whether to include Content-Type: application/json
 * @returns {Headers} Headers object with Authorization header
 */
export const createAuthHeaders = (includeContentType = true) => {
  const headers = new Headers();
  const token = getAuthToken();
  
  if (token) {
    headers.append('Authorization', `Bearer ${token}`);
  }
  
  if (includeContentType) {
    headers.append('Content-Type', 'application/json');
  }
  
  return headers;
}

/**
 * Perform an authenticated API request
 * @param {string} endpoint - API endpoint (without base URL)
 * @param {Object} options - Request options
 * @returns {Promise} Response promise
 */
export const apiRequest = async (endpoint, options = {}) => {
  // Use provided headers or create default auth headers
  const headers = options.headers || createAuthHeaders();
  
  const config = {
    ...options,
    headers
  };
  
  const response = await fetch(`${API_URL}${endpoint}`, config);
  
  // Handle 401 Unauthorized errors (token expired or invalid)
  if (response.status === 401) {
    // Clear the token and redirect to login
    localStorage.removeItem('accessToken');
    window.location.href = '/admin/login';
    throw new Error('Authentication failed. Please log in again.');
  }
  
  return response;
}

/**
 * Upload a file with authentication
 * @param {string} endpoint - API endpoint for file upload
 * @param {FormData} formData - Form data containing the file and other fields
 * @returns {Promise} Response promise
 */
export const uploadWithAuth = async (endpoint, formData) => {
  const headers = new Headers();
  const token = getAuthToken();
  
  if (token) {
    headers.append('Authorization', `Bearer ${token}`);
  }
  // Don't set Content-Type for FormData, browser will set it with boundary
  
  return apiRequest(endpoint, {
    method: 'POST',
    headers,
    body: formData
  });
}

export default {
  getAuthToken,
  isAuthenticated,
  createAuthHeaders,
  apiRequest,
  uploadWithAuth
};