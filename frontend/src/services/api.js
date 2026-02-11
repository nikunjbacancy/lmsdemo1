const API_BASE_URL = process.env.REACT_APP_API_URL;

// Log API configuration on module load
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('🔧 API Service Initialized');
console.log('🌐 API Base URL:', API_BASE_URL || 'NOT SET');
console.log('📍 Current Origin:', window.location.origin);
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

if (!API_BASE_URL) {
  console.error('⚠️ WARNING: REACT_APP_API_URL environment variable is not set!');
}

/**
 * API Service for handling all HTTP requests
 */
class ApiService {
  /**
   * Helper method to log request details
   */
  logRequest(method, url, options) {
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`🚀 API Request: ${method} ${url}`);
    console.log('📍 Origin:', window.location.origin);
    console.log('🔗 Full URL:', url);
    console.log('📋 Headers:', options.headers || {});
    if (options.body && typeof options.body === 'string') {
      try {
        const bodyObj = JSON.parse(options.body);
        console.log('📦 Request Body:', { ...bodyObj, password: '***' });
      } catch (e) {
        console.log('📦 Request Body:', options.body);
      }
    } else if (options.body instanceof FormData) {
      console.log('📦 Request Body: FormData');
    }
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  }

  /**
   * Helper method to log response details
   */
  logResponse(method, url, response, data) {
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`✅ API Response: ${method} ${url}`);
    console.log('📊 Status:', response.status, response.statusText);
    console.log('📋 Response Headers:');
    response.headers.forEach((value, key) => {
      if (key.toLowerCase().includes('access-control') || key.toLowerCase().includes('cors')) {
        console.log(`   🔐 ${key}: ${value}`);
      } else {
        console.log(`   ${key}: ${value}`);
      }
    });
    console.log('📦 Response Data:', data);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  }

  /**
   * Helper method to log errors
   */
  logError(method, url, error) {
    console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.error(`❌ API Error: ${method} ${url}`);
    console.error('📍 Origin:', window.location.origin);
    console.error('🔗 Target URL:', url);
    console.error('⚠️ Error Type:', error.name);
    console.error('💬 Error Message:', error.message);
    console.error('📚 Error Stack:', error.stack);
    
    // Check for CORS-specific errors
    if (error.message.includes('CORS') || error.message.includes('fetch')) {
      console.error('🚨 CORS ERROR DETECTED!');
      console.error('   This usually means:');
      console.error('   1. Backend CORS is not configured correctly');
      console.error('   2. Backend server is not running');
      console.error('   3. Origin mismatch in CORS configuration');
      console.error('   4. Preflight OPTIONS request failed');
    }
    console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  }

  /**
   * Authentication APIs
   */
  async login(username, password) {
    const url = `${API_BASE_URL}/api/auth/login`;
    const options = {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    };
    
    this.logRequest('POST', url, options);
    
    try {
      const response = await fetch(url, options);
      
      // Log response details
      const data = await response.json();
      this.logResponse('POST', url, response, data);
      
      if (!response.ok) {
        console.warn(`⚠️ Login failed with status ${response.status}`);
      }
      
      return data;
    } catch (error) {
      this.logError('POST', url, error);
      throw error;
    }
  }

  async register(username, password) {
    const url = `${API_BASE_URL}/api/auth/register`;
    const options = {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    };
    
    this.logRequest('POST', url, options);
    
    try {
      const response = await fetch(url, options);
      
      // Log response details
      const data = await response.json();
      this.logResponse('POST', url, response, data);
      
      if (!response.ok) {
        console.warn(`⚠️ Registration failed with status ${response.status}`);
      }
      
      return data;
    } catch (error) {
      this.logError('POST', url, error);
      throw error;
    }
  }

  /**
   * Note APIs
   */
  async fetchNotes(userId) {
    const url = `${API_BASE_URL}/api/notes/${userId}`;
    const options = { method: 'GET' };
    
    this.logRequest('GET', url, options);
    
    try {
      const response = await fetch(url, options);
      if (!response.ok) {
        throw new Error(`Failed to fetch notes: ${response.status}`);
      }
      const data = await response.json();
      this.logResponse('GET', url, response, data);
      return data;
    } catch (error) {
      this.logError('GET', url, error);
      throw error;
    }
  }

  async createNote(text, tag, userId, imageFile = null) {
    const url = `${API_BASE_URL}/api/notes`;
    const formData = new FormData();
    formData.append('text', text);
    formData.append('tag', tag);
    formData.append('userId', userId);
    
    if (imageFile) {
      formData.append('image', imageFile);
    }
    
    const options = {
      method: 'POST',
      body: formData,
    };
    
    this.logRequest('POST', url, options);
    
    try {
      const response = await fetch(url, options);
      const data = await response.json();
      this.logResponse('POST', url, response, data);
      return data.note;
    } catch (error) {
      this.logError('POST', url, error);
      throw error;
    }
  }

  async updateNote(id, text, tag) {
    const url = `${API_BASE_URL}/api/notes/${id}`;
    const options = {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, tag }),
    };
    
    this.logRequest('PUT', url, options);
    
    try {
      const response = await fetch(url, options);
      const data = await response.json();
      this.logResponse('PUT', url, response, data);
      return data.success ? data.note : null;
    } catch (error) {
      this.logError('PUT', url, error);
      throw error;
    }
  }

  async deleteNote(id) {
    const url = `${API_BASE_URL}/api/notes/${id}`;
    const options = { method: 'DELETE' };
    
    this.logRequest('DELETE', url, options);
    
    try {
      const response = await fetch(url, options);
      this.logResponse('DELETE', url, response, { success: response.ok });
      return response.ok;
    } catch (error) {
      this.logError('DELETE', url, error);
      throw error;
    }
  }
}

const apiService = new ApiService();
export default apiService;
