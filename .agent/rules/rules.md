---
trigger: always_on
---

## Table of Contents
- [Introduction](#introduction)
- [Error Handling Strategy](#error-handling-strategy)
- [Component Implementation Rules](#component-implementation-rules)
- [Accessibility Standards](#accessibility-standards)
- [Data Binding Guidelines](#data-binding-guidelines)
- [Code Quality Standards](#code-quality-standards)
- [Pre-Deployment Checklist](#pre-deployment-checklist)
- [Quick Reference](#quick-reference)

---

## Introduction

This document serves as the Standard Operating Procedure (SOP) and Validation Checklist for all VBCS and Oracle JET application development. **All rules in this document must be validated before code delivery.**

---

## Error Handling Strategy

### 1.1 REST API Error Handling

**Mandatory Requirements:**
- ✓ Every REST action chain has a failure path defined
- ✓ Failure paths include Fire Notification action with error details
- ✓ Error messages are user-friendly (not technical jargon)
- ✓ HTTP status codes are handled explicitly (401, 403, 404, 500, etc.)
- ✓ Timeout scenarios include retry logic or user notification
- ✗ NO console.log used as the only error handling mechanism
- ✗ NO silent failures (user must see feedback)

### 1.2 Notification Standards

**oj-messages Component Implementation:**
- Error notifications use `type="error"`
- Success notifications use `type="confirmation"`
- Warning notifications use `type="warning"`
- All notifications have clear, actionable messages
- 
- **CRITICAL:** `displayMode: 'transient'` is ALWAYS included in Fire Notification action

**Notification Pattern Examples:**

| Type | Use Case | Message Pattern |
|------|----------|-----------------|
| error | REST failures, validation errors | "Failed to [action]: [reason]" |
| warning | Non-critical issues | "Warning: [issue] may cause [impact]" |
| info | Status updates, guidance | "[Action] in progress..." or "[Info]" |
| confirmation | Success notifications | "Successfully [completed action]" |

**Example Fire Notification Action:**
```json

 {   summary: 'Error',
     message: 'Failed to create task: ' + err.message,
     type: 'error',
     displayMode: 'transient'
 }
```

### 1.3 Input Validation

**Required Pattern:**
- ✓ All inputs validated BEFORE REST calls
- ✓ Validation failures show specific field-level errors
- ✓ Required fields are marked and enforced
- ✓ Data type validation (email, phone, date formats) is implemented

**Action Chain Pattern:**
```
Action Chain: saveDataChain
  → Validate Input Action
    → Success → Call REST: /api/save
      → Success → Fire Notification (confirmation)
        { severity: "confirmation", displayMode: "transient" }
      → Failure → Fire Notification (error + details)
        { severity: "error", displayMode: "transient" }
    → Failure → Fire Notification (validation error)
      { severity: "error", displayMode: "transient" }
```

### 1.4 JavaScript Module Error Handling

**Function Pattern:**
```javascript
PageModule.prototype.validateAndProcessData = function(data) {
  try {
    // Validation
    if (!data || !data.id) {
      return {
        success: false,
        error: "Invalid input: Missing required field 'id'"
      };
    }
    
    // Business logic
    const result = this.processData(data);
    return { success: true, data: result };
    
  } catch (error) {
    console.error("Error in validateAndProcessData:", error);
    return {
      success: false,
      error: error.message || "An unexpected error occurred"
    };
  }
};
```

### 1.5 Common Error Scenarios & Solutions

| Scenario | Solution |
|----------|----------|
| Network Timeout | Implement timeout handling. Show: "Request timed out. Please try again." |
| Unauthorized (401) | Redirect to login page or refresh authentication token |
| Forbidden (403) | Show access denied message with contact information |
| Not Found (404) | Verify endpoint URL. Display: "Resource not found" |
| Server Error (500) | Log full error details. Display: "Server error occurred. Please contact support." |
| Validation Failure | Highlight invalid fields with specific messages |

---

## Component Implementation Rules

### 2.1 Critical Syntax Rules

| Rule | ✗ Wrong | ✓ Correct |
|------|---------|-----------|
| oj-bind-text in buttons | `<oj-button><oj-bind-text/></oj-button>` | `<oj-button><span><oj-bind-text/></span></oj-button>` |
| Slot on conditionals | `<oj-bind-if slot="header">` | `<div slot="header"><oj-bind-if>...</oj-bind-if></div>` |
| Radioset direction | `direction="row"` | `class="oj-choice-direction-row"` |
| Boolean attributes | `modal="true"` | `modal` |

**Key Rules:**
- **NEVER** place `<oj-bind-text>` directly inside `<oj-button>` - always wrap in `<span>`
- **NEVER** apply `slot="..."` attribute directly to `<oj-bind-if>` or `<oj-bind-for-each>`
- **NEVER** use the `direction` attribute on radioset/checkboxset (it's obsolete)

### 2.2 Component Import Validation

**Every component used in HTML MUST have a corresponding import in the JSON configuration.**

| Component | Required Import Path |
|-----------|---------------------|
| `<oj-input-password>` | ojs/ojinputtext |
| `<oj-text-area>` | ojs/ojinputtext |
| `<oj-radioset>` | ojs/ojradioset |
| `<oj-checkboxset>` | ojs/ojcheckboxset |
| `<oj-switch>` | ojs/ojswitch |
| `<oj-popup>` | ojs/ojpopup |
| `<oj-dialog>` | ojs/ojdialog |
| `<oj-collapsible>` | ojs/ojcollapsible |

---

## Accessibility Standards

### NON-NEGOTIABLE: All applications must meet accessibility standards

**Input Labels:**
Every input component MUST have an associated text label:
- ✓ Visible label: `label-hint="Username"`
- ✓ Hidden label: `label-hint="Search"` + `label-edge="none"`
- ✓ Alternative: `aria-label="Search field"`
- ✗ NO LABEL AT ALL

**Other A11y Requirements:**
- Heading hierarchy is correct (no skipped levels: h1→h2→h3, not h1→h3)
- All icons have `aria-label` or are marked decorative (`aria-hidden="true"`)
- Focus indicators are visible and functional
- Color is not the only means of conveying information
- Form validation errors are announced to screen readers

---

## Data Binding Guidelines

| Binding Type | Syntax | Use Case |
|--------------|--------|----------|
| Read-only | `[[ expression ]]` | Display values, calculations, loop data |
| Read-write | `{{ expression }}` | Input fields ONLY (two-way binding) |

**Rules:**
- Verify `{{ }}` is used ONLY for input fields
- Verify `[[ ]]` is used for all read-only displays

---

## Code Quality Standards

### 5.1 Naming Conventions

| Item | Convention | Example |
|------|------------|---------|
| Variables | camelCase | selectedEmployee, isLoading |
| Types | PascalCase | EmployeeType, RestApiResponse |
| Action Chains | verbNounChain | saveUserChain, navigateToHomeChain |
| HTML IDs | kebab-case | btn-submit, user-form |

### 5.2 Redwood Design System

- Use Redwood CSS variables instead of hex codes: `var(--oj-core-bg-neutral-0)`
- Use spacing classes: `oj-sm-margin-2x` instead of custom CSS
- Start with Redwood page templates, not blank `<div>` structures
- Disable autofill for non-credential fields: `autocomplete="off"`
- For password fields: `autocomplete="new-password"`

### 5.3 Variable Scoping

- **Page Variables:** State specific to a single UI screen
- **Flow Variables:** State shared across a multi-step process
- **App Variables:** Global user session data, profile info, or app-wide settings

### 5.4 Action Chain Definition Format

**MANDATORY: All action chains MUST be defined in JavaScript (JSON) format only.**

Always define event listeners and action chain references in the JSON configuration file, not in visual designer.

**✓ Correct Format (JSON):**
```json
"closeCreateEligibility": {
    "chains": [
        {
            "chain": "closeCreateDialogChain"
        }
    ]
}
```

**Key Points:**
- Define all action chains in the page/fragment JSON file
- Use the `chains` array to reference action chain names
- Chain names should follow the `verbNounChain` naming convention
- This ensures better version control and code reviewability

### 5.5 Navigation Rules

**MANDATORY: Follow proper navigation patterns based on navigation scope.**

#### Cross-Flow Navigation (Shell to Different Flow)
When navigating from the shell to a page in a different flow, **ALWAYS navigate to the flow first**, then specify the target page.

**✓ Correct - Navigate to Flow with Page:**
```javascript
const toMain = await Actions.navigateToFlow(context, {
  flow: 'main',
  page: 'main-project-list',
});
```

**✗ Incorrect - Direct page navigation across flows:**
```javascript
// DON'T do this when navigating across flows
const toMain = await Actions.navigateToPage(context, {
  page: 'main-project-list',
});
```

#### Same-Flow Navigation (Within Current Flow)
When navigating between pages **within the same flow**, use `navigateToPage`.

**✓ Correct - Navigate to Page in Same Flow:**
```javascript
const toMainEmployeeDetail = await Actions.navigateToPage(context, {
  page: 'main-employee-detail',
});
```

#### Navigation Pattern Summary

| Scenario | Method | Example |
|----------|--------|---------|
| Shell → Different Flow + Page | `navigateToFlow()` | `navigateToFlow(context, { flow: 'main', page: 'main-project-list' })` |
| Same Flow → Different Page | `navigateToPage()` | `navigateToPage(context, { page: 'main-employee-detail' })` |

**Key Rules:**
- Use `navigateToFlow()` when crossing flow boundaries (even if going to a page)
- Use `navigateToPage()` only when staying within the current flow
- Always specify both `flow` and `page` parameters when using `navigateToFlow()`
- Follow consistent naming: `flowName-pageName` convention

#### Page Name Convention in Navigation

**MANDATORY: Do NOT add '-page' suffix when specifying page names in navigation.**

**✓ Correct - Page name without suffix:**
```javascript
page: 'main-employee-detail'
```

**✗ Incorrect - Adding '-page' suffix:**
```javascript
page: 'main-employee-detail-page'  // DON'T do this
```

**Rule:** Use the actual page identifier as it appears in VBCS, without any additional suffixes.

---