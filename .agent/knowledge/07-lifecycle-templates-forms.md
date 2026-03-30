# VBCS Skillset — 07: Page Lifecycle, Page Module, Templates & Forms

---

## 1. Page Lifecycle Events

Every VBCS page goes through a predictable lifecycle. You hook into it via event listeners in the page `.json` and handler chains.

### Lifecycle sequence (page opening)
```
vbBeforeEnter  →  vbEnter  →  vbAfterEnter  →  pageActivated (deprecated alias)
```

### Lifecycle sequence (page closing)
```
vbBeforeExit  →  vbExit
```

### Wiring lifecycle events in `<page>.json`

```json
"eventListeners": {
  "vbEnter": {
    "chains": [
      { "chain": "loadCrewsChain" }
    ]
  },
  "vbBeforeExit": {
    "chains": [
      {
        "chain": "confirmUnsavedChangesChain",
        "parameters": { "event": "{{ $event }}" }
      }
    ]
  }
}
```

### Which event to use for data loading

| Event | Use for |
|---|---|
| `vbEnter` | **Primary data loading hook.** Fires every time the page becomes active, including when navigating back to it. Most reliable for keeping data fresh. |
| `vbBeforeEnter` | Fires before the page renders. Use for permission checks or redirects. Can cancel navigation by calling `event.preventDefault()`. |
| `vbAfterEnter` | Fires after the page is fully rendered. Use for post-render DOM operations (e.g. setting focus). |
| `vbBeforeExit` | Fires before leaving. Use for unsaved-changes guards. Can cancel navigation. |
| `vbExit` | Fires when page is being torn down. Use for cleanup. |

### Data loading on page enter — canonical pattern

```js
// In loadCrewsChain.js (called from vbEnter event listener)
async run(context) {
  const { $page } = context;
  $page.variables.isLoading = true;
  try {
    const result = await Actions.callRest(context, {
      endpoint: 'CrewsService/getCrews',
      uriParams: { _t: Date.now() }
    });
    if (result.ok) {
      $page.variables.rawCrewsArray = result.body.items || [];
    }
  } catch (err) {
    // handle error
  } finally {
    $page.variables.isLoading = false;
  }
}
```

**Rule:** Always load data in `vbEnter`, not in a constructor or `pageActivated`. `vbEnter` fires every time the user navigates to the page, ensuring fresh data. `pageActivated` is deprecated in VBCS 23+.

---

## 2. The Page Module (`.js` file)

The page module provides **computed helper functions** that can be called from HTML template expressions and from action chains via `$page.functions`. It is NOT for business logic (that belongs in chains).

### Canonical structure

```js
define(['vb/BusinessObjectsTransform'], (BusinessObjectsTransform) => {
  'use strict';

  class PageModule {

    // Called from HTML: [[ $functions.formatDate($variables.startDate) ]]
    formatDate(dateStr) {
      if (!dateStr) return '';
      return dateStr.split('T')[0];  // strip time component
    }

    // Compute a display label from a code
    getStatusLabel(status) {
      const map = { Active: 'Active', Inactive: 'Inactive' };
      return map[status] || status || '—';
    }

    // Compute CSS class based on data
    getStatusClass(status) {
      return status === 'Active' ? 'oj-badge-success' : 'oj-badge-danger';
    }

    // Format a number with commas
    formatCount(n) {
      return n !== undefined && n !== null ? String(n) : '0';
    }
  }

  return PageModule;
});
```

### Calling page module functions from HTML

```html
<!-- From HTML expressions -->
<span>[[ $functions.formatDate($variables.selectedCrewData.start_date) ]]</span>

<!-- Binding a CSS class dynamically -->
<span :class="[[ $functions.getStatusClass($variables.selectedCrewData.status) ]]">
  [[ $variables.selectedCrewData.status ]]
</span>
```

### Calling page module functions from a chain

```js
async run(context) {
  const { $page } = context;
  const label = $page.functions.getStatusLabel($page.variables.selectedCrewData.status);
}
```

