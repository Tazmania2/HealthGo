# Implementation Plan: Task Priority Sorting

## Overview

Add priority-based sorting and visual indicators to the Factory Task Tracker. This involves parsing priority from API comments, updating the sort function, and adding colored borders to task cards.

## Tasks

- [x] 1. Implement priority parsing function
  - Add `extractPriority(comments)` function to `task-utils.js`
  - Parse "PRIORITY:X" pattern from comments array
  - Return first match, default to 10 if not found
  - Clamp values to 1-10 range
  - _Requirements: 3.1, 3.2, 3.3, 3.4_

- [x] 1.1 Write property test for priority parsing
  - **Property 5: Priority parsing from comments**
  - **Property 6: Priority clamping**
  - **Property 7: Default priority for missing comments**
  - **Validates: Requirements 3.1, 3.2, 3.3, 3.4**

- [x] 2. Implement priority color mapping function
  - Add `getPriorityBorderColor(priority)` function to `task-utils.js`
  - Return `border-l-red-500` for priority 1-3
  - Return `border-l-yellow-500` for priority 4-7
  - Return `border-l-blue-500` for priority 8-10
  - _Requirements: 2.2, 2.3, 2.4, 2.5_

- [x] 2.1 Write property test for priority color mapping
  - **Property 4: Priority-to-color mapping**
  - **Validates: Requirements 2.1, 2.2, 2.3, 2.4, 2.5**

- [x] 3. Update sortTasks function for priority sorting
  - Modify `sortTasks()` in `task-utils.js`
  - Sort active tasks by priority ascending (1 first, 10 last)
  - Keep completed tasks at end regardless of priority
  - Ensure stable sort for equal priorities
  - _Requirements: 1.1, 1.3, 1.4_

- [x] 3.1 Write property test for priority sorting
  - **Property 1: Priority sorting order**
  - **Property 2: Stable sort for equal priorities**
  - **Property 3: Completed tasks remain separate**
  - **Validates: Requirements 1.1, 1.3, 1.4**

- [x] 4. Update renderTaskCard for priority borders
  - Modify `renderTaskCard()` in `task-utils.js`
  - Add left border with priority color class
  - Add `border-l-4` for border width
  - Only apply to active (non-completed) task cards
  - _Requirements: 2.1_

- [x] 5. Update API client to extract priority during task transformation
  - Modify task transformation in `api-client.js`
  - Call `extractPriority()` on action comments
  - Add `priority` field to transformed task objects
  - _Requirements: 3.1_

- [x] 6. Checkpoint - Ensure all tests pass
  - Run `npm test` to verify all unit and property tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- All tasks including property tests are required
- Each task references specific requirements for traceability
- Property tests validate universal correctness properties
- The existing `sortTasks` function needs modification, not replacement
