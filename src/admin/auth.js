'use client'

const isTokenExpired = (token) => {
  if (!token) return true;
  
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return (payload.exp * 1000) < (Date.now() - 30000);
  } catch (error) {
    console.error("Token parse error:", error);
    return true;
  }
};

const refreshAuthToken = async (apiUrl) => {
  try {
    console.log("Attempting to refresh token...");
    const refreshToken = localStorage.getItem('refresh_token');
    if (!refreshToken) {
      throw new Error("No refresh token available");
    }
    
    const response = await fetch(`${apiUrl}/api/auth/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refresh_token: refreshToken })
    });
    
    if (!response.ok) {
      throw new Error(`Token refresh failed: ${response.statusText}`);
    }
    
    const data = await response.json();
    
    localStorage.setItem('token', data.access_token);
    localStorage.setItem('refresh_token', data.refresh_token);
    if (data.user_info) {
      localStorage.setItem('user_info', JSON.stringify(data.user_info));
    }
    
    return data.access_token;
  } catch (error) {
    console.error("Auth refresh error:", error);
    localStorage.removeItem('token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user_info');
    
    // Redirect to login
    window.location.href = '/adm';
    throw error;
  }
};

const authFetch = async (url, options = {}) => {
  let token = localStorage.getItem('token');
  const apiUrl = url.split('/api')[0]; // Extract base API URL
  
  if (!token || isTokenExpired(token)) {
    try {
      token = await refreshAuthToken(apiUrl);
    } catch (error) {
      throw new Error(`Auth required: ${error.message}`);
    }
  }
  
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
    ...options.headers
  };

  try {
    const response = await fetch(url, { 
      ...options, 
      headers
    });
    
    if (response.status === 401) {
      try {
        const newToken = await refreshAuthToken(apiUrl);
        
        const retryHeaders = {
          ...headers,
          'Authorization': `Bearer ${newToken}`
        };
        
        const retryResponse = await fetch(url, { 
          ...options, 
          headers: retryHeaders
        });
        
        if (!retryResponse.ok) {
          throw new Error('Retry failed');
        }
        
        return retryResponse;
      } catch (refreshError) {
        throw new Error(`Authentication failed: ${refreshError.message}`);
      }
    }
    
    if (!response.ok) {
      throw new Error('Request failed');
    }
    
    return response;
  } catch (error) {
    console.error("Fetch error:", error);
    throw error;
  }
};

export { authFetch, isTokenExpired, refreshAuthToken };