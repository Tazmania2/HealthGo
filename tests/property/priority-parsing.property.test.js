/**
 * Property-Based Tests for Priority Parsing
 * Tests universal properties for extractPriority function
 * Requirements: 3.1, 3.2, 3.3, 3.4
 */

import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { extractPriority } from '../../task-utils.js';

// Generator for valid priority values (1-10)
const validPriorityArbitrary = fc.integer({ min: 1, max: 10 });

// Generator for out-of-range priority values
const outOfRangePriorityArbitrary = fc.oneof(
  fc.integer({ min: -100, max: 0 }),  // Below range
  fc.integer({ min: 11, max: 100 })   // Above range
);

// Generator for comments array with a PRIORITY pattern
const commentsWithPriorityArbitrary = (priority) => 
  fc.array(fc.string(), { minLength: 0, maxLength: 5 }).map(comments => {
    const insertIndex = Math.floor(Math.random() * (comments.length + 1));
    const newComments = [...comments];
    newComments.splice(insertIndex, 0, `PRIORITY:${priority}`);
    return newComments;
  });

// Generator for comments array without any PRIORITY pattern
const commentsWithoutPriorityArbitrary = fc.array(
  fc.string().filter(s => !s.toUpperCase().includes('PRIORITY:')),
  { minLength: 0, maxLength: 10 }
);

describe('Priority Parsing Property Tests', () => {
  // **Feature: task-priority-sorting, Property 5: Priority parsing from comments**
  describe('Property 5: Priority parsing from comments', () => {
    it('*For any* comments array containing "PRIORITY:X" pattern, the parser SHALL extract the numeric value from the first occurrence', () => {
      fc.assert(
        fc.property(
          validPriorityArbitrary,
          (priority) => {
            // Generate comments with the priority pattern
            const comments = [`PRIORITY:${priority}`];
            const result = extractPriority(comments);
            
            // Property: extracted priority SHALL equal the value in the pattern
            expect(result).toBe(priority);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('*For any* comments array with multiple PRIORITY patterns, the parser SHALL use the first one found', () => {
      fc.assert(
        fc.property(
          validPriorityArbitrary,
          validPriorityArbitrary,
          (firstPriority, secondPriority) => {
            const comments = [`PRIORITY:${firstPriority}`, `PRIORITY:${secondPriority}`];
            const result = extractPriority(comments);
            
            // Property: result SHALL equal the first priority value
            expect(result).toBe(firstPriority);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('*For any* comments array with PRIORITY pattern among other comments, the parser SHALL find and extract it', () => {
      fc.assert(
        fc.property(
          validPriorityArbitrary,
          fc.array(fc.string().filter(s => !s.toUpperCase().includes('PRIORITY:')), { minLength: 0, maxLength: 5 }),
          fc.nat({ max: 10 }),
          (priority, otherComments, insertPosition) => {
            // Insert PRIORITY comment at a random position
            const comments = [...otherComments];
            const pos = Math.min(insertPosition, comments.length);
            comments.splice(pos, 0, `PRIORITY:${priority}`);
            
            const result = extractPriority(comments);
            
            // Property: extracted priority SHALL equal the value in the pattern
            expect(result).toBe(priority);
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  // **Feature: task-priority-sorting, Property 6: Priority clamping**
  describe('Property 6: Priority clamping', () => {
    it('*For any* extracted priority value below 1, the parser SHALL clamp it to 1', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: -1000, max: 0 }),
          (belowRangePriority) => {
            const comments = [`PRIORITY:${belowRangePriority}`];
            const result = extractPriority(comments);
            
            // Property: result SHALL be clamped to 1
            expect(result).toBe(1);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('*For any* extracted priority value above 10, the parser SHALL clamp it to 10', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 11, max: 1000 }),
          (aboveRangePriority) => {
            const comments = [`PRIORITY:${aboveRangePriority}`];
            const result = extractPriority(comments);
            
            // Property: result SHALL be clamped to 10
            expect(result).toBe(10);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('*For any* valid priority value (1-10), the parser SHALL return it unchanged', () => {
      fc.assert(
        fc.property(
          validPriorityArbitrary,
          (validPriority) => {
            const comments = [`PRIORITY:${validPriority}`];
            const result = extractPriority(comments);
            
            // Property: valid priorities SHALL pass through unchanged
            expect(result).toBe(validPriority);
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  // **Feature: task-priority-sorting, Property 7: Default priority for missing comments**
  describe('Property 7: Default priority for missing comments', () => {
    it('*For any* empty comments array, the parser SHALL return priority 10', () => {
      const result = extractPriority([]);
      expect(result).toBe(10);
    });

    it('*For any* null or undefined comments, the parser SHALL return priority 10', () => {
      expect(extractPriority(null)).toBe(10);
      expect(extractPriority(undefined)).toBe(10);
    });

    it('*For any* comments array without PRIORITY pattern, the parser SHALL return priority 10', () => {
      fc.assert(
        fc.property(
          commentsWithoutPriorityArbitrary,
          (comments) => {
            const result = extractPriority(comments);
            
            // Property: result SHALL be default priority 10
            expect(result).toBe(10);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('*For any* non-array input, the parser SHALL return priority 10', () => {
      fc.assert(
        fc.property(
          fc.oneof(fc.string(), fc.integer(), fc.object()),
          (invalidInput) => {
            const result = extractPriority(invalidInput);
            
            // Property: result SHALL be default priority 10
            expect(result).toBe(10);
          }
        ),
        { numRuns: 100 }
      );
    });
  });
});
