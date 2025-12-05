/**
 * Property-Based Tests for Credential Validation
 * Tests universal properties that should hold across all inputs
 * Requirements: 1.3
 */

import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { validateCredentials } from '../../validation.js';

describe('Credential Validation Property Tests', () => {
  // **Feature: factory-task-tracker, Property 3: Empty credentials are rejected before API call**
  describe('Property 3: Empty credentials are rejected before API call', () => {
    it('*For any* credentials where email is empty or whitespace-only, the validation function SHALL return false', () => {
      // Generator for whitespace-only strings
      const whitespaceString = fc.array(
        fc.constantFrom(' ', '\t', '\n', '\r'),
        { minLength: 0, maxLength: 10 }
      ).map(arr => arr.join(''));

      fc.assert(
        fc.property(
          // Generate empty or whitespace-only strings for email
          whitespaceString,
          // Generate any password (valid or invalid)
          fc.string(),
          (emptyEmail, password) => {
            const result = validateCredentials(emptyEmail, password);
            
            // Property: validation SHALL return false (isValid = false)
            expect(result.isValid).toBe(false);
            
            // Property: email error SHALL be present
            expect(result.errors.email).toBeDefined();
            expect(result.errors.email).toBe('Email or Employee ID is required');
          }
        ),
        { numRuns: 100 }
      );
    });

    it('*For any* credentials where password is empty or whitespace-only, the validation function SHALL return false', () => {
      // Generator for whitespace-only strings
      const whitespaceString = fc.array(
        fc.constantFrom(' ', '\t', '\n', '\r'),
        { minLength: 0, maxLength: 10 }
      ).map(arr => arr.join(''));

      fc.assert(
        fc.property(
          // Generate any email (valid or invalid)
          fc.string(),
          // Generate empty or whitespace-only strings for password
          whitespaceString,
          (email, emptyPassword) => {
            const result = validateCredentials(email, emptyPassword);
            
            // Property: validation SHALL return false (isValid = false)
            expect(result.isValid).toBe(false);
            
            // Property: password error SHALL be present
            expect(result.errors.password).toBeDefined();
            expect(result.errors.password).toBe('Password is required');
          }
        ),
        { numRuns: 100 }
      );
    });

    it('*For any* credentials where both email and password are empty or whitespace-only, the validation function SHALL return false with both errors', () => {
      // Generator for whitespace-only strings
      const whitespaceString = fc.array(
        fc.constantFrom(' ', '\t', '\n', '\r'),
        { minLength: 0, maxLength: 10 }
      ).map(arr => arr.join(''));

      fc.assert(
        fc.property(
          whitespaceString,
          whitespaceString,
          (emptyEmail, emptyPassword) => {
            const result = validateCredentials(emptyEmail, emptyPassword);
            
            // Property: validation SHALL return false
            expect(result.isValid).toBe(false);
            
            // Property: both errors SHALL be present
            expect(result.errors.email).toBeDefined();
            expect(result.errors.password).toBeDefined();
          }
        ),
        { numRuns: 100 }
      );
    });

    it('*For any* credentials where both email and password are non-empty and non-whitespace, the validation function SHALL return true', () => {
      fc.assert(
        fc.property(
          // Generate non-empty strings with at least one non-whitespace character
          fc.string({ minLength: 1 }).filter(s => s.trim().length > 0),
          fc.string({ minLength: 1 }).filter(s => s.trim().length > 0),
          (validEmail, validPassword) => {
            const result = validateCredentials(validEmail, validPassword);
            
            // Property: validation SHALL return true (isValid = true)
            expect(result.isValid).toBe(true);
            
            // Property: no errors SHALL be present
            expect(Object.keys(result.errors).length).toBe(0);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('*For any* null or undefined email, the validation function SHALL return false', () => {
      fc.assert(
        fc.property(
          fc.oneof(fc.constant(null), fc.constant(undefined)),
          fc.string(),
          (nullEmail, password) => {
            const result = validateCredentials(nullEmail, password);
            
            expect(result.isValid).toBe(false);
            expect(result.errors.email).toBe('Email or Employee ID is required');
          }
        ),
        { numRuns: 100 }
      );
    });

    it('*For any* null or undefined password, the validation function SHALL return false', () => {
      fc.assert(
        fc.property(
          fc.string(),
          fc.oneof(fc.constant(null), fc.constant(undefined)),
          (email, nullPassword) => {
            const result = validateCredentials(email, nullPassword);
            
            expect(result.isValid).toBe(false);
            expect(result.errors.password).toBe('Password is required');
          }
        ),
        { numRuns: 100 }
      );
    });
  });
});
