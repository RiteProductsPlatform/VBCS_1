# VBCS & Oracle JET Prompting Playbook

This playbook contains standardized prompt templates designed to eliminate ambiguity and error when instructing an AI to work on VBCS/Oracle JET applications.

**How to Use**: Copy the relevant template, fill in the `[BRACKETED]` sections, and paste it into the chat.

---

## 🏗️ Scenario 1: Creating a New Service Connection

**Use Case**: You have a REST API URL and need to register it in VBCS.

### Prompt Template
```markdown
**Role**: VBCS & Integration Expert.
**Task**: Create a REST Service Connection.

**Inputs**:
- **URL**: `[INSERT URL]`
- **Service Name**: `[INSERT NAME, e.g., EmployeeService]`

**Requirements**:
1. **Catalog Check**:
   - READ `services/catalog.json` first.
   - Ensure `[Service Name]` is unique. If it exists, append a suffix (e.g., `_1`).
   - Add the new entry to `services/catalog.json`.

2. **OpenAPI Definition**:
   - Create `services/[Service Name]/openapi3.json` (OAS 3.0).
   - **Schema**: You MUST generate a plausible mock JSON schema for the response in `components/schemas`. Do not leave it empty.
   - **Operations**: Include at least a `get` operation.
   - **Oracle Extensions**: Add `"x-vb": { "actionHint": "getMany" }`.

**Deliverables**:
- valid `catalog.json` snippet.
- Complete `openapi3.json` file.
```

---

## 📄 Scenario 2: Creating a New Redwood Page

**Use Case**: You need to add a new page (e.g., Dashboard, Form, List) using Redwood patterns.

### Prompt Template
```markdown
**Role**: VBCS & Redwood UI Expert.
**Task**: Create a new page named `[Page Name, e.g., main-employees-page]`.

**Design Specs**:
- **Template**: Use `[Template Name, e.g., oj-sp-welcome-page]`.
- **Primary Content**: `[Describe content, e.g., A table listing employees with columns Name, Role, Status]`.
- **Slots**: Use the `default` slot for main content and `header` slot for the title.

**Implementation Rules**:
1. **Files**: Create `.html`, `.json`, and `.js` files.
2. **Logic**: Use JavaScript Action Chains (`[PageName]-chains/initChain.js`). NO JSON chains.
3. **Variables**: Create an ADP variable `[Var Name]` in the JSON to hold data.
4. **Imports**: Ensure `oj-table`, `oj-button`, etc., are imported in the JSON.

**Deliverables**:
- Full HTML code using `<oj-bind-if>` for conditional rendering.
- Full JSON configuration with variable definitions and event listeners.
- JavaScript Action Chain for capturing the `vbEnter` event.
```

---

## 🧩 Scenario 3: Creating a Custom Component

**Use Case**: You need a reusable UI piece (e.g., a specific card layout or a complex form widget).

### Prompt Template
```markdown
**Role**: Oracle JET Component Developer.
**Task**: Create a reusable view/component for `[Description, e.g., A Project Summary Card]`.

**Specs**:
- **Input Props**: It should accept `[Prop Name, e.g., projectData]` as an input.
- **Visuals**: Use `oj-panel` with `oj-bg-neutral-20` and rounded corners.
- **Interactivity**: Include a "View Details" button that emits a custom event `selection`.

**Rules**:
1. **Accessibility**: Elements must have `aria-label` or `label-hint`.
2. **Structure**: Do not use `oj-bind-text` directly inside `oj-button`. Wrap in `<span>`.
3. **Validation**: Check against `VBCS_Validation_Checklist.md` before generating code.

**Deliverables**:
- HTML snippet for the component.
- JSON definition for any local variables/types required.
```

---

## 🎨 Scenario 4: UI Modification & Styling

**Use Case**: Changing the look and feel, fixing layout issues, or making elements dynamic.

