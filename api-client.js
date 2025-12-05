/**
 * API Client Module
 * Handles all communication with the G4U API
 */

export const API_BASE_URL = 'https://g4u-mvp-api.onrender.com';

export const ApiClient = {
  token: null,

  /**
   * Set the authentication token for API requests
   * @param {string} token - JWT token
   */
  setToken(token) {
    this.token = token;
  },

  /**
   * Get authorization headers
   * @returns {Object} Headers object with Authorization
   */
  getAuthHeaders() {
    return {
      'Content-Type': 'application/json',
      ...(this.token && { 'Authorization': `Bearer ${this.token}` })
    };
  },

  /**
   * Authenticate user against G4U API
   * @param {Object} credentials - { email, password }
   * @returns {Promise<Object>} - { token, user }
   */
  async login(credentials) {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials)
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Login failed' }));
      throw new Error(error.message || 'Invalid credentials');
    }

    const data = await response.json();
    this.setToken(data.token);
    return data;
  },

  /**
   * Fetch user's tasks from G4U API
   * @returns {Promise<Array>} - Array of task objects
   */
  async getTasks() {
    const response = await fetch(`${API_BASE_URL}/tasks`, {
      method: 'GET',
      headers: this.getAuthHeaders()
    });

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('SESSION_EXPIRED');
      }
      const error = await response.json().catch(() => ({ message: 'Failed to fetch tasks' }));
      throw new Error(error.message || 'Failed to fetch tasks');
    }

    const data = await response.json();
    return data.tasks || data;
  },

  /**
   * Update task execution count
   * @param {string} taskId - Task ID
   * @param {number} executionCount - New execution count
   * @returns {Promise<Object>} - Updated task
   */
  async updateTaskExecution(taskId, executionCount) {
    const response = await fetch(`${API_BASE_URL}/tasks/${taskId}`, {
      method: 'PATCH',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ executionCount })
    });

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('SESSION_EXPIRED');
      }
      const error = await response.json().catch(() => ({ message: 'Failed to update task' }));
      throw new Error(error.message || 'Failed to update task');
    }

    return response.json();
  },

  /**
   * Mark task as complete
   * @param {string} taskId - Task ID
   * @returns {Promise<Object>} - Updated task
   */
  async markTaskComplete(taskId) {
    const response = await fetch(`${API_BASE_URL}/tasks/${taskId}`, {
      method: 'PATCH',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ isCompleted: true })
    });

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('SESSION_EXPIRED');
      }
      const error = await response.json().catch(() => ({ message: 'Failed to complete task' }));
      throw new Error(error.message || 'Failed to complete task');
    }

    return response.json();
  }
};
