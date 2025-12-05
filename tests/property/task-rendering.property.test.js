/**
 * Property-Based Tests for Task Card Rendering
 * Tests universal properties that should hold across all inputs
 * Requirements: 2.2, 2.3
 */

import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { renderTaskCard } from '../../task-utils.js';

// Generator for valid task objects
const taskArbitrary = fc.record({
  id: fc.string({ minLength: 1 }),
  name: fc.string({ minLength: 1 }),
  executionCount: fc.nat({ max: 1000 }),
  targetCount: fc.integer({ min: 1, max: 1000 }),
  isCompleted: fc.boolean()
}).filter(task => task.executionCount <= task.targetCount);

describe('Task Card Rendering Property Tests', () => {
  // **Feature: factory-task-tracker, Property 4: Task card rendering contains required information**
  describe('Property 4: Task card rendering contains required information', () => {
    it('*For any* active task, the rendered card SHALL contain the task name', () => {
      fc.assert(
        fc.property(
          taskArbitrary.filter(t => !t.isCompleted),
          (task) => {
            const html = renderTaskCard(task, false);
            
            // Property: rendered output SHALL contain the task name
            expect(html).toContain(task.name);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('*For any* active task, the rendered card SHALL display execution count and target count in "X / Y" format', () => {
      fc.assert(
        fc.property(
          taskArbitrary.filter(t => !t.isCompleted),
          (task) => {
            const html = renderTaskCard(task, false);
            
            // Property: rendered output SHALL contain "X / Y" format
            const expectedFormat = `${task.executionCount} / ${task.targetCount}`;
            expect(html).toContain(expectedFormat);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('*For any* active task, the progress bar width SHALL equal (executionCount / targetCount) * 100 percent', () => {
      fc.assert(
        fc.property(
          taskArbitrary.filter(t => !t.isCompleted && t.targetCount > 0),
          (task) => {
            const html = renderTaskCard(task, false);
            
            // Calculate expected progress percentage
            const expectedProgress = (task.executionCount / task.targetCount) * 100;
            
            // Property: progress bar width SHALL equal calculated percentage
            expect(html).toContain(`width: ${expectedProgress}%`);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('*For any* completed task, the rendered card SHALL contain the task name', () => {
      fc.assert(
        fc.property(
          taskArbitrary,
          (task) => {
            const html = renderTaskCard(task, true);
            
            // Property: rendered output SHALL contain the task name
            expect(html).toContain(task.name);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('*For any* completed task, the progress bar SHALL be at 100%', () => {
      fc.assert(
        fc.property(
          taskArbitrary,
          (task) => {
            const html = renderTaskCard(task, true);
            
            // Property: completed task progress bar SHALL be 100%
            expect(html).toContain('width: 100%');
          }
        ),
        { numRuns: 100 }
      );
    });

    it('*For any* completed task, the card SHALL contain a checkmark icon', () => {
      fc.assert(
        fc.property(
          taskArbitrary,
          (task) => {
            const html = renderTaskCard(task, true);
            
            // Property: completed task SHALL have check_circle icon
            expect(html).toContain('check_circle');
          }
        ),
        { numRuns: 100 }
      );
    });

    it('*For any* task with targetCount of 0, the progress SHALL be 0%', () => {
      const zeroTargetTask = fc.record({
        id: fc.string({ minLength: 1 }),
        name: fc.string({ minLength: 1 }),
        executionCount: fc.constant(0),
        targetCount: fc.constant(0),
        isCompleted: fc.boolean()
      });

      fc.assert(
        fc.property(
          zeroTargetTask,
          (task) => {
            const html = renderTaskCard(task, false);
            
            // Property: progress SHALL be 0% when targetCount is 0
            expect(html).toContain('width: 0%');
          }
        ),
        { numRuns: 100 }
      );
    });
  });
});
