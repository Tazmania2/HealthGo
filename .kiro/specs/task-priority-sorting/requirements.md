# Requirements Document

## Introduction

Enhancement to the Factory Task Tracker that adds priority-based sorting and visual indicators for tasks. Priority is extracted from the `comments` array in the G4U API response, where each action may contain a `PRIORITY:X` comment (1 = highest priority, 10 = lowest priority). Tasks are sorted by priority and display colored borders to indicate urgency level.

## Glossary

- **Priority**: A numeric value (1-10) indicating task urgency, where 1 is highest priority and 10 is lowest
- **Priority_Comment**: A string in the format "PRIORITY:X" found in the comments array of an action
- **Priority_Color**: A visual indicator color ranging from red (high priority) to blue (low priority)
- **Task_Card**: A UI component displaying task information with priority-based border styling
- **Action**: An individual task instance from the G4U API containing status, comments, and other metadata

## Requirements

### Requirement 1

**User Story:** As a factory worker, I want tasks sorted by priority, so that I can focus on the most urgent work first.

#### Acceptance Criteria

1. WHEN tasks are displayed THEN the System SHALL sort active tasks by priority in ascending order (priority 1 first, priority 10 last)
2. WHEN a task has no priority comment THEN the System SHALL treat it as lowest priority (10)
3. WHEN multiple tasks have the same priority THEN the System SHALL maintain their relative order (stable sort)
4. WHEN tasks are sorted THEN the System SHALL keep completed tasks in the "Completed" section regardless of priority

### Requirement 2

**User Story:** As a factory worker, I want to see visual priority indicators on task cards, so that I can quickly identify high-priority tasks.

#### Acceptance Criteria

1. WHEN displaying an active task card THEN the System SHALL show a colored left border indicating priority level
2. WHEN a task has priority 1-3 (high) THEN the System SHALL display a red border color
3. WHEN a task has priority 4-7 (medium) THEN the System SHALL display a yellow/orange border color
4. WHEN a task has priority 8-10 (low) THEN the System SHALL display a blue border color
5. WHEN a task has no priority THEN the System SHALL display a blue border color (lowest priority)

### Requirement 3

**User Story:** As a factory worker, I want priority information extracted reliably from task data, so that sorting and display are accurate.

#### Acceptance Criteria

1. WHEN parsing task comments THEN the System SHALL extract priority from the first "PRIORITY:X" pattern found
2. WHEN the priority value is outside 1-10 range THEN the System SHALL clamp it to the valid range (1-10)
3. WHEN the comments array is empty or missing THEN the System SHALL default to priority 10
4. WHEN multiple PRIORITY comments exist THEN the System SHALL use the first one found