**Rules:**
- Page module functions must be **pure** — no side effects, no variable mutations. They are called frequently by the JET rendering engine.
- Do not import `vb/action/actions` into the page module. Actions belong in chains, not the page module.
- The `define([...])` dependency array can be empty (`define([], () => { ... })`) if no imports are needed.
- Function names must not collide with VBCS reserved names.

---

## 3. Conditional Rendering: `oj-bind-if`

Use `oj-bind-if` to conditionally include or exclude a block of HTML from the DOM.

```html
<!-- Show only when in detail view -->
<oj-bind-if test="[[ $variables.viewMode === 'detail' ]]">
  <div class="oj-flex">
    <h2>[[ $variables.selectedCrewData.name ]]</h2>
  </div>
</oj-bind-if>

<!-- Show loading spinner -->
<oj-bind-if test="[[ $variables.isLoading ]]">
  <div class="oj-flex oj-sm-justify-content-center">
    <oj-progress-circle size="sm" value="-1"></oj-progress-circle>
  </div>
</oj-bind-if>

<!-- Show empty state -->
<oj-bind-if test="[[ !$variables.isLoading && $variables.crewsArray.length === 0 ]]">
  <p class="oj-typography-body-sm">No crews found.</p>
</oj-bind-if>
```

**Rules:**
- `oj-bind-if` **removes** the element from the DOM entirely when false — not just hidden. This means child component state is lost when toggled off.
- Use CSS `display: none` (via `:style`) if you need to preserve component state while hiding.
- `test` always uses one-way binding `[[ ]]`.
- Nest `oj-bind-if` elements to create if/else-if/else chains:

```html
<oj-bind-if test="[[ $variables.viewMode === 'list' ]]">
  <!-- list view -->
</oj-bind-if>

<oj-bind-if test="[[ $variables.viewMode === 'detail' ]]">
  <!-- detail view -->
</oj-bind-if>
```

---

## 4. List Iteration: `oj-bind-for-each`

Use `oj-bind-for-each` to render a block of HTML for each item in an array.

```html
<!-- Iterate over an array variable -->
<oj-bind-for-each data="[[ $variables.crewsArray ]]">
  <template data-oj-as="crew">
    <div class="oj-flex oj-sm-padding-4x">
      <span>[[ crew.data.crew_code ]]</span>
      <span>[[ crew.data.name ]]</span>
    </div>
  </template>
</oj-bind-for-each>
```

**Key detail:** Inside the `<template>`, the item is accessed via `<alias>.data.<field>` — the `.data` wrapper is always required.

```html
<!-- With index -->
<oj-bind-for-each data="[[ $variables.itemsArray ]]">
  <template data-oj-as="item">
    <div>
      Row [[ item.index ]]: [[ item.data.name ]]
    </div>
  </template>
</oj-bind-for-each>
```

Available template variables:
- `item.data` — the actual item object
- `item.index` — zero-based position in the array
- `item.observableData` — observable version (use for two-way bindings within the row)

**Rules:**
- Always provide `data-oj-as="<alias>"` on the `<template>` to name the loop variable.
- The `data` attribute requires `[[ ]]` (one-way). The for-each does not support `{{ }}`.
- For large lists, use `oj-data-grid` or `oj-list-view` instead — `oj-bind-for-each` renders all items at once with no virtualisation.

---

## 5. LOV / Dropdown: `oj-select-single`

The standard Oracle JET component for single-select dropdowns. Backed by an `ArrayDataProvider`.

### Setup: declare the ADP for options in `.json`

```json
"variables": {
  "supervisorsADP": {
    "type": "vb/ArrayDataProvider2",
    "defaultValue": {
      "itemType": "ContactType",
      "keyAttributes": "id"
    }
  }
},
"types": {
  "ContactType": {
    "id": "number",
    "name": "string",
    "code": "string"
  }
}
```

### Populate options from a REST call in a chain

