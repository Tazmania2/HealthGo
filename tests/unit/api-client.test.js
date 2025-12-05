/**
 * Unit Tests for API Client Module
 * Tests login success/failure scenarios and task operations
 * Requirements: 1.1, 1.2, 2.1, 3.3
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ApiClient, API_BASE_URL } from '../../api-client.js';

// Mock fetch globally
global.fetch = vi.fn();

describe('ApiClient', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    ApiClient.token = null;
  });

  describe('login', () => {
    it('should return token and user on successful login and store email (Requirement 1.1)', async () => {
      const mockResponse = {
        token: 'test-jwt-token',
        user: { id: '123', name: 'Test User' }
      };

      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse)
      });

      const result = await ApiClient.login({ email: 'test@example.com', password: 'password123' });

      expect(result).toEqual(mockResponse);
      expect(ApiClient.token).toBe('test-jwt-token');
      expect(ApiClient.userEmail).toBe('test@example.com');
      expect(global.fetch).toHaveBeenCalledWith(
        `${API_BASE_URL}/auth/login`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'client_id': 'template' },
          body: JSON.stringify({ email: 'test@example.com', password: 'password123' })
        }
      );
    });

    it('should throw error on invalid credentials (Requirement 1.2)', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: false,
        json: () => Promise.resolve({ message: 'Invalid credentials' })
      });

      await expect(
        ApiClient.login({ email: 'wrong@example.com', password: 'wrongpass' })
      ).rejects.toThrow('Invalid credentials');
      
      expect(ApiClient.token).toBeNull();
    });

    it('should throw default error when API returns non-JSON error', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: false,
        json: () => Promise.reject(new Error('Not JSON'))
      });

      await expect(
        ApiClient.login({ email: 'test@example.com', password: 'password' })
      ).rejects.toThrow('Login failed');
    });
  });

  describe('getTasksByStatus', () => {
    beforeEach(() => {
      ApiClient.token = 'valid-token';
      ApiClient.userEmail = 'test@example.com';
    });

    it('should fetch tasks by status with correct parameters', async () => {
      const mockTasks = [
        { id: '1', name: 'Task 1', executionCount: 0, targetCount: 5 }
      ];

      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ tasks: mockTasks })
      });

      const result = await ApiClient.getTasksByStatus('PENDING');

      expect(result).toEqual(mockTasks);
      expect(global.fetch).toHaveBeenCalledWith(
        `${API_BASE_URL}/user-action/search?user_email=test%40example.com&STATUS=PENDING&use_pagination=false`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'client_id': 'template',
            'Authorization': 'Bearer valid-token'
          }
        }
      );
    });

    it('should throw SESSION_EXPIRED on 401 response', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        json: () => Promise.resolve({ message: 'Unauthorized' })
      });

      await expect(ApiClient.getTasksByStatus('PENDING')).rejects.toThrow('SESSION_EXPIRED');
    });
  });

  describe('getTasks', () => {
    beforeEach(() => {
      ApiClient.token = 'valid-token';
      ApiClient.userEmail = 'test@example.com';
    });

    it('should fetch PENDING, DONE, and DELIVERED tasks and combine them (Requirement 2.1)', async () => {
      const pendingTasks = [{ id: '1', name: 'Pending Task' }];
      const doneTasks = [{ id: '2', name: 'Done Task' }];
      const deliveredTasks = [{ id: '3', name: 'Delivered Task' }];

      global.fetch
        .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve({ tasks: pendingTasks }) })
        .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve({ tasks: doneTasks }) })
        .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve({ tasks: deliveredTasks }) });

      const result = await ApiClient.getTasks();

      expect(result).toHaveLength(3);
      expect(result[0]).toEqual({ id: '1', name: 'Pending Task', isCompleted: false });
      expect(result[1]).toEqual({ id: '2', name: 'Done Task', isCompleted: true });
      expect(result[2]).toEqual({ id: '3', name: 'Delivered Task', isCompleted: true });
      expect(global.fetch).toHaveBeenCalledTimes(3);
    });

    it('should handle empty task arrays', async () => {
      global.fetch
        .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve({ tasks: [] }) })
        .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve({ tasks: [] }) })
        .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve({ tasks: [] }) });

      const result = await ApiClient.getTasks();
      expect(result).toEqual([]);
    });

    it('should throw error if any status fetch fails', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: () => Promise.resolve({ message: 'Server error' })
      });

      await expect(ApiClient.getTasks()).rejects.toThrow('Server error');
    });
  });


  describe('updateTaskExecution', () => {
    beforeEach(() => {
      ApiClient.token = 'valid-token';
    });

    it('should update task execution count (Requirement 3.3)', async () => {
      const mockUpdatedTask = {
        id: 'task-1',
        name: 'Test Task',
        executionCount: 5,
        targetCount: 10
      };

      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockUpdatedTask)
      });

      const result = await ApiClient.updateTaskExecution('task-1', 5);

      expect(result).toEqual(mockUpdatedTask);
      expect(global.fetch).toHaveBeenCalledWith(
        `${API_BASE_URL}/tasks/task-1`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'client_id': 'template',
            'Authorization': 'Bearer valid-token'
          },
          body: JSON.stringify({ executionCount: 5 })
        }
      );
    });

    it('should throw SESSION_EXPIRED on 401 response', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        json: () => Promise.resolve({ message: 'Unauthorized' })
      });

      await expect(
        ApiClient.updateTaskExecution('task-1', 5)
      ).rejects.toThrow('SESSION_EXPIRED');
    });

    it('should throw error on update failure', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: () => Promise.resolve({ message: 'Invalid execution count' })
      });

      await expect(
        ApiClient.updateTaskExecution('task-1', -1)
      ).rejects.toThrow('Invalid execution count');
    });
  });

  describe('markTaskComplete', () => {
    beforeEach(() => {
      ApiClient.token = 'valid-token';
    });

    it('should mark task as complete (Requirement 4.2)', async () => {
      const mockCompletedTask = {
        id: 'task-1',
        name: 'Test Task',
        executionCount: 10,
        targetCount: 10,
        isCompleted: true
      };

      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockCompletedTask)
      });

      const result = await ApiClient.markTaskComplete('task-1');

      expect(result).toEqual(mockCompletedTask);
      expect(global.fetch).toHaveBeenCalledWith(
        `${API_BASE_URL}/tasks/task-1`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'client_id': 'template',
            'Authorization': 'Bearer valid-token'
          },
          body: JSON.stringify({ isCompleted: true })
        }
      );
    });

    it('should throw SESSION_EXPIRED on 401 response', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        json: () => Promise.resolve({ message: 'Unauthorized' })
      });

      await expect(ApiClient.markTaskComplete('task-1')).rejects.toThrow('SESSION_EXPIRED');
    });

    it('should throw error on completion failure', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        json: () => Promise.resolve({ message: 'Task not found' })
      });

      await expect(ApiClient.markTaskComplete('invalid-id')).rejects.toThrow('Task not found');
    });
  });

  describe('getBaseHeaders', () => {
    it('should return headers with client_id', () => {
      const headers = ApiClient.getBaseHeaders();
      
      expect(headers).toEqual({ 
        'Content-Type': 'application/json',
        'client_id': 'template'
      });
    });
  });

  describe('getAuthHeaders', () => {
    it('should return headers with client_id but without Authorization when no token', () => {
      ApiClient.token = null;
      const headers = ApiClient.getAuthHeaders();
      
      expect(headers).toEqual({ 
        'Content-Type': 'application/json',
        'client_id': 'template'
      });
      expect(headers.Authorization).toBeUndefined();
    });

    it('should return headers with client_id and Authorization when token is set', () => {
      ApiClient.token = 'my-token';
      const headers = ApiClient.getAuthHeaders();
      
      expect(headers).toEqual({
        'Content-Type': 'application/json',
        'client_id': 'template',
        'Authorization': 'Bearer my-token'
      });
    });
  });
});
