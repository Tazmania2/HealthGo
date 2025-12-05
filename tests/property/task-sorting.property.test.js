/**
 * Property-Based Tests for Task Sorting
 * Tests universal properties that should hold across all inputs
 * Requirements: 2.4
 */

import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { sortTasks } from '../../task-utils.js';

// Generator for valid task objects
const taskArbitrary = fc.record({
  id: fc.string({ minLength: 1 }),
  name: fc.string({ minLength: 1 }),
  executionCount: fc.nat({ max: 1000 }),
  targetCount: fc.integer({ min: 1, max: 1000 }),
  isCompleted: fc.boolean()
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
});