### Prompt Template
```markdown
**Role**: CSS & Oracle Redwood Expert.
**Task**: Modify `[File Path]` to fix/update `[Specific Element]`.

**Requirement**:
- `[Explain Change, e.g., "Change the authenticated fields to use distinct buttons instead of a dropdown."]`
- **Styles**: Use Redwood tokens (e.g., `oj-sm-margin-2x`), NOT hardcoded pixels.
- **Conditionals**: Use `<oj-bind-if>` to show/hide sections based on `[Variable Name]`.

**Constraint Checklist**:
- [ ] No `direction` attribute on radiosets/checkboxsets.
- [ ] All inputs must have labels.
- [ ] Buttons must natively support icons via slots if used.

**Deliverables**:
- The specific `replace_file_content` block for the HTML.
- Any necessary JSON updates (e.g., new variables for visibility control).
```

---

## ⚙️ Scenario 5: Logic & Action Chains

**Use Case**: Adding validation, error handling, or calling REST services.

### Prompt Template
```markdown
**Role**: VBCS Logic Architect.
**Task**: Update the logic for `[Chain Name, e.g., saveRestApiTaskChain.js]`.

**Logic Flow**:
1. **Validate**: Check if `[Field Name]` is empty. If so, fire a notification error.
2. **Payload**: Construct a JSON payload including `[New Field]`.
3. **Call REST**: Call endpoint `[Endpoint ID]`.
4. **Handle Success**:
   - Fire success notification.
   - Close dialog safely via `Actions.callComponentMethod`.
   - Refresh list (call `updateTaskListChain`).
5. **Handle Error**: 
   - Catch errors. 
   - **Crucial**: Check if `err.name === 'AbortError'`. If so, `console.log` and ignore it safely (this is normal JET behavior on rapid re-rendering).
   - Show a notification with `err.message` for true failures.

**Deliverables**:
- Fully updated JS code for the Action Chain class using `async/await`.
```

---

## 🧹 Scenario 6: Cleanup & Validation

**Use Case**: You want the AI to self-correct or verify the codebase against the rules.

### Prompt Template
```markdown
**Role**: Code Quality Assurance.
**Task**: Audit `[File Path]` against `VBCS_Validation_Checklist.md`.

**Check for**:
1. **Imports**: Are all required components imported in JSON?
2. **Syntax**: Are `oj-bind-text` elements inside `oj-button` properly wrapped in `<span>`?
3. **A11y**: Do inputs have labels (`label-hint`)?
4. **UX**: Do empty dropdowns/lists have `<template slot="noData">` implemented?
5. **Variables**: Ensure no `undefined` fallback variables are used; initialize them explicitly in JSON.

**Deliverable**:
- A list of issues found.
- The `replace_file_content` blocks to fix them immediately.
```

---

## 🔁 Scenario 7: API Pagination & Data Loops

**Use Case**: Fetching massive datasets from ORDS or Spring Boot that require `limit`/`offset` or `page`/`size` parameters.

### Prompt Template
```markdown
**Role**: VBCS Data Architecture Expert.
**Task**: Create/Update `[Chain Name, e.g., fetchAllRecordsChain.js]` to handle API pagination.

**Implementation Rules**:
1. **Pagination Logic**:
   - Initialize `allItems = []`, `currentPage = 0`, `totalPages = 1`.
   - Setup a `do { ... } while (currentPage < totalPages)` loop.
2. **REST Call**:
   - Inside the loop, `await Actions.callRest` using the `[Endpoint Name]`.
   - Pass `uriParameters: { page: currentPage, size: 100 }`.
3. **Processing**:
   - Concat `response.body.items` (or `.content`) into `allItems`.
   - Extract `totalPages` from the response body to continue the loop.
4. **Error Handling**:
   - Wrap the entire routine in `try/catch`. 
   - Ignore `AbortError` seamlessly.

**Deliverables**:
- JS Action Chain containing robust looping syntax.
```
