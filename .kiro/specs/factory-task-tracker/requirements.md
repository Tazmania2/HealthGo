# Requirements Document

## Introduction

A headless web application for factory/production workers to track and execute repetitive tasks. The app connects to the G4U API (https://g4u-mvp-api.onrender.com/) for authentication and task management. Workers log in, view their assigned tasks as cards, and track execution counts with simple tap/swipe interactions. The UI follows the provided dark-themed factory management design.

## Glossary

- **Task**: A work item assigned to a user with a target execution count
- **Execution Count**: The number of times a task has been performed
- **Target Count**: The required number of times a task must be executed to be considered complete
- **Task Card**: A UI component displaying task name, progress, and execution controls
- **G4U API**: The backend REST API at https://g4u-mvp-api.onrender.com/ providing authentication and task data
- **Completed Task**: A task where execution count equals target count and user has confirmed completion

## Requirements

### Requirement 1

**User Story:** As a factory worker, I want to log in with my credentials, so that I can access my assigned tasks securely.

#### Acceptance Criteria

1. WHEN a user enters valid email/employee ID and password and clicks the login button THEN the System SHALL authenticate against the G4U API and navigate to the task list screen
2. WHEN a user enters invalid credentials and clicks the login button THEN the System SHALL display an error message and remain on the login screen
3. WHEN a user submits empty credentials THEN the System SHALL prevent submission and display validation feedback
4. WHILE a login request is in progress THEN the System SHALL display a loading indicator on the login button

### Requirement 2

**User Story:** As a factory worker, I want to view my assigned tasks as cards, so that I can see what work needs to be done today.

#### Acceptance Criteria

1. WHEN the task list screen loads THEN the System SHALL fetch tasks from the G4U API and display each task as a card
2. WHEN displaying a task card THEN the System SHALL show the task name, current execution count, and target count in the format "X / Y"
3. WHEN displaying a task card THEN the System SHALL show a progress bar reflecting the percentage of completions (execution count / target count)
4. WHEN tasks are fetched THEN the System SHALL display active tasks at the top and completed tasks at the bottom in a separate "Completed" section
5. WHEN the user taps the refresh button THEN the System SHALL re-fetch tasks from the G4U API and update the display

### Requirement 3

**User Story:** As a factory worker, I want to register task executions by tapping, so that I can track my progress quickly.

#### Acceptance Criteria

1. WHEN a user taps/clicks on an active task card THEN the System SHALL increment the execution count by one and update the display
2. WHEN a user swipes right-to-left on a task card THEN the System SHALL decrement the execution count by one (minimum zero) and update the display
3. WHEN the execution count changes THEN the System SHALL persist the updated count to the G4U API
4. WHEN the execution count changes THEN the System SHALL update the progress bar to reflect the new percentage

### Requirement 4

**User Story:** As a factory worker, I want to confirm task completion, so that completed tasks are clearly distinguished from active ones.

#### Acceptance Criteria

1. WHEN the execution count reaches the target count THEN the System SHALL display a confirmation prompt asking "Task completed?"
2. WHEN the user confirms completion THEN the System SHALL mark the task as completed, gray out the card, and relocate it to the end of the list in the "Completed" section
3. WHEN the user declines completion THEN the System SHALL keep the task in the active section and allow further interaction
4. WHEN displaying a completed task THEN the System SHALL show the card with reduced opacity, strikethrough text, and a green checkmark icon

### Requirement 5

**User Story:** As a factory worker, I want the app to work reliably, so that my task progress is never lost.

#### Acceptance Criteria

1. WHEN an API request fails THEN the System SHALL display an error message and allow the user to retry
2. WHEN the app loses network connectivity THEN the System SHALL notify the user and queue changes for sync when connectivity returns
3. WHEN the user logs out or the session expires THEN the System SHALL redirect to the login screen
