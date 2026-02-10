const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

/**
 * API Service for handling all HTTP requests
 */
class ApiService {
  /**
   * Authentication APIs
   */
  async login(username, password) {
    const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });
    return response.json();
  }

  async register(username, password) {
    const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });
    return response.json();
  }

  /**
   * Note APIs
   */
  async fetchNotes(userId) {
    const response = await fetch(`${API_BASE_URL}/api/notes/${userId}`);
    if (!response.ok) {
      throw new Error('Failed to fetch notes');
    }
    return response.json();
  }

  async createNote(text, tag, userId, imageFile = null) {
    const formData = new FormData();
    formData.append('text', text);
    formData.append('tag', tag);
    formData.append('userId', userId);
    
    if (imageFile) {
      formData.append('image', imageFile);
    }
    
    const response = await fetch(`${API_BASE_URL}/api/notes`, {
      method: 'POST',
      body: formData,
    });
    const data = await response.json();
    return data.note;
  }

  async updateNote(id, text, tag) {
    const response = await fetch(`${API_BASE_URL}/api/notes/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, tag }),
    });
    const data = await response.json();
    return data.success ? data.note : null;
  }

  async deleteNote(id) {
    const response = await fetch(`${API_BASE_URL}/api/notes/${id}`, {
      method: 'DELETE',
    });
    return response.ok;
  }
}

const apiService = new ApiService();
export default apiService;
