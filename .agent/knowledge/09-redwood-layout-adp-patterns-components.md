# VBCS Skillset — 09: Redwood Layout, ADP Patterns, oj-table, oj-tab-bar & Real-World Templates

> This document is grounded in the actual CrewRite source files. Every pattern shown
> here is taken directly from working production code. Follow these exactly.

---

## 1. The Redwood Shell Page — Canonical Structure

This is the exact outer wrapper every VBCS Redwood app uses. Do not deviate from this structure.

```html
<!-- shell-page.html -->
<div id="pageContent" class="oj-web-applayout-page" style="min-height: 100vh;">

  <!-- SLOT 1: Side drawer (hamburger menu panel) -->
  <oj-drawer-popup edge="end" opened="{{ $variables.isDrawerOpen }}">
    <div class="oj-flex oj-sm-flex-direction-column oj-bg-neutral-10
                oj-sm-padding-6x-top oj-sm-padding-4x-start oj-sm-padding-4x-end"
         style="height: 100vh;">

      <!-- Drawer header row: title + close button -->
      <div class="oj-flex oj-sm-justify-content-space-between oj-sm-align-items-center oj-sm-margin-6x-bottom">
        <h3 class="oj-typography-heading-sm oj-typography-bold oj-sm-margin-0">Application Menu</h3>
        <oj-button chroming="borderless" display="icons" on-oj-action="[[ $listeners.toggleDrawerChain ]]">
          <span slot="startIcon" class="oj-ux-ico-close"></span>
          <span>Close</span>
        </oj-button>
      </div>

      <!-- Navigation list -->
      <oj-navigation-list class="oj-sm-width-full" selection="main"
        drill-mode="none" edge="start"
        on-selection-changed="[[ $listeners.onNavSelectionChanged ]]">
        <ul>
          <li id="main-<pageId>">
            <a href="#">
              <span class="oj-ux-ico-<icon> oj-navigationlist-item-icon"></span>
              <span class="oj-navigationlist-item-label oj-typography-body-sm oj-typography-semi-bold">
                Page Label
              </span>
            </a>
          </li>
        </ul>
      </oj-navigation-list>
    </div>
  </oj-drawer-popup>

  <!-- SLOT 2: Top navigation header bar -->
  <header role="banner" class="oj-web-applayout-header oj-sm-padding-4x-horizontal"
    style="background-color: var(--oj-core-bg-neutral-170, #000);
           border-bottom: 1px solid var(--oj-core-divider-margin);
           box-shadow: 0 2px 4px rgba(0,0,0,0.05);
           min-height: 48px;">
    <div class="oj-flex-bar oj-sm-align-items-center" style="height: 100%; min-height: 48px;">

      <!-- Left: Logo image -->
      <div class="oj-flex-bar-start">
        <img width="45" height="45"
          :src="[[ $application.path + 'resources/images/logo.jpg' ]]"
          style="object-fit: fill;">
      </div>

      <!-- Left: App title -->
      <div class="oj-flex-bar-start">
        <h1 class="oj-typography-heading-sm oj-typography-bold oj-sm-margin-0"
          style="color: #fff;">App Name</h1>
      </div>

      <!-- Right: Hamburger button -->
      <div class="oj-flex-bar-end">
        <oj-button chroming="borderless" display="icons"
          on-oj-action="[[ $listeners.toggleDrawerChain ]]"
          class="oj-color-invert">
          <span slot="startIcon" class="oj-ux-ico-menu" style="color: #fff;"></span>
          <span style="color: #fff;">Menu</span>
        </oj-button>
      </div>

    </div>
  </header>

  <!-- SLOT 3: Main content area -->
  <div class="oj-flex oj-sm-flex-wrap-nowrap oj-sm-height-full">
    <div class="oj-flex-item oj-web-applayout-content-nopad oj-web-applayout-max-width"
         style="overflow-y: auto;">

      <!-- Global notification banner — always at top of content area -->
      <div class="oj-flex">
        <oj-sp-messages-banner
          data="[[ $variables.messagesBannerADP ]]"
          class="oj-flex-item oj-sm-12 oj-md-12"
          on-sp-close="[[$listeners.messagesBannerSpClose]]">
        </oj-sp-messages-banner>
      </div>

      <!-- Toast notification -->
      <oj-sp-messages-toast
        primary-text="[[ $variables.messageToast ]]"
        id="messageToast">
      </oj-sp-messages-toast>

      <!-- Router outlet — renders the active flow page -->
      <div class="oj-flex">
        <oj-vb-content id="vbRouterContent" class="oj-flex-item"
          config="[[vbRouterFlow]]">
        </oj-vb-content>
      </div>

    </div>
  </div>

</div>
```

