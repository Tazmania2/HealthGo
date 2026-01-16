/**
 * Property-Based Tests for Priority Color Mapping
 * Tests universal properties for getPriorityBorderColor function
 * **Feature: task-priority-sorting, Property 4: Priority-to-color mapping**
 * **Validates: Requirements 2.1, 2.2, 2.3, 2.4, 2.5**
 */

import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { getPriorityBorderColor } from '../../task-utils.js';

// Generator for high priority values (1-3)
const highPriorityArbitrary = fc.integer({ min: 1, max: 3 });

// Generator for medium priority values (4-7)
const mediumPriorityArbitrary = fc.integer({ min: 4, max: 7 });

// Generator for low priority values (8-10)
const lowPriorityArbitrary = fc.integer({ min: 8, max: 10 });

// Generator for all valid priority values (1-10)
const validPriorityArbitrary = fc.integer({ min: 1, max: 10 });

describe('Priority Color Mapping Property Tests', () => {
  // **Feature: task-priority-sorting, Property 4: Priority-to-color mapping**
  describe('Property 4: Priority-to-color mapping', () => {
    it('*For any* priority value from 1-3 (high), the function SHALL return red border class', () => {
      fc.assert(
        fc.property(
          highPriorityArbitrary,
          (priority) => {
            const result = getPriorityBorderColor(priority);
            
            // Property: high priority (1-3) SHALL return red
            expect(result).toBe('border-l-red-500');
          }
        ),
        { numRuns: 100 }
      );
    });

    it('*For any* priority value from 4-7 (medium), the function SHALL return yellow border class', () => {
      fc.assert(
        fc.property(
          mediumPriorityArbitrary,
          (priority) => {
            const result = getPriorityBorderColor(priority);
            
            // Property: medium priority (4-7) SHALL return yellow
            expect(result).toBe('border-l-yellow-500');
          }
        ),
        { numRuns: 100 }
      );
    });

    it('*For any* priority value from 8-10 (low), the function SHALL return blue border class', () => {
      fc.assert(
        fc.property(
          lowPriorityArbitrary,
          (priority) => {
            const result = getPriorityBorderColor(priority);
            
            // Property: low priority (8-10) SHALL return blue
            expect(result).toBe('border-l-blue-500');
          }
        ),
        { numRuns: 100 }
      );
    });

    it('*For any* valid priority value (1-10), the function SHALL return one of the three valid color classes', () => {
      const validColors = ['border-l-red-500', 'border-l-yellow-500', 'border-l-blue-500'];
      
      fc.assert(
        fc.property(
          validPriorityArbitrary,
          (priority) => {
            const result = getPriorityBorderColor(priority);
            
            // Property: result SHALL be one of the valid color classes
            expect(validColors).toContain(result);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('*For any* task with no priority (default 10), the function SHALL return blue border class', () => {
      // Default priority is 10, which falls in low priority range
      const result = getPriorityBorderColor(10);
      
      // Property: default priority SHALL return blue
      expect(result).toBe('border-l-blue-500');
    });
  });
});
