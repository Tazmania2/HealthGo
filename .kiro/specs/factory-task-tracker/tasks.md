# Implementation Plan

- [x] 1. Set up project structure and base HTML





  - [x] 1.1 Create index.html with Tailwind CDN, Inter font, Material Symbols, and base dark theme structure


    - Set up HTML boilerplate matching the reference design
    - Include all required CDN links and Tailwind config
    - _Requirements: 2.1_

  - [x] 1.2 Create app.js with module structure for API client, state manager, and UI controller

    - Define module skeleton with exports
    - Set up event listener initialization
    - _Requirements: 2.1_

- [x] 2. Implement API Client module



  - [x] 2.1 Implement login function that authenticates against G4U API

    - POST to /auth/login with email and password
    - Return token and user on success, throw on failure
    - _Requirements: 1.1, 1.2_

  - [x] 2.2 Implement getTasks function to fetch user's tasks
    - GET from /tasks with auth header
    - Parse and return task array
    - _Requirements: 2.1_

  - [x] 2.3 Implement updateTaskExecution function to persist count changes
    - PATCH to /tasks/:id with new executionCount

    - _Requirements: 3.3_
  - [x] 2.4 Implement markTaskComplete function
    - PATCH to /tasks/:id with isCompleted=true
    - _Requirements: 4.2_
  - [x] 2.5 Write unit tests for API client functions



    - Test login success/failure scenarios
    - Test task fetch and update operations
    - _Requirements: 1.1, 1.2, 2.1, 3.3_

- [x] 3. Implement State Manager





  - [x] 3.1 Create state manager with initial state and setState/getState methods

    - Define AppState interface with isAuthenticated, user, tasks, isLoading, error
    - Implement immutable state updates
    - _Requirements: 1.4, 5.1_

  - [x] 3.2 Implement subscribe/notify pattern for UI updates

    - Allow UI to subscribe to state changes
    - Notify all subscribers when state changes
    - _Requirements: 2.1_
  - [x] 3.3 Write property test for state manager


    - **Property 11: API errors set error state**
    - **Validates: Requirements 5.1**
  - [x] 3.4 Write property test for logout

    - **Property 12: Logout resets to unauthenticated state**
    - **Validates: Requirements 5.3**

- [x] 4. Implement Login Screen UI


  - [x] 4.1 Create login form HTML matching reference design


    - Email/Employee ID input field
    - Password input with visibility toggle
    - Login button with loading state
    - Error message display area
    - _Requirements: 1.1, 1.2, 1.3_

  - [x] 4.2 Implement credential validation logic
    - Validate non-empty email and password before submission
    - Display validation errors inline
    - _Requirements: 1.3_
  - [x] 4.3 Write property test for credential validation


    - **Property 3: Empty credentials are rejected before API call**
    - **Validates: Requirements 1.3**
  - [x] 4.4 Implement login form submission handler



    - Call API client login on submit
    - Update state with result (success or error)
    - Navigate to task list on success
    - _Requirements: 1.1, 1.2, 1.4_

- [x] 5. Checkpoint - Ensure login flow works




  - Ensure all tests pass, ask the user if questions arise.
-

- [x] 6. Implement Task List Screen UI


  - [x] 6.1 Create task list HTML structure matching reference design


    - Header with title and refresh button
    - Active tasks section container
    - "Completed" section header
    - Completed tasks section container
    - _Requirements: 2.1, 2.4_


  - [x] 6.2 Implement task card rendering function
    - Render task name, "X / Y" progress text, and progress bar
    - Calculate progress bar width as percentage

    - _Requirements: 2.2, 2.3_
  - [x] 6.3 Write property test for task card rendering

    - **Property 4: Task card rendering contains required information**
    - **Validates: Requirements 2.2, 2.3**
  - [x] 6.4 Implement task sorting logic (active first, completed last)


    - Sort tasks array with isCompleted=false before isCompleted=true
    - _Requirements: 2.4_

  - [x] 6.5 Write property test for task sorting

    - **Property 5: Tasks are sorted with active before completed**
    - **Validates: Requirements 2.4**



  - [x] 6.6 Implement refresh button handler
    - Re-fetch tasks from API on click


    - Update state and re-render


    - _Requirements: 2.5_

- [x] 7. Implement Task Interaction Logic





  - [x] 7.1 Implement tap/click handler to increment execution count
    - Increment executionCount by 1 on tap
    - Cap at targetCount


    - Update state and persist to API




    - _Requirements: 3.1_
  - [x] 7.2 Write property test for increment

    - **Property 6: Increment increases execution count by exactly one**
    - **Validates: Requirements 3.1**
  - [x] 7.3 Implement swipe-left handler to decrement execution count
    - Detect right-to-left swipe gesture
    - Decrement executionCount by 1, minimum 0
    - Update state and persist to API
    - _Requirements: 3.2_
  - [x] 7.4 Write property test for decrement
    - **Property 7: Decrement decreases execution count with floor at zero**
    - **Validates: Requirements 3.2**

- [x] 8. Implement Completion Flow

  - [x] 8.1 Implement completion detection and prompt trigger
    - Check if executionCount equals targetCount after increment
    - Show confirmation modal when condition met
    - _Requirements: 4.1_
  - [x] 8.2 Write property test for completion trigger

    - **Property 8: Completion prompt triggers at target count**
    - **Validates: Requirements 4.1**

  - [x] 8.3 Create completion confirmation modal UI

    - "Task completed?" prompt text
    - Yes and No buttons
    - Backdrop overlay
    - _Requirements: 4.1, 4.2, 4.3_

  - [x] 8.4 Implement confirm completion handler

    - Set isCompleted=true on task
    - Persist to API
    - Re-sort and re-render task list
    - _Requirements: 4.2_

  - [x] 8.5 Write property test for completion confirmation

    - **Property 9: Confirming completion marks task complete and reorders**
    - **Validates: Requirements 4.2**
  - [x] 8.6 Implement decline completion handler


    - Close modal without changing task state
    - Task remains in active section
    - _Requirements: 4.3_

  - [x] 8.7 Write property test for decline completion


    - **Property 10: Declining completion keeps task active**
    - **Validates: Requirements 4.3**

- [x] 9. Implement Completed Task Styling





  - [x] 9.1 Apply completed task card styles

    - Reduced opacity (50%)
    - Strikethrough on task name
    - Green checkmark icon instead of progress text
    - Green progress bar at 100%
    - _Requirements: 4.4_

- [x] 10. Implement Error Handling






  - [x] 10.1 Add error display component and toast notifications

    - Show error messages from state
    - Auto-dismiss after 5 seconds
    - _Requirements: 5.1_

  - [x] 10.2 Implement session expiry handling

    - Detect 401 responses
    - Clear auth state and redirect to login
    - _Requirements: 5.3_

- [-] 11. Final Checkpoint - Ensure all tests pass



  - Ensure all tests pass, ask the user if questions arise.
  - Configure Git
  - Configure vercel and vercel.json