```js
// loadContactsChain.js
const result = await Actions.callRest(context, {
  endpoint: 'CrewsService/getContacts'
});
if (result.ok) {
  const contacts = (result.body.items || []).map(c => ({
    id: c.CONTACT_ID || c.contact_id,
    name: c.NAME || c.name,
    code: c.CODE || c.code,
  }));

  // Populate the ADP by replacing its data
  await Actions.fireDataProviderEvent(context, {
    target: $page.variables.supervisorsADP,
    // Clear existing and add all new items is not directly supported.
    // Pattern: reassign the variable's data via assignVariable (see note below).
  });
}
```

**Note on repopulating an ADP:** VBCS does not provide a "replace all" `fireDataProviderEvent` operation. The recommended pattern for loading a fresh options list is to store the raw array in a plain array variable and bind the `oj-select-single` to an `ArrayDataProvider` created inline via a page module function, OR use a `SDP` (ServiceDataProvider) bound directly to the endpoint.

Simplest practical approach — store as a plain array and let JET create the ADP:

```json
"supervisorsArray": { "type": "array", "defaultValue": [] }
```

```js
// In chain
$page.variables.supervisorsArray = contacts;
```

```html
<!-- In HTML, create ADP inline using page module -->
<oj-select-single
  label-hint="Supervisor"
  value="{{ $variables.selectedCrewData.supervisor_id }}"
  item-text="name"
  data="[[ $functions.toADP($variables.supervisorsArray) ]]">
</oj-select-single>
```

```js
// In page module (.js)
toADP(arr) {
  // Return a new JET ArrayDataProvider each time (acceptable for small option lists)
  // Requires RequireJS import of ArrayDataProvider
  return new ArrayDataProvider(arr || [], { keyAttributes: 'id' });
}
```

Or the cleanest VBCS-native approach — use a `vb/ArrayDataProvider2` variable but clear and re-add items:

```js
// To reset options, set the variable back to its default then add all items
// This is what VBCS internally does when you use assignVariable on the ADP
$page.variables.supervisorsArray = [];
// Then in next tick:
$page.variables.supervisorsArray = contacts;
```

### Binding `oj-select-single` in HTML

```html
<oj-select-single
  label-hint="Supervisor"
  value="{{ $variables.selectedCrewData.supervisor_id }}"
  item-text="name"
  data="[[ $variables.supervisorsADP ]]"
  on-value-changed="[[ $listeners.onSupervisorChangedChain ]]">
</oj-select-single>
```

| Attribute | Purpose |
|---|---|
| `value` | The **key** field of the selected item (two-way `{{ }}`) |
| `item-text` | The field to display as the label in the dropdown |
| `data` | The ADP backing the options list |
| `label-hint` | The floating label text |
| `on-value-changed` | Fires when selection changes; `event.detail.value` is the new key |

**Rules:**
- `value` holds the **key** (e.g. `supervisor_id`), not the display label.
- `item-text` must match a field name in the ADP's item type.
- Always use two-way `{{ }}` for `value` so changes write back to the variable.
- `oj-select-single` requires `data` to be an ADP, not a plain array.

---

## 6. Form Layout: `oj-form-layout`

Oracle Redwood forms use `oj-form-layout` to arrange fields in a responsive grid.

```html
<oj-form-layout max-columns="2" label-edge="inside" direction="column">

  <oj-input-text
    label-hint="Crew Code"
    value="{{ $variables.selectedCrewData.crew_code }}"
    required="true">
  </oj-input-text>

  <oj-input-text
    label-hint="Crew Name"
    value="{{ $variables.selectedCrewData.name }}">
  </oj-input-text>

  <oj-select-single
    label-hint="Supervisor"
    value="{{ $variables.selectedCrewData.supervisor_id }}"
    data="[[ $variables.supervisorsADP ]]"
    item-text="name">
  </oj-select-single>

  <oj-input-date
    label-hint="Start Date"
    value="{{ $variables.selectedCrewData.start_date }}">
  </oj-input-date>

</oj-form-layout>
```

