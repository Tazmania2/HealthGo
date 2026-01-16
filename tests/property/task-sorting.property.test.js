/**
 * Property-Based Tests for Task Sorting
 * Tests universal properties that should hold across all inputs
 * Requirements: 2.4, 1.1, 1.3, 1.4
 */

import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { sortTasks } from '../../task-utils.js';

// Generator for valid task objects (without priority)
const taskArbitrary = fc.record({
  id: fc.uuid(),
  name: fc.string({ minLength: 1 }),
  executionCount: fc.nat({ max: 1000 }),
  targetCount: fc.integer({ min: 1, max: 1000 }),
  isCompleted: fc.boolean()
});

// Generator for valid task objects with priority (1-10)
const taskWithPriorityArbitrary = fc.record({
  id: fc.uuid(),
  name: fc.string({ minLength: 1 }),
  executionCount: fc.nat({ max: 1000 }),
  targetCount: fc.integer({ min: 1, max: 1000 }),
  isCompleted: fc.boolean(),
  priority: fc.integer({ min: 1, max: 10 })
});

// Generator for task lists
const taskListArbitrary = fc.array(taskArbitrary, { minLength: 0, maxLength: 50 });

describe('Task Sorting Property Tests', () => {
  // **Feature: factory-task-tracker, Property 5: Tasks are sorted with active before completed**
  describe('Property 5: Tasks are sorted with active before completed', () => {
    it('*For any* list of tasks, after sorting, all tasks where isCompleted=false SHALL appear before all tasks where isCompleted=true', () => {
      fc.assert(
        fc.property(
          taskListArbitrary,
          (tasks) => {
            const sorted = sortTasks(tasks);
            
            // Find the index of the first completed task
            const firstCompletedIndex = sorted.findIndex(t => t.isCompleted);
            
            // If there are no completed tasks, all tasks should be active
            if (firstCompletedIndex === -1) {
              // All tasks are active, which is valid
              expect(sorted.every(t => !t.isCompleted)).toBe(true);
              return;
            }
            
            // All tasks before firstCompletedIndex should be active
            for (let i = 0; i < firstCompletedIndex; i++) {
              expect(sorted[i].isCompleted).toBe(false);
            }
            
            // All tasks from firstCompletedIndex onwards should be completed
            for (let i = firstCompletedIndex; i < sorted.length; i++) {
              expect(sorted[i].isCompleted).toBe(true);
            }
          }
        ),
        { numRuns: 100 }
      );
    });

    it('*For any* list of tasks, sorting SHALL preserve all original tasks', () => {
      fc.assert(
        fc.property(
          taskListArbitrary,
          (tasks) => {
            const sorted = sortTasks(tasks);
            
            // Property: sorted list SHALL have same length as original
            expect(sorted.length).toBe(tasks.length);
            
            // Property: all original tasks SHALL be present in sorted list
            for (const task of tasks) {
              const found = sorted.find(t => t.id === task.id);
              expect(found).toBeDefined();
              expect(found).toEqual(task);
            }
          }
        ),
        { numRuns: 100 }
      );
    });

    it('*For any* list of tasks, sorting SHALL NOT mutate the original array', () => {
      fc.assert(
        fc.property(
          taskListArbitrary,
          (tasks) => {
            // Create a deep copy of original tasks
            const originalTasks = JSON.parse(JSON.stringify(tasks));
            
            // Sort the tasks
            sortTasks(tasks);
            
            // Property: original array SHALL be unchanged
            expect(tasks).toEqual(originalTasks);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('*For any* list with only active tasks, sorting SHALL return all active tasks', () => {
      const activeOnlyTasks = fc.array(
        taskArbitrary.map(t => ({ ...t, isCompleted: false })),
        { minLength: 0, maxLength: 50 }
      );

      fc.assert(
        fc.property(
          activeOnlyTasks,
          (tasks) => {
            const sorted = sortTasks(tasks);
            
            // Property: all tasks SHALL be active
            expect(sorted.every(t => !t.isCompleted)).toBe(true);
            expect(sorted.length).toBe(tasks.length);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('*For any* list with only completed tasks, sorting SHALL return all completed tasks', () => {
      const completedOnlyTasks = fc.array(
        taskArbitrary.map(t => ({ ...t, isCompleted: true })),
        { minLength: 0, maxLength: 50 }
      );

      fc.assert(
        fc.property(
          completedOnlyTasks,
          (tasks) => {
            const sorted = sortTasks(tasks);
            
            // Property: all tasks SHALL be completed
            expect(sorted.every(t => t.isCompleted)).toBe(true);
            expect(sorted.length).toBe(tasks.length);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('*For any* empty list, sorting SHALL return an empty list', () => {
      const sorted = sortTasks([]);
      expect(sorted).toEqual([]);
    });
  });

  // **Feature: task-priority-sorting, Property 1: Priority sorting order**
  // **Validates: Requirements 1.1**
  describe('Property 1: Priority sorting order', () => {
    it('*For any* list of active tasks with priorities, after sorting, each task priority SHALL be less than or equal to the next task priority (ascending order)', () => {
      const activeTasksWithPriority = fc.array(
        taskWithPriorityArbitrary.map(t => ({ ...t, isCompleted: false })),
        { minLength: 2, maxLength: 50 }
      );

      fc.assert(
        fc.property(
          activeTasksWithPriority,
          (tasks) => {
            const sorted = sortTasks(tasks);
            
            // Property: each active task's priority SHALL be <= next task's priority
            for (let i = 0; i < sorted.length - 1; i++) {
              expect(sorted[i].priority).toBeLessThanOrEqual(sorted[i + 1].priority);
            }
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  // **Feature: task-priority-sorting, Property 2: Stable sort for equal priorities**
  // **Validates: Requirements 1.3**
  describe('Property 2: Stable sort for equal priorities', () => {
    it('*For any* list of tasks where multiple tasks have the same priority, after sorting, those tasks SHALL maintain their original relative order', () => {
      // Generate tasks with same priority to test stable sort
      const samePriorityTasks = fc.integer({ min: 1, max: 10 }).chain(priority =>
        fc.array(
          taskWithPriorityArbitrary.map(t => ({ ...t, isCompleted: false, priority })),
          { minLength: 2, maxLength: 20 }
        )
      );

      fc.assert(
        fc.property(
          samePriorityTasks,
          (tasks) => {
            // Add original index to track order
            const tasksWithIndex = tasks.map((t, idx) => ({ ...t, originalIndex: idx }));
            const sorted = sortTasks(tasksWithIndex);
            
            // Property: for tasks with same priority, original order SHALL be preserved
            for (let i = 0; i < sorted.length - 1; i++) {
              if (sorted[i].priority === sorted[i + 1].priority) {
                expect(sorted[i].originalIndex).toBeLessThan(sorted[i + 1].originalIndex);
              }
            }
          }
        ),
        { numRuns: 100 }
      );
    });

    it('*For any* list of active tasks with mixed priorities, tasks with equal priority SHALL maintain relative order', () => {
      const mixedPriorityTasks = fc.array(
        taskWithPriorityArbitrary.map(t => ({ ...t, isCompleted: false })),
        { minLength: 3, maxLength: 30 }
      );

      fc.assert(
        fc.property(
          mixedPriorityTasks,
          (tasks) => {
            // Add original index to track order
            const tasksWithIndex = tasks.map((t, idx) => ({ ...t, originalIndex: idx }));
            const sorted = sortTasks(tasksWithIndex);
            
            // Group by priority and check relative order is preserved
            const priorityGroups = new Map();
            for (const task of sorted) {
              if (!priorityGroups.has(task.priority)) {
                priorityGroups.set(task.priority, []);
              }
              priorityGroups.get(task.priority).push(task.originalIndex);
            }
            
            // Property: within each priority group, original indices SHALL be in ascending order
            for (const indices of priorityGroups.values()) {
              for (let i = 0; i < indices.length - 1; i++) {
                expect(indices[i]).toBeLessThan(indices[i + 1]);
              }
            }
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  // **Feature: task-priority-sorting, Property 3: Completed tasks remain separate**
  // **Validates: Requirements 1.4**
  describe('Property 3: Completed tasks remain separate', () => {
    it('*For any* list of tasks containing both active and completed tasks, after sorting, all active tasks SHALL appear before all completed tasks regardless of priority values', () => {
      // Generate mixed list with both active and completed tasks with various priorities
      const mixedTasks = fc.tuple(
        fc.array(
          taskWithPriorityArbitrary.map(t => ({ ...t, isCompleted: false })),
          { minLength: 1, maxLength: 25 }
        ),
        fc.array(
          taskWithPriorityArbitrary.map(t => ({ ...t, isCompleted: true })),
          { minLength: 1, maxLength: 25 }
        )
      ).map(([active, completed]) => [...active, ...completed]);

      fc.assert(
        fc.property(
          mixedTasks,
          (tasks) => {
            // Shuffle to ensure order doesn't matter
            const shuffled = [...tasks].sort(() => Math.random() - 0.5);
            const sorted = sortTasks(shuffled);
            
            // Find the index of the first completed task
            const firstCompletedIndex = sorted.findIndex(t => t.isCompleted);
            
            if (firstCompletedIndex === -1) {
              // No completed tasks - all should be active
              expect(sorted.every(t => !t.isCompleted)).toBe(true);
              return;
            }
            
            // Property: all tasks before firstCompletedIndex SHALL be active
            for (let i = 0; i < firstCompletedIndex; i++) {
              expect(sorted[i].isCompleted).toBe(false);
            }
            
            // Property: all tasks from firstCompletedIndex onwards SHALL be completed
            for (let i = firstCompletedIndex; i < sorted.length; i++) {
              expect(sorted[i].isCompleted).toBe(true);
            }
          }
        ),
        { numRuns: 100 }
      );
    });

    it('*For any* completed task with high priority (1-3), it SHALL still appear after all active tasks with low priority (8-10)', () => {
      // Generate high priority completed tasks and low priority active tasks
      const highPriorityCompleted = fc.array(
        taskWithPriorityArbitrary.map(t => ({ ...t, isCompleted: true, priority: fc.integer({ min: 1, max: 3 }) })),
        { minLength: 1, maxLength: 10 }
      ).chain(tasks => 
        fc.constant(tasks.map(t => ({ ...t, priority: Math.floor(Math.random() * 3) + 1 })))
      );
      
      const lowPriorityActive = fc.array(
        taskWithPriorityArbitrary.map(t => ({ ...t, isCompleted: false, priority: fc.integer({ min: 8, max: 10 }) })),
        { minLength: 1, maxLength: 10 }
      ).chain(tasks =>
        fc.constant(tasks.map(t => ({ ...t, priority: Math.floor(Math.random() * 3) + 8 })))
      );

      fc.assert(
        fc.property(
          fc.tuple(
            fc.array(taskWithPriorityArbitrary.map(t => ({ ...t, isCompleted: true })), { minLength: 1, maxLength: 10 }),
            fc.array(taskWithPriorityArbitrary.map(t => ({ ...t, isCompleted: false })), { minLength: 1, maxLength: 10 })
          ),
          ([completedTasks, activeTasks]) => {
            // Set high priority for completed, low for active
            const highPriorityCompleted = completedTasks.map(t => ({ ...t, priority: 1 }));
            const lowPriorityActive = activeTasks.map(t => ({ ...t, priority: 10 }));
            
            const mixed = [...highPriorityCompleted, ...lowPriorityActive];
            const shuffled = [...mixed].sort(() => Math.random() - 0.5);
            const sorted = sortTasks(shuffled);
            
            // Property: all active tasks (even low priority) SHALL appear before completed tasks (even high priority)
            const firstCompletedIndex = sorted.findIndex(t => t.isCompleted);
            
            if (firstCompletedIndex !== -1) {
              // All tasks before first completed should be active
              for (let i = 0; i < firstCompletedIndex; i++) {
                expect(sorted[i].isCompleted).toBe(false);
              }
            }
          }
        ),
        { numRuns: 100 }
      );
    });
  });
});
