const API_BASE_URL = process.env.REACT_APP_API_URL;

/**
 * API Service for handling all HTTP requests
 */
class ApiService {
  /**
   * Authentication APIs
   */
  async login(username, password) {
    const url = `${API_BASE_URL}/api/auth/login`;
    console.log('API Call - Login:', url);
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      return response.json();
    } catch (error) {
      console.error('API Error - Login:', error);
      throw error;
    }
  }

  async register(username, password) {
    const url = `${API_BASE_URL}/api/auth/register`;
    console.log('API Call - Register:', url);
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      return response.json();
    } catch (error) {
      console.error('API Error - Register:', error);
      throw error;
    }
  }

  /**
   * Note APIs
   */
  async fetchNotes(userId) {
    const url = `${API_BASE_URL}/api/notes/${userId}`;
    console.log('API Call - Fetch Notes:', url);
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Failed to fetch notes');
      }
      return response.json();
    } catch (error) {
      console.error('API Error - Fetch Notes:', error);
      throw error;
    }
  }

  async createNote(text, tag, userId, imageFile = null) {
    const url = `${API_BASE_URL}/api/notes`;
    console.log('API Call - Create Note:', url);
    try {
      const formData = new FormData();
      formData.append('text', text);
      formData.append('tag', tag);
      formData.append('userId', userId);
      
      if (imageFile) {
        formData.append('image', imageFile);
      }
      
      const response = await fetch(url, {
        method: 'POST',
        body: formData,
      });
      const data = await response.json();
      return data.note;
    } catch (error) {
      console.error('API Error - Create Note:', error);
      throw error;
    }
  }

  async updateNote(id, text, tag) {
    const url = `${API_BASE_URL}/api/notes/${id}`;
    console.log('API Call - Update Note:', url);
    try {
      const response = await fetch(url, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, tag }),
      });
      const data = await response.json();
      return data.success ? data.note : null;
    } catch (error) {
      console.error('API Error - Update Note:', error);
      throw error;
    }
  }

  async deleteNote(id) {
    const url = `${API_BASE_URL}/api/notes/${id}`;
    console.log('API Call - Delete Note:', url);
    try {
      const response = await fetch(url, {
        method: 'DELETE',
      });
      return response.ok;
    } catch (error) {
      console.error('API Error - Delete Note:', error);
      throw error;
    }
  }
}

const apiService = new ApiService();
export default apiService;
