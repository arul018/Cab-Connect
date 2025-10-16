const API_BASE_URL = 'http://localhost:9093'; // ProfileService backend URL

class ProfileAPIService {
  async request(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      ...options
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || `HTTP error! status: ${response.status}`);
      }
      
      return data;
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  async get(endpoint, options = {}) {
    return this.request(endpoint, { method: 'GET', ...options });
  }

  async post(endpoint, data = null, options = {}) {
    return this.request(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : null,
      ...options
    });
  }

  async put(endpoint, data = null, options = {}) {
    return this.request(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : null,
      ...options
    });
  }

  async delete(endpoint, options = {}) {
    return this.request(endpoint, { method: 'DELETE', ...options });
  }

  // Specific methods for profile operations
  async loginUser(credentials) {
    return this.post('/api/profiles/user/login', credentials);
  }

  async loginDriver(credentials) {
    return this.post('/api/profiles/driver/login', credentials);
  }

  async validateUserSession(sessionId) {
    return this.get(`/api/profiles/user/validate/${sessionId}`);
  }

  async validateDriverSession(sessionId) {
    return this.get(`/api/profiles/driver/validate/${sessionId}`);
  }

  async getUserProfile(sessionId) {
    return this.get(`/api/profiles/user/profile/${sessionId}`);
  }

  async getDriverProfile(sessionId) {
    return this.get(`/api/profiles/driver/profile/${sessionId}`);
  }

  async logoutUser(sessionId) {
    return this.post(`/api/profiles/user/logout/${sessionId}`);
  }

  async logoutDriver(sessionId) {
    return this.post(`/api/profiles/driver/logout/${sessionId}`);
  }
}

export const profileAPI = new ProfileAPIService();
