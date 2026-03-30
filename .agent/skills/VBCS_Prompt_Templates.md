# VBCS Redwood Application Prompt Templates

Use these prompt structures to efficiently guide the AI in creating, updating, or debugging your VBCS Redwood application.

---

## 1. CREATE: New Page Template
**Use this** when adding a new screen to your application.

> **Subject:** Create New Page: `[Page Title]`
>
> **Objective:** Create a new page in the `main` flow.
>
> **Page Details:**
> *   **ID:** `main-[page-name]-page` (e.g., `main-documents-page`)
> *   **Title:** "[User Facing Title]"
> *   **Layout:** [e.g., Redwood Welcome Page `oj-sp-welcome-page`, Dashboard, or Standard 1-Column]
>
> **Content & Components:**
> *   **Header:** Include [Buttons/Search/Filters]
> *   **Main Area:** [e.g., Card View `oj-c-card-view` OR Table `oj-table`]
> *   **Data:** Create a variable variable `[variableName]` with mock data containing fields: `[id, name, status, date, etc.]`.
>
> **Navigation:**
> *   Add this page to the sidebar navigation list with key `[key-name]` and icon `[icon-class]`.

---

## 2. UPDATE: UI Modification Template
**Use this** when changing the look, layout, or style of an existing page.

> **Subject:** Update `[Page Name]` UI
>
> **Target Page:** `[filename].html`
>
> **Request:**
> I need to modify the **[Specific Component, e.g., Project Card]**.
>
> **Current State:**
> [Describe how it looks now, e.g., "The card currently shows 3 lines of text."]
>
> **Desired State:**
> [Describe the exact change, e.g., "Split the 2nd line into two separate lines. Line 2 should show Dates, Line 3 should show Stats."]
>
> **Specific Constraints:**
> *   [e.g., "Use the `secondary-text-line2` attribute."]
> *   [e.g., "Set the border width to 4px."]

---

## 3. ADD: Logic & Dialogs Template
**Use this** for adding interactivity, buttons, dialogs, or action chains.

> **Subject:** Add `[Action Name]` Functionality to `[Page Name]`
>
> **Objective:** Implement the logic for `[Describe Feature]`.
>
> **Requirements:**
> 1.  **Trigger:** When the user clicks the `[Button Name]` button...
> 2.  **Action:** Open a dialog named `[dialogID]`.
> 3.  **Dialog Content:**
>     *   Title: `[Dialog Title]`
>     *   Form Fields: `[List input fields: ID, Name, Dropdown options]`
>     *   Buttons: "Cancel" and "`[Main Action]`"
> 4.  **Logic:**
>     *   On "`[Main Action]`" click, validate fields.
>     *   If valid, close the dialog.
>     *   Fire a 'Success' notification using `Actions.fireNotification`.

---

## 4. DEBUG: Error Fixing Template
**Use this** when the application is failing or throwing errors.

> **Subject:** Fix Error in `[Page/Chain Name]`
>
> **The Issue:**
> When I `[perform action, e.g., "click the Save button"]`, nothing happens / I get an error.
>
> **Error Message:**
> ```
> [Paste the console error log here]
> ```
>
> **Context:**
> I recently changed `[mention recent changes]`.
>
> **Goal:** Resolve the error and ensure the action completes successfully without crashing.

---

## 5. GENERAL: Master Re-Creation (For Context)
**Use this** if you need to restart or explain the app to a new agent.

> **Context:**
> This is a VBCS Redwood application using Oracle JET components.
> It has a Shell usage `oj-navigation-list`.
> Pages use Redwood templates (`oj-sp-welcome-page`, `oj-sp-general-overview-page`).
> We use standard JS VBCS Action Chains for logic (NO JSON declarative chains).
> **Constraint:** All Success/Error notifications MUST use `Actions.fireNotificationEvent`.
> **Reference:** Follow `VBCS_Validation_Checklist.md` at all times.

---

## 6. DEVELOPMENT: Architectural Requirements
**Use this** when directing the AI to handle complex logic, datasets, or UI polish.

> **Subject:** Implement `[Feature Name]` following VBCS Best Practices
>
> **Requirements:**
> 1.  **Logic Separation:** Place all complex array mapping/filtering inside `$page.functions.[functionName]()` in `[pageName].js`. Keep the Action Chain minimal.
> 2.  **Pagination:** If hitting an endpoint that returns `{ "items": [], "totalPages": n }` or uses limit offsets, build a `do...while` loop in the Action Chain to grab all pages.
> 3.  **UI Feedback:** 
>     *   Add `isFetching... = true/false` logic.
>     *   Wrap `<oj-progress-circle>` in `<oj-bind-if>` for loading indicators.
>     *   Provide `<template slot="noData">` for any `<oj-select-single>` or `<oj-table>` components.
> 4.  **Error Handling:** Catch all faults. Explicitly ignore network aborts (`err.name === 'AbortError'`) inside `catch` blocks instead of spamming UI errors.

