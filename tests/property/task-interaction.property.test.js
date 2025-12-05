/**
 * Property-Based Tests for Task Interaction (Increment/Decrement)
 * Tests universal properties that should hold across all inputs
 * Requirements: 3.1, 3.2
 */

import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { incrementExecutionCount, decrementExecutionCount } from '../../task-utils.js';

// Generator for valid active task objects (not completed)
const activeTaskArbitrary = fc.record({
  id: fc.string({ minLength: 1 }),
  name: fc.string({ minLength: 1 }),
  executionCount: fc.nat({ max: 999 }),
  targetCount: fc.integer({ min: 1, max: 1000 }),
  isCompleted: fc.constant(false)
}).filter(task => task.executionCount <= task.targetCount);

// Generator for tasks at various execution states
const taskWithRoomToIncrement = fc.record({
  id: fc.string({ minLength: 1 }),
  name: fc.string({ minLength: 1 }),
  executionCount: fc.nat({ max: 998 }),
  targetCount: fc.integer({ min: 1, max: 1000 }),
  isCompleted: fc.constant(false)
}).filter(task => task.executionCount < task.targetCount);

// Generator for tasks at target count
const taskAtTargetCount = fc.integer({ min: 1, max: 1000 }).chain(target =>
  fc.record({
    id: fc.string({ minLength: 1 }),
    name: fc.string({ minLength: 1 }),
    executionCount: fc.constant(target),
    targetCount: fc.constant(target),
    isCompleted: fc.constant(false)
  })
);

// Generator for tasks with execution count > 0
const taskWithPositiveCount = fc.record({
  id: fc.string({ minLength: 1 }),
  name: fc.string({ minLength: 1 }),
  executionCount: fc.integer({ min: 1, max: 1000 }),
  targetCount: fc.integer({ min: 1, max: 1000 }),
  isCompleted: fc.constant(false)
}).filter(task => task.executionCount <= task.targetCount);

// Generator for tasks with execution count = 0
const taskAtZeroCount = fc.record({
  id: fc.string({ minLength: 1 }),
  name: fc.string({ minLength: 1 }),
  executionCount: fc.constant(0),
  targetCount: fc.integer({ min: 1, max: 1000 }),
  isCompleted: fc.constant(false)
});

describe('Task Interaction Property Tests', () => {
  // **Feature: factory-task-tracker, Property 6: Increment increases execution count by exactly one**
  describe('Property 6: Increment increases execution count by exactly one', () => {

    it('*For any* active task with room to increment, incrementing SHALL increase executionCount by exactly 1', () => {
      fc.assert(
        fc.property(
          taskWithRoomToIncrement,
          (task) => {
            const originalCount = task.executionCount;
            const newCount = incrementExecutionCount(task);
            
            // Property: new count SHALL be exactly 1 more than original
            expect(newCount).toBe(originalCount + 1);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('*For any* active task at target count, incrementing SHALL NOT exceed targetCount', () => {
      fc.assert(
        fc.property(
          taskAtTargetCount,
          (task) => {
            const newCount = incrementExecutionCount(task);
            
            // Property: new count SHALL not exceed targetCount
            expect(newCount).toBeLessThanOrEqual(task.targetCount);
            // Property: count should remain at target (capped)
            expect(newCount).toBe(task.targetCount);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('*For any* active task, incrementing SHALL result in count <= targetCount', () => {
      fc.assert(
        fc.property(
          activeTaskArbitrary,
          (task) => {
            const newCount = incrementExecutionCount(task);
            
            // Property: new count SHALL never exceed targetCount
            expect(newCount).toBeLessThanOrEqual(task.targetCount);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('*For any* completed task, incrementing SHALL NOT change the execution count', () => {
      const completedTask = fc.record({
        id: fc.string({ minLength: 1 }),
        name: fc.string({ minLength: 1 }),
        executionCount: fc.nat({ max: 1000 }),
        targetCount: fc.integer({ min: 1, max: 1000 }),
        isCompleted: fc.constant(true)
      }).filter(task => task.executionCount <= task.targetCount);

      fc.assert(
        fc.property(
          completedTask,
          (task) => {
            const originalCount = task.executionCount;
            const newCount = incrementExecutionCount(task);
            
            // Property: completed tasks SHALL not be modified
            expect(newCount).toBe(originalCount);
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  // **Feature: factory-task-tracker, Property 7: Decrement decreases execution count with floor at zero**
  describe('Property 7: Decrement decreases execution count with floor at zero', () => {
    it('*For any* task with executionCount > 0, decrementing SHALL decrease executionCount by exactly 1', () => {
      fc.assert(
        fc.property(
          taskWithPositiveCount,
          (task) => {
            const originalCount = task.executionCount;
            const newCount = decrementExecutionCount(task);
            
            // Property: new count SHALL be exactly 1 less than original
            expect(newCount).toBe(originalCount - 1);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('*For any* task with executionCount = 0, decrementing SHALL keep executionCount at 0', () => {
      fc.assert(
        fc.property(
          taskAtZeroCount,
          (task) => {
            const newCount = decrementExecutionCount(task);
            
            // Property: count SHALL remain at 0 (floored)
            expect(newCount).toBe(0);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('*For any* task, decrementing SHALL result in count >= 0', () => {
      fc.assert(
        fc.property(
          activeTaskArbitrary,
          (task) => {
            const newCount = decrementExecutionCount(task);
            
            // Property: new count SHALL never be negative
            expect(newCount).toBeGreaterThanOrEqual(0);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('*For any* completed task, decrementing SHALL NOT change the execution count', () => {
      const completedTask = fc.record({
        id: fc.string({ minLength: 1 }),
        name: fc.string({ minLength: 1 }),
        executionCount: fc.nat({ max: 1000 }),
        targetCount: fc.integer({ min: 1, max: 1000 }),
        isCompleted: fc.constant(true)
      }).filter(task => task.executionCount <= task.targetCount);

      fc.assert(
        fc.property(
          completedTask,
          (task) => {
            const originalCount = task.executionCount;
            const newCount = decrementExecutionCount(task);
            
            // Property: completed tasks SHALL not be modified
            expect(newCount).toBe(originalCount);
          }
        ),
        { numRuns: 100 }
      );
    });
  });
});