### `oj-form-layout` key attributes

| Attribute | Values | Effect |
|---|---|---|
| `max-columns` | `1`, `2`, `3`, `4` | Max fields per row |
| `label-edge` | `inside`, `top`, `start` | Label position relative to field |
| `direction` | `column`, `row` | Field flow direction |

### Common form field components

| Component | Path | Use |
|---|---|---|
| `oj-input-text` | `ojs/ojinputtext` | Single-line text |
| `oj-text-area` | `ojs/ojinputtext` | Multi-line text |
| `oj-input-number` | `ojs/ojinputnumber` | Numeric input |
| `oj-input-date` | `ojs/ojdatetimepicker` | Date picker |
| `oj-select-single` | `ojs/ojselectsingle` | Single-select dropdown |
| `oj-combobox-one` | `ojs/ojcombobox` | Searchable single-select |
| `oj-switch` | `ojs/ojswitch` | Boolean toggle |
| `oj-checkboxset` | `ojs/ojcheckboxset` | Checkbox group |

**Rules:**
- All form fields must be direct children of `oj-form-layout` to participate in the column grid.
- `required="true"` on a field adds visual indicator but does NOT automatically prevent form submission — you must validate manually in the save chain.
- `label-edge="inside"` is the Oracle Redwood default and matches the design system.

---

## 7. Date Input Handling

`oj-input-date` stores its value in ISO format. Important behaviours:

```html
<oj-input-date
  label-hint="Start Date"
  value="{{ $variables.selectedCrewData.start_date }}"
  on-value-changed="[[ $listeners.onStartDateChangedChain ]]">
</oj-input-date>
```

- The `value` is stored as a string in format `YYYY-MM-DD` when the user picks a date.
- When you populate `value` from a REST response that includes time (`2025-01-15T00:00:00Z`), strip the time before binding: `response_date.split('T')[0]`.
- When sending back to the API, re-append `T00:00:00Z` (see Doc 04).
- The component does NOT automatically validate date ranges. Validate start < end in your save chain.

---

## 8. `oj-switch` — Boolean Toggle

```html
<oj-switch
  label-hint="Active"
  value="{{ $variables.selectedCrewData.activeFlag }}">
</oj-switch>
```

Variable type must be `boolean`:
```json
"activeFlag": { "type": "boolean", "defaultValue": true }
```

When sending to the API, map the boolean to whatever the API expects:
```js
STATUS: $page.variables.selectedCrewData.activeFlag ? 'Active' : 'Inactive',
IS_ACTIVE: $page.variables.personData.is_active === true ? 'Y' : 'N'
```

---

## 9. Showing a Loading Spinner

```html
<oj-bind-if test="[[ $variables.isLoading ]]">
  <div class="oj-flex oj-sm-justify-content-center oj-sm-padding-8x">
    <oj-progress-circle size="md" value="-1"></oj-progress-circle>
  </div>
</oj-bind-if>
```

Register the component:
```json
"oj-progress-circle": { "path": "ojs/ojprogress" }
```

Pattern: set `isLoading = true` at the start of any chain that fetches data, and `isLoading = false` in `finally`.

---

## 10. Disable Controls While Saving

Prevent double-clicks and user interaction during async operations:

```html
<!-- Disable button during save -->
<oj-button
  disabled="[[ $variables.isSaving ]]"
  on-oj-action="[[ $listeners.saveChain ]]">
  Save
</oj-button>

<!-- Disable an entire form section -->
<fieldset disabled="[[ $variables.isSaving ]]">
  <oj-form-layout>
    ...
  </oj-form-layout>
</fieldset>
```

Variable setup:
```json
"isSaving": { "type": "boolean", "defaultValue": false }
```

Always reset in `finally`:
```js
try {
  $page.variables.isSaving = true;
  // ... REST call
} finally {
  $page.variables.isSaving = false;
}
```