### Critical Redwood layout classes — what each does

| Class | Element | Effect |
|---|---|---|
| `oj-web-applayout-page` | Root div | Activates Redwood full-page layout grid |
| `oj-web-applayout-header` | `<header>` | Pins the header to the top; correct height/padding |
| `oj-web-applayout-content-nopad` | Content div | Removes default content padding (manage your own) |
| `oj-web-applayout-max-width` | Content div | Applies Redwood's max-width constraint |
| `oj-flex-bar` | Header inner div | Flexbox with start/end anchors |
| `oj-flex-bar-start` | Logo/title div | Anchors content to the left of the bar |
| `oj-flex-bar-end` | Menu button div | Anchors content to the right of the bar |
| `oj-bg-neutral-10` | Drawer background | Redwood neutral background tint |
| `oj-color-invert` | Button in dark header | Inverts button colours for dark background |

**Rule:** Never omit `oj-web-applayout-page`, `oj-web-applayout-header`, and `oj-web-applayout-content-nopad`. Without them, the app renders unstyled and the layout breaks on resize.

---

## 2. The Flow Page Wrapper — `oj-sp-general-overview-page`

Every content page uses `oj-sp-general-overview-page` as its root component (not a plain div). This provides the Redwood page header with title, subtitle, and content slot.

```html
<!-- <page>.html — root element -->
<oj-sp-general-overview-page
  id="oj_gop1"
  display-options.responsive-padding="off"
  page-title="Crews"
  page-subtitle="Master crew data, employee & equipment resources"
  class="oj-sm-width-full">

  <div class="oj-flex oj-sm-flex-direction-column oj-sm-width-full oj-sm-gap-4x"
       slot="main"
       style="max-width: 100% !important;">

    <!-- All page content goes here -->

  </div>
</oj-sp-general-overview-page>
```

Register in `.json`:
```json
"oj-sp-general-overview-page": { "path": "oj-sp/general-overview-page/loader" }
```

### Key attributes

| Attribute | Effect |
|---|---|
| `page-title` | Large heading shown at top of the page |
| `page-subtitle` | Smaller subtitle below the title |
| `display-options.responsive-padding="off"` | Removes default padding so content reaches full width |
| `slot="main"` | Required on the content div — places content in the page body slot |

**Rule:** All page content must be inside `slot="main"`. Content outside the slot is ignored.

**Common override CSS:** The SP component enforces a max-width. Override with:
```css
#oj_gop1 {
  --oj-sp-general-overview-page-max-width: 100% !important;
  max-width: 100% !important;
  transform: none !important;
}
```

---

## 3. The Array-Linked ADP Pattern (Most Common ADP Usage)

The most common and performant way to use ADP in VBCS is to **declare the ADP with a live binding to a plain array variable** in `defaultValue`. Updating the array automatically updates the ADP and the bound component.

```json
"variables": {
  "crewsArray": {
    "type": "any[]",
    "defaultValue": []
  },
  "crewsDP": {
    "type": "vb/ArrayDataProvider2",
    "defaultValue": {
      "itemType": "any",
      "keyAttributes": "cr_crews_id",
      "data": "{{ $page.variables.crewsArray }}"
    }
  }
}
```

The `"data": "{{ $page.variables.crewsArray }}"` binding in `defaultValue` creates a **live reactive link**. When you assign to `crewsArray` in a chain, `crewsDP` automatically reflects the new data — no `fireDataProviderEvent` add/remove needed.

```js
// In a chain — just assign the array, the ADP updates automatically
$page.variables.crewsArray = result.body.items;
```

