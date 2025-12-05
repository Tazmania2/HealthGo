/**
 * Property-Based Tests for Task Completion Flow
 * Tests universal properties that should hold across all inputs
 * Requirements: 4.1, 4.2, 4.3
 */

import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { 
  shouldTriggerCompletionPrompt, 
  confirmCompletion, 
  declineCompletion,
  incrementExecutionCount,
  sortTasks
} from '../../task-utils.js';

// Generator for active task one step away from completion
const taskOneStepFromCompletion = fc.integer({ min: 1, max: 1000 }).chain(target =>
  fc.record({
    id: fc.string({ minLength: 1 }),
    name: fc.string({ minLength: 1 }),
    executionCount: fc.constant(target - 1),
    targetCount: fc.constant(target),
    isCompleted: fc.constant(false)
  })
);

// Generator for active task at target count (ready for completion prompt)
const taskAtTargetCount = fc.integer({ min: 1, max: 1000 }).chain(target =>
  fc.record({
    id: fc.string({ minLength: 1 }),
    name: fc.string({ minLength: 1 }),
    executionCount: fc.constant(target),
    targetCount: fc.constant(target),
    isCompleted: fc.constant(false)
  })
);

// Generator for active task NOT at target count
const taskNotAtTargetCount = fc.record({
  id: fc.string({ minLength: 1 }),
  name: fc.string({ minLength: 1 }),
  executionCount: fc.nat({ max: 998 }),
  targetCount: fc.integer({ min: 1, max: 1000 }),
  isCompleted: fc.constant(false)
}).filter(task => task.executionCount < task.targetCount);

// Generator for already completed task
const completedTask = fc.integer({ min: 1, max: 1000 }).chain(target =>
  fc.record({
    id: fc.string({ minLength: 1 }),
    name: fc.string({ minLength: 1 }),
    executionCount: fc.constant(target),
    targetCount: fc.constant(target),
    isCompleted: fc.constant(true)
  })
);

describe('Task Completion Property Tests', () => {

  // **Feature: factory-task-tracker, Property 8: Completion prompt triggers at target count**
  describe('Property 8: Completion prompt triggers at target count', () => {
    it('*For any* task one step from completion, incrementing SHALL trigger completion prompt', () => {
      fc.assert(
        fc.property(
          taskOneStepFromCompletion,
          (task) => {
            // Increment the task
            const newCount = incrementExecutionCount(task);
            
            // Property: completion prompt SHALL trigger when newCount equals targetCount
            const shouldTrigger = shouldTriggerCompletionPrompt(task, newCount);
            expect(shouldTrigger).toBe(true);
            expect(newCount).toBe(task.targetCount);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('*For any* task NOT at target count after increment, completion prompt SHALL NOT trigger', () => {
      fc.assert(
        fc.property(
          taskNotAtTargetCount.filter(t => t.executionCount < t.targetCount - 1),
          (task) => {
            // Increment the task
            const newCount = incrementExecutionCount(task);
            
            // Property: completion prompt SHALL NOT trigger when newCount < targetCount
            const shouldTrigger = shouldTriggerCompletionPrompt(task, newCount);
            expect(shouldTrigger).toBe(false);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('*For any* already completed task, completion prompt SHALL NOT trigger', () => {
      fc.assert(
        fc.property(
          completedTask,
          (task) => {
            // Even if we pass target count, completed tasks should not trigger
            const shouldTrigger = shouldTriggerCompletionPrompt(task, task.targetCount);
            expect(shouldTrigger).toBe(false);
          }
        ),
        { numRuns: 100 }
      );
    });
  });


  // **Feature: factory-task-tracker, Property 9: Confirming completion marks task complete and reorders**
  describe('Property 9: Confirming completion marks task complete and reorders', () => {
    it('*For any* task at target count, confirming completion SHALL set isCompleted=true', () => {
      fc.assert(
        fc.property(
          taskAtTargetCount,
          (task) => {
            const completedTask = confirmCompletion(task);
            
            // Property: isCompleted SHALL be true after confirmation
            expect(completedTask.isCompleted).toBe(true);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('*For any* task at target count, confirming completion SHALL preserve other task properties', () => {
      fc.assert(
        fc.property(
          taskAtTargetCount,
          (task) => {
            const completedTask = confirmCompletion(task);
            
            // Property: all other properties SHALL be preserved
            expect(completedTask.id).toBe(task.id);
            expect(completedTask.name).toBe(task.name);
            expect(completedTask.executionCount).toBe(task.executionCount);
            expect(completedTask.targetCount).toBe(task.targetCount);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('*For any* confirmed task, sorting SHALL place it in completed section', () => {
      // Generate a mix of active and one task to be completed
      const mixedTasksWithCompletion = fc.tuple(
        fc.array(taskNotAtTargetCount, { minLength: 1, maxLength: 10 }),
        taskAtTargetCount
      );

      fc.assert(
        fc.property(
          mixedTasksWithCompletion,
          ([activeTasks, taskToComplete]) => {
            // Confirm completion on the task
            const completedTask = confirmCompletion(taskToComplete);
            
            // Create task list with the completed task
            const allTasks = [...activeTasks, completedTask];
            const sorted = sortTasks(allTasks);
            
            // Property: completed task SHALL appear after all active tasks
            const completedIndex = sorted.findIndex(t => t.id === completedTask.id);
            const activeCount = sorted.filter(t => !t.isCompleted).length;
            
            expect(completedIndex).toBeGreaterThanOrEqual(activeCount);
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  // **Feature: factory-task-tracker, Property 10: Declining completion keeps task active**
  describe('Property 10: Declining completion keeps task active', () => {
    it('*For any* task at target count, declining completion SHALL keep isCompleted=false', () => {
      fc.assert(
        fc.property(
          taskAtTargetCount,
          (task) => {
            const declinedTask = declineCompletion(task);
            
            // Property: isCompleted SHALL remain false after decline
            expect(declinedTask.isCompleted).toBe(false);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('*For any* task at target count, declining completion SHALL preserve all task properties', () => {
      fc.assert(
        fc.property(
          taskAtTargetCount,
          (task) => {
            const declinedTask = declineCompletion(task);
            
            // Property: all properties SHALL be preserved
            expect(declinedTask.id).toBe(task.id);
            expect(declinedTask.name).toBe(task.name);
            expect(declinedTask.executionCount).toBe(task.executionCount);
            expect(declinedTask.targetCount).toBe(task.targetCount);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('*For any* declined task, sorting SHALL keep it in active section', () => {
      // Generate a mix of completed tasks and one task to decline
      const mixedTasksWithDecline = fc.tuple(
        fc.array(completedTask, { minLength: 1, maxLength: 10 }),
        taskAtTargetCount
      );

      fc.assert(
        fc.property(
          mixedTasksWithDecline,
          ([completedTasks, taskToDecline]) => {
            // Decline completion on the task
            const declinedTask = declineCompletion(taskToDecline);
            
            // Create task list with the declined task
            const allTasks = [...completedTasks, declinedTask];
            const sorted = sortTasks(allTasks);
            
            // Property: declined task SHALL appear before all completed tasks
            const declinedIndex = sorted.findIndex(t => t.id === declinedTask.id);
            const firstCompletedIndex = sorted.findIndex(t => t.isCompleted);
            
            // Declined task should be at index 0 (before completed tasks)
            expect(declinedIndex).toBe(0);
            if (firstCompletedIndex !== -1) {
              expect(declinedIndex).toBeLessThan(firstCompletedIndex);
            }
          }
        ),
        { numRuns: 100 }
      );
    });
  });
});