```html
<!-- Bind the component to the ADP, not the array -->
<oj-table data="[[ $variables.crewsDP ]]"></oj-table>
```

### When to use each ADP pattern

| Pattern | Use case |
|---|---|
| `"data": "{{ $page.variables.myArray }}"` | Read-only lists loaded from REST. Assign array once, ADP stays in sync. |
| `fireDataProviderEvent` add/remove | Dynamic mutation — adding single items (notifications), removing single items. |
| Static `defaultValue` with hardcoded items | Static lookup lists (status codes, resource types, unions). |

**Rule:** For any list loaded from a REST endpoint, always use the array-linked ADP pattern. Reserve `fireDataProviderEvent` for fine-grained single-item mutations like the notification banner.

### Static lookup ADP — hardcoded options

```json
"resourceTypesArray": {
  "type": "any[]",
  "defaultValue": [
    { "value": "Person",    "label": "Person only" },
    { "value": "Equipment", "label": "Equipment only" },
    { "value": "Both",      "label": "Person and Equipment" }
  ]
},
"resourceTypesDP": {
  "type": "vb/ArrayDataProvider2",
  "defaultValue": {
    "itemType": "any",
    "keyAttributes": "value",
    "data": "{{ $page.variables.resourceTypesArray }}"
  }
}
```

---

## 4. `oj-table` — The Standard List Component

`oj-table` is the standard Redwood list component. Use it for master lists (crews, employees, equipment). It is **not** a spreadsheet — use `oj-data-grid` only for time-entry grids with editable cells.

```html
<oj-table
  id="crewsTable"
  data="[[ $variables.crewsDP ]]"
  class="oj-sm-width-full"
  horizontal-grid-visible="enabled"
  vertical-grid-visible="disabled"
  selection-mode='{"row": "none", "column": "none"}'
  columns='[
    {
      "headerText": "CREW",
      "template": "crewTemplate",
      "headerClassName": "list-header-label",
      "resizable": "enabled",
      "weight": 4,
      "minWidth": 300,
      "sortProperty": "name"
    },
    {
      "headerText": "STATUS",
      "template": "statusTemplate",
      "headerClassName": "list-header-label",
      "width": 120,
      "sortProperty": "status"
    },
    {
      "headerText": "ACTIONS",
      "template": "actionTemplate",
      "headerClassName": "list-header-label",
      "align": "center",
      "width": 150,
      "sortable": "disabled"
    }
  ]'>

  <!-- Cell template: named slot matches "template" value in columns config -->
  <template slot="crewTemplate" data-oj-as="cell">
    <div class="oj-flex oj-sm-align-items-center">
      <span class="oj-typography-body-md oj-typography-semi-bold">
        <oj-bind-text value="[[ cell.row.name ]]"></oj-bind-text>
      </span>
    </div>
  </template>

  <template slot="statusTemplate" data-oj-as="cell">
    <span :class="[[ cell.row.status === 'Active'
      ? 'oj-status-capsule-active'
      : 'oj-status-capsule-inactive' ]]">
      <oj-bind-text value="[[ cell.row.status ]]"></oj-bind-text>
    </span>
  </template>

  <template slot="actionTemplate" data-oj-as="cell">
    <div class="oj-flex oj-sm-align-items-center oj-sm-justify-content-center oj-sm-gap-3x">
      <oj-button display="icons" chroming="borderless"
        on-oj-action="[[ $listeners.editChain ]]">
        <span slot="startIcon" class="oj-ux-ico-edit" title="Edit"></span>
      </oj-button>
      <oj-button display="icons" chroming="borderless"
        on-oj-action="[[ $listeners.deleteChain ]]">
        <span slot="startIcon" class="oj-ux-ico-unlink" title="Delete"></span>
      </oj-button>
    </div>
  </template>

</oj-table>
```

Register:
```json
"oj-table": { "path": "ojs/ojtable" }
```

### `oj-table` key attributes

| Attribute | Values | Effect |
|---|---|---|
| `data` | ADP variable | The data source |
| `columns` | JSON string | Column definitions (headerText, template, width, sortProperty) |
| `horizontal-grid-visible` | `"enabled"`, `"disabled"` | Row separator lines |
| `vertical-grid-visible` | `"enabled"`, `"disabled"` | Column separator lines |
| `selection-mode` | JSON object | Row/column selection: `"none"`, `"single"`, `"multiple"` |

### Cell template data access

Inside a `<template slot="myTemplate" data-oj-as="cell">`:
- `cell.row.<field>` — access the row's data fields directly
- `cell.row` — the full row object
- `cell.index` — row index

**Rule:** Always use `<oj-bind-text value="[[ cell.row.field ]]">` inside templates — never use `[[ ]]` as raw text content inside an element (it won't render correctly in JET templates).

### Passing row data to a chain from `oj-table`

In `eventListeners` in `.json`, use `$current.row` to pass the current row to the chain:

```json
"openCrewDetailsChain": {
  "chains": [
    {
      "chain": "openCrewDetailsActionChain",
      "parameters": {
        "payload": "{{ $current.row }}"
      }
    }
  ]
}
```

For more defensive handling (works whether triggered from table row or programmatically):
```json
"payload": "{{ typeof $current !== 'undefined' && $current.row ? $current.row : (typeof $event !== 'undefined' && $event.detail && $event.detail.payload ? $event.detail.payload : $variables.selectedCrewData) }}"
```

---

## 5. Master–Detail View Pattern (`viewMode` variable)

The most common VBCS UI pattern: a list view and a detail/edit view on the same page, controlled by a `viewMode` string variable.

```json
"viewMode": { "type": "string", "defaultValue": "list" }
```

```html
<!-- List view -->
<oj-bind-if test="[[ $variables.viewMode === 'list' ]]">
  <!-- oj-table, search bar, create button -->
</oj-bind-if>

<!-- Detail / edit view -->
<oj-bind-if test="[[ $variables.viewMode === 'detail' ]]">
  <!-- form, save/disband/back buttons -->
</oj-bind-if>
```

Navigation in chains:
```js
// Go to detail (new crew)
$page.variables.selectedCrewData = { ...defaults };
$page.variables.viewMode = 'detail';

// Go to detail (edit existing crew)
$page.variables.selectedCrewData = rowData;
$page.variables.viewMode = 'detail';

// Back to list
$page.variables.viewMode = 'list';
window.scrollTo(0, 0);  // always scroll to top on list return
```

**Rule:** Always call `window.scrollTo(0, 0)` when switching back to list view — the user should not be left scrolled to the middle of the page.

---

## 6. Dynamic Button Label and Icon (Save/Saving State)

```html
<oj-button
  chroming="callToAction"
  disabled="[[ $variables.isSaving ]]"
  on-oj-action="[[ $variables.selectedCrewData.cr_crews_id
    ? $listeners.saveCrewChain
    : $listeners.saveNewCrewChain ]]">

  <!-- Spinning icon during save -->
  <span slot="startIcon"
    :class="[[ $variables.isSaving
      ? 'oj-ux-ico-progress-circle oj-animation-spin'
      : 'oj-ux-ico-save' ]]">
  </span>

  <!-- Dynamic label -->
  <span>
    <oj-bind-text value="[[ $variables.isSaving
      ? 'Saving...'
      : ($variables.selectedCrewData.cr_crews_id ? 'Save' : 'Create') ]]">
    </oj-bind-text>
  </span>

</oj-button>
```

Key techniques:
- `oj-animation-spin` makes the icon spin continuously
- Inline ternary `$listeners.saveCrewChain : $listeners.saveNewCrewChain` selects chain based on variable
- `:class` (with colon prefix) is used for **dynamic class binding** — unlike `class` which is static

---

## 7. `oj-tab-bar` — Tabbed Navigation Within a Page

Used for switching between sub-sections (e.g. Persons tab / Equipment tab).

```html
<oj-tab-bar
  selection="{{ $variables.selectedTab }}"
  edge="top"
  class="oj-flex-item"
  data="[[ $variables.resourceTabsDP ]]">

  <template slot="itemTemplate" data-oj-as="item">
    <li :id="[[item.data.id]]">
      <a href="#">
        <span class="oj-tabbar-item-label">
          <oj-bind-text value="[[item.data.label]]"></oj-bind-text>
        </span>
      </a>
    </li>
  </template>

</oj-tab-bar>
```

ADP setup:
```json
"resourceTabsArray": { "type": "any[]", "defaultValue": [] },
"resourceTabsDP": {
  "type": "vb/ArrayDataProvider2",
  "defaultValue": {
    "itemType": "any",
    "keyAttributes": "id",
    "data": "{{ $page.variables.resourceTabsArray }}"
  }
},
"selectedTab": { "type": "string", "defaultValue": "personsTab" }
```

Populate tabs dynamically in a chain:
```js
$page.variables.resourceTabsArray = [
  { id: 'personsTab',   label: 'Employees' },
  { id: 'equipmentTab', label: 'Equipment' },
];
```

Show content conditionally based on selected tab:
```html
<oj-bind-if test="[[ $variables.selectedTab === 'personsTab' ]]">
  <!-- persons table -->
</oj-bind-if>
<oj-bind-if test="[[ $variables.selectedTab === 'equipmentTab' ]]">
  <!-- equipment table -->
</oj-bind-if>
```

Register:
```json
"oj-tab-bar": { "path": "ojs/ojtabbar" }
```

**Rule:** Always use two-way `{{ }}` for `selection` — the tab bar writes the selected tab id back to the variable.

**Refresh trick:** If the tab bar fails to re-render after dynamic data changes, toggle a boolean variable with `oj-bind-if`:

```html
<oj-bind-if test="[[ $variables.tabsRefresh ]]">
  <oj-tab-bar ...></oj-tab-bar>
</oj-bind-if>
```

```js
// In chain — force re-render
$page.variables.tabsRefresh = false;
// next tick
$page.variables.tabsRefresh = true;
```

---

## 8. `oj-buttonset-one` — Filter Toggle Bar

Used for filter tabs like ALL / ACTIVE / INACTIVE.

```html
<oj-buttonset-one
  value="{{ $variables.resourceFilter }}"
  chroming="borderless"
  on-value-changed="[[ $listeners.filterChain ]]">
  <oj-option value="all">
    <span class="oj-typography-body-sm oj-typography-semi-bold">ALL</span>
  </oj-option>
  <oj-option value="active">
    <span class="oj-typography-body-sm oj-typography-semi-bold">ACTIVE</span>
  </oj-option>
  <oj-option value="inactive">
    <span class="oj-typography-body-sm oj-typography-semi-bold">INACTIVE</span>
  </oj-option>
</oj-buttonset-one>
```

Register:
```json
"oj-buttonset-one": { "path": "ojs/ojbuttonset" },
"oj-option":        { "path": "ojs/ojoption" }
```

Variable: `"resourceFilter": { "type": "string", "defaultValue": "all" }`

`on-value-changed` fires with `event.detail.value` = the selected option's `value`.

---

## 9. `oj-input-search` — Search Field

The Redwood search input with built-in clear button and search icon.

```html
<oj-input-search
  id="crewSearchInput"
  aria-label="Search by Crew Name or Number"
  value="{{ $variables.searchQuery }}"
  on-raw-value-changed="[[ $listeners.handleSearchInput ]]"
  placeholder="Search by Crew Name, Crew Num...."
  class="oj-sm-width-1/2"
  style="min-width: 320px;">
</oj-input-search>
```

Register:
```json
"oj-input-search": { "path": "ojs/ojinputsearch" }
```

Use `on-raw-value-changed` (not `on-value-changed`) to trigger filtering on every keystroke.

---

## 10. `oj-progress-bar` — Loading State

```html
<oj-bind-if test="[[ $variables.isLoading ]]">
  <div class="oj-flex oj-sm-flex-direction-column oj-sm-align-items-center
              oj-sm-justify-content-center oj-sm-padding-10x oj-sm-gap-2x">
    <span class="oj-typography-body-md oj-text-color-secondary">Loading crews...</span>
    <oj-progress-bar value="-1" style="width: 200px;"></oj-progress-bar>
  </div>
</oj-bind-if>
```

`value="-1"` = indeterminate (animating). `value="75"` = 75% progress.

Register:
```json
"oj-progress-bar": { "path": "ojs/ojprogress" }
```

---

## 11. Redwood CSS Custom Properties (`--oj-core-*`)

Use these variables for theming — never hardcode colours in Redwood apps. These automatically respect dark/light mode and theme overrides.

| Variable | Usage |
|---|---|
| `var(--oj-core-bg-neutral-0)` | White / default card background |
| `var(--oj-core-bg-neutral-10)` | Light grey — drawer, sidebar backgrounds |
| `var(--oj-core-bg-neutral-20)` | Slightly darker grey — progress bar track |
| `var(--oj-core-bg-neutral-170, #000)` | Near-black — header bar background |
| `var(--oj-core-bg-neutral-30)` | Divider fill, muted elements |
| `var(--oj-core-divider-margin)` | Border/divider colour |
| `var(--oj-core-text-color-secondary)` | Secondary label text |
| `var(--oj-core-bg-success-subtle, #e5fdf4)` | Success pill background |
| `var(--oj-core-text-color-success, #007a33)` | Success pill text |
| `var(--oj-core-bg-danger-subtle, #fdeded)` | Danger/error pill background |
| `var(--oj-core-text-color-danger, #c12e2a)` | Danger/error pill text |
| `var(--oj-core-danger-color)` | Red — danger actions, progress fill |
| `var(--oj-core-danger-color-80)` | Slightly muted red — danger button borders |

Always provide a fallback value for critical colours: `var(--oj-core-bg-neutral-170, #000)`.

---

## 12. Status Capsule / Badge Pattern

Redwood does not have a built-in badge component. Use inline CSS with Oracle CSS custom properties:

```css
.oj-status-capsule-active {
  background-color: var(--oj-core-bg-success-subtle, #e5fdf4);
  border-radius: 12px;
  color: var(--oj-core-text-color-success, #007a33);
  padding: 4px 12px;
  display: inline-block;
  font-weight: 600;
  font-size: 0.85rem;
}

.oj-status-capsule-inactive {
  background-color: var(--oj-core-bg-danger-subtle, #fdeded);
  border-radius: 12px;
  color: var(--oj-core-text-color-danger, #c12e2a);
  padding: 4px 12px;
  display: inline-block;
  font-weight: 600;
  font-size: 0.85rem;
}
```

Usage in `oj-table` cell template:
```html
<template slot="statusTemplate" data-oj-as="cell">
  <span :class="[[ cell.row.status === 'Active'
    ? 'oj-status-capsule-active'
    : 'oj-status-capsule-inactive' ]]">
    <oj-bind-text value="[[ cell.row.status || 'Active' ]]"></oj-bind-text>
  </span>
</template>
```

---

## 13. `oj-collapsible` — Correct Header Slot Usage

Both `<h2>`/`<h3>` and `<span>` work as header slot content. Use `<span>` for section headers inside forms; use `<h2>` for major section headers.

```html
<!-- Section within a form — use span -->
<oj-collapsible expanded="true">
  <span slot="header" class="oj-typography-body-md oj-typography-semi-bold">
    Crew Information
  </span>
  <div>
    <oj-form-layout max-columns="4" direction="row">
      ...
    </oj-form-layout>
  </div>
</oj-collapsible>

<!-- Major section — use h2 in a div slot -->
<oj-collapsible expanded="true"
  disabled="[[ !$variables.selectedCrewData.cr_crews_id ]]">
  <div slot="header">
    <h2 class="oj-typography-heading-sm oj-sm-margin-0">Resources</h2>
  </div>
  <div>
    ...
  </div>
</oj-collapsible>
```

`disabled="[[ condition ]]"` prevents the user from collapsing/expanding. Use this when a section should be locked until prerequisites are met (e.g. crew must be saved before resources can be added).

---

## 14. `oj-input-date` — Min Date Enforcement

```html
<oj-input-date
  value="{{ $variables.selectedCrewData.end_date }}"
  label-hint="Effective End Date"
  min="{{ $variables.selectedCrewData.start_date }}">
</oj-input-date>
```

`min` prevents the user from picking an end date before the start date at the UI level. Always also validate in the save chain (users can bypass UI validation by typing directly).

---

## 15. `oj-select-single` — Disabled Based on Condition

```html
<oj-select-single
  value="{{ $variables.selectedCrewData.resource_type }}"
  label-hint="Resource Type"
  data="[[ $variables.resourceTypesDP ]]"
  item-text="label"
  disabled="[[ !!$variables.selectedCrewData.cr_crews_id ]]">
</oj-select-single>
```

`!!` converts any truthy value to `true`. This disables the field once a crew ID exists (i.e. the crew has been saved and resource type cannot be changed).

---

## 16. `oj-bind-text` — Always Use Inside Templates

Inside `oj-table`, `oj-tab-bar`, `oj-bind-for-each`, and any `<template>` element, **never** use raw `[[ ]]` expression text. Always wrap in `<oj-bind-text>`:

```html
<!-- WRONG — does not render in JET template context -->
<span>[[ cell.row.name ]]</span>

<!-- CORRECT -->
<span>
  <oj-bind-text value="[[ cell.row.name ]]"></oj-bind-text>
</span>
```

Outside templates (in regular page HTML), raw `[[ ]]` works fine.

---

## 17. Flow-Level Variables (`main-flow.json`)

Variables can also be declared at the flow level — accessible to all pages within that flow. Declare them in `main-flow.json`:

```json
{
  "variables": {
    "assignmentsArray": {
      "type": "any[]",
      "defaultValue": []
    },
    "selectedAssignmentId": {
      "type": "string",
      "defaultValue": ""
    }
  }
}
```

Access from a flow page chain:
```js
const { $flow } = context;
$flow.variables.selectedAssignmentId = 'ASG-001';
```

Access from HTML:
```html
[[ $flow.variables.selectedAssignmentId ]]
```

**Use flow variables for:** state shared across multiple pages within the same flow (e.g. a selected record that multiple pages need to display).

---

## 18. Complete Component Import Reference

Add these to `imports.components` in any `.json` that uses them:

```json
"imports": {
  "components": {
    "oj-sp-general-overview-page": { "path": "oj-sp/general-overview-page/loader" },
    "oj-sp-messages-banner":       { "path": "oj-sp/messages-banner/loader" },
    "oj-sp-messages-toast":        { "path": "oj-sp/messages-toast/loader" },
    "oj-table":                    { "path": "ojs/ojtable" },
    "oj-tab-bar":                  { "path": "ojs/ojtabbar" },
    "oj-data-grid":                { "path": "ojs/ojdatagrid" },
    "oj-collapsible":              { "path": "ojs/ojcollapsible" },
    "oj-form-layout":              { "path": "ojs/ojformlayout" },
    "oj-input-text":               { "path": "ojs/ojinputtext" },
    "oj-input-search":             { "path": "ojs/ojinputsearch" },
    "oj-input-date":               { "path": "ojs/ojdatetimepicker" },
    "oj-select-single":            { "path": "ojs/ojselectsingle" },
    "oj-buttonset-one":            { "path": "ojs/ojbuttonset" },
    "oj-option":                   { "path": "ojs/ojoption" },
    "oj-button":                   { "path": "ojs/ojbutton" },
    "oj-switch":                   { "path": "ojs/ojswitch" },
    "oj-drawer-popup":             { "path": "ojs/ojdrawerpopup" },
    "oj-dialog":                   { "path": "ojs/ojdialog" },
    "oj-navigation-list":          { "path": "ojs/ojnavigationlist" },
    "oj-progress-bar":             { "path": "ojs/ojprogress" },
    "oj-progress-circle":          { "path": "ojs/ojprogress" },
    "oj-vb-content":               { "path": "vb/private/vx/ojvbcontent" },
    "oj-bind-if":                  { "path": "ojs/ojbindif" }
  }
}
```

**Rule:** `oj-bind-if`, `oj-bind-text`, `oj-bind-for-each`, and `oj-option` are built-in JET primitives that may not need explicit import in newer VBCS versions — but always declare them if the page fails to render.
