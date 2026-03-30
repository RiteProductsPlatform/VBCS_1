# VBCS Skillset — 05: Oracle JET Components

> All JET components used in VBCS must be declared in the page's `.json` file under
> `imports.components` before they can be used in `.html`.

---

## 1. Registering Components

```json
"imports": {
  "components": {
    "oj-data-grid":        { "path": "ojs/ojdatagrid" },
    "oj-collapsible":      { "path": "ojs/ojcollapsible" },
    "oj-sp-messages-banner": { "path": "oj-sp/messages-banner/loader" },
    "oj-sp-messages-toast":  { "path": "oj-sp/messages-toast/loader" },
    "oj-navigation-list":  { "path": "ojs/ojnavigationlist" },
    "oj-button":           { "path": "ojs/ojbutton" },
    "oj-input-text":       { "path": "ojs/ojinputtext" },
    "oj-input-date":       { "path": "ojs/ojdatetimepicker" },
    "oj-select-single":    { "path": "ojs/ojselectsingle" },
    "oj-drawer-popup":     { "path": "ojs/ojdrawerpopup" },
    "oj-dialog":           { "path": "ojs/ojdialog" }
  }
}
```

---

## 2. `oj-data-grid`

The primary component for spreadsheet-like time entry grids. Backed by a `DataGridProvider`.

### Minimal setup
```html
<oj-data-grid
  id="myDataGrid"
  data="[[ $variables.myDataGridProvider ]]"
  style="width: 100%; height: 500px;"
  scroll-policy="loadMoreOnScroll">
</oj-data-grid>
```

### Frozen (sticky) columns

**Rule:** `frozen-column-count` ONLY works when `scroll-policy="loadMoreOnScroll"`. With `scroll-policy="scroll"` (the default), the freeze option is silently ignored and greyed out in the right-click menu.

```html
<oj-data-grid
  id="myDataGrid"
  data="[[ $variables.myDataGridProvider ]]"
  scroll-policy="loadMoreOnScroll"
  frozen-column-count="{{ $variables.frozenColCount }}"
  on-frozen-column-count-changed="[[ $listeners.onFrozenColCountChanged ]]"
  header.column.freezable="enable"
  style="width: 100%; height: 500px;">
</oj-data-grid>
```

Required variable in `.json`:
```json
"frozenColCount": { "type": "number", "defaultValue": 2 }
```

Required chain for the `on-frozen-column-count-changed` event:
```js
async run(context, { event }) {
  context.$page.variables.frozenColCount = event.detail.value;
}
```

**Why two-way binding matters:** The `{{ }}` binding lets JET write back to the variable when the user drags a column freeze boundary. If you use `[[ ]]` (one-way), the visual position updates but the variable is not updated, causing the grid to snap back to the original position on re-render.

### Column headers and cell templates

```html
<oj-data-grid data="[[ $variables.myDP ]]" scroll-policy="loadMoreOnScroll">
  <template slot="columnHeaderContent" data-oj-as="cell">
    <span class="oj-typography-body-sm oj-typography-bold">
      [[ cell.data.label ]]
    </span>
  </template>
  <template slot="cellContent" data-oj-as="cell">
    <oj-input-text
      value="{{ cell.data }}"
      class="oj-form-control-inherit">
    </oj-input-text>
  </template>
</oj-data-grid>
```

---

## 3. `oj-collapsible`

Used to make sections of a page collapsible/expandable. The `expanded` attribute controls state.

### Collapsed by default
```html
<oj-collapsible expanded="false">
  <h3 slot="header">Combinations</h3>
  <div>
    <!-- collapsed content here -->
    <oj-data-grid ...></oj-data-grid>
  </div>
</oj-collapsible>
```

### Expanded by default
```html
<oj-collapsible expanded="true">
  <h3 slot="header">Resources</h3>
  <div> ... </div>
</oj-collapsible>
```

### Controlled by variable (two-way)
```html
<oj-collapsible expanded="{{ $variables.isCombinationsExpanded }}">
  <h3 slot="header">Combinations</h3>
  <div> ... </div>
</oj-collapsible>
```

**Rules:**
- The `slot="header"` element is mandatory. Without it, the collapsible renders no header.
- Use `expanded="false"` (not `expanded="{{ false }}"` — the literal string `false` is parsed correctly by JET).
- The `<h3>` heading should go inside the header slot. Moving it outside the `oj-collapsible` breaks the visual grouping.

---

## 4. `oj-sp-messages-banner`

Oracle Smart Page (SP) component for inline notification banners. Backed by an `ArrayDataProvider2`.

```html
<oj-sp-messages-banner
  data="[[ $variables.messagesBannerADP ]]"
  class="oj-flex-item oj-sm-12"
  on-sp-close="[[$listeners.messagesBannerSpClose]]">
</oj-sp-messages-banner>
```

**Rules:**
- `data` must be bound to an `ArrayDataProvider2` variable (not a plain array).
- `on-sp-close` fires when user clicks the × on a message. Wire it to a chain that removes the item from the ADP.
- The `on-sp-close` event payload contains `event.detail.messageId` — which is the `id` field of the message item as stored in the ADP.
- Display type is controlled by the `messageType` field on each data item: `general-success`, `general-error`, `general-warning`, `general-info`.

---

## 5. `oj-sp-messages-toast`

Floating transient toast notification. Simpler than the banner — just a string binding.

```html
<oj-sp-messages-toast
  primary-text="[[ $variables.messageToast ]]"
  id="messageToast">
</oj-sp-messages-toast>
```

To trigger: set `$page.variables.messageToast` to a string. To dismiss: set it back to empty string.

---

## 6. `oj-navigation-list`

Sidebar or drawer navigation. Each `<li id="...">` represents a nav item; the `id` drives routing.

```html
<oj-navigation-list
  class="oj-sm-width-full"
  selection="main"
  drill-mode="none"
  edge="start"
  on-selection-changed="[[ $listeners.onNavSelectionChanged ]]">
  <ul>
    <li id="main-crew-detail_copy">
      <a href="#">
        <span class="oj-ux-ico-contact-group oj-navigationlist-item-icon"></span>
        <span class="oj-navigationlist-item-label oj-typography-body-sm oj-typography-semi-bold">
          Crew Definition
        </span>
      </a>
    </li>
    <li id="main-datagrid_dev">
      <a href="#">
        <span class="oj-ux-ico-calendar oj-navigationlist-item-icon"></span>
        <span class="oj-navigationlist-item-label oj-typography-body-sm oj-typography-semi-bold">
          Timesheets
        </span>
      </a>
    </li>
  </ul>
</oj-navigation-list>
```

**Rules:**
- The `<li id>` must match the format `<flowId>-<pageId>`.
- `selection` should be set to the current active page ID (often a variable).
- Icons use Oracle UX icon classes: `oj-ux-ico-<icon-name>` on a `<span>` with class `oj-navigationlist-item-icon`.
- Label spans need the `oj-navigationlist-item-label` class to be styled correctly.

### Common Oracle UX icon classes
| Use case | Class |
|---|---|
| Crew/people | `oj-ux-ico-contact-group` |
| Calendar/timesheets | `oj-ux-ico-calendar` |
| Settings/config | `oj-ux-ico-settings` |
| Documents | `oj-ux-ico-documents` |
| Approval/review | `oj-ux-ico-check-square` |
| Equipment/construction | `oj-ux-ico-construction` |
| Close button | `oj-ux-ico-close` |
| Hamburger menu | `oj-ux-ico-menu` |

---

## 7. `oj-drawer-popup`

Side panel that slides in from an edge. Used for the hamburger menu.

```html
<oj-drawer-popup edge="end" opened="{{ $variables.isDrawerOpen }}">
  <div style="height: 100vh; padding: 24px;">
    <!-- drawer content -->
  </div>
</oj-drawer-popup>
```

**Rules:**
- `edge` can be `start`, `end`, `top`, or `bottom`.
- `opened` must use two-way binding `{{ }}` so the drawer can write back `false` when dismissed.
- Close the drawer programmatically: `$page.variables.isDrawerOpen = false`.

---

## 8. `oj-dialog` (Popup / Modal)

Used for confirmation dialogs and forms.

```html
<oj-dialog id="confirmDeleteDialog" dialog-title="Confirm Delete" cancel-behavior="icon">
  <div slot="body">
    <p>Are you sure you want to delete this item?</p>
  </div>
  <div slot="footer">
    <oj-button on-oj-action="[[ $listeners.confirmDeleteChain ]]">Confirm</oj-button>
    <oj-button chroming="outlined" on-oj-action="[[ $listeners.cancelDeleteChain ]]">Cancel</oj-button>
  </div>
</oj-dialog>
```

Open/close programmatically (from a chain):
```js
// Open
const dialog = document.getElementById('confirmDeleteDialog');
if (dialog) dialog.open();

// Close
const dialog = document.getElementById('confirmDeleteDialog');
if (dialog) dialog.close();
```

---

## 9. `oj-button`

```html
<!-- Standard button -->
<oj-button on-oj-action="[[ $listeners.saveChain ]]">Save</oj-button>

<!-- Borderless icon button -->
<oj-button chroming="borderless" display="icons" on-oj-action="[[ $listeners.closeChain ]]">
  <span slot="startIcon" class="oj-ux-ico-close"></span>
  <span>Close</span>
</oj-button>

<!-- Disabled state driven by variable -->
<oj-button disabled="[[ $variables.isSaving ]]">Save</oj-button>

<!-- Danger style (Oracle Redwood) -->
<oj-button chroming="callToAction" class="oj-button-confirm-danger">Delete</oj-button>
```

---

## 10. Oracle JET CSS Layout Utilities

JET provides a flexbox utility system via CSS classes:

```html
<!-- Full-width flex row -->
<div class="oj-flex">
  <div class="oj-flex-item oj-sm-12">Full width</div>
  <div class="oj-flex-item oj-sm-6">Half width</div>
</div>

<!-- Space between -->
<div class="oj-flex-bar">
  <div class="oj-flex-bar-start">Left</div>
  <div class="oj-flex-bar-end">Right</div>
</div>

<!-- Alignment -->
<div class="oj-flex oj-sm-align-items-center oj-sm-justify-content-space-between">
  ...
</div>
```

### Common spacing utilities
| Class | Effect |
|---|---|
| `oj-sm-padding-4x` | All-sides padding (medium) |
| `oj-sm-padding-4x-horizontal` | Left/right padding |
| `oj-sm-margin-4x-bottom` | Bottom margin |
| `oj-sm-margin-0` | Remove margin |

### Typography utilities
| Class | Use |
|---|---|
| `oj-typography-heading-sm` | Section headings |
| `oj-typography-body-sm` | Body text, nav labels |
| `oj-typography-bold` | Bold weight |
| `oj-typography-semi-bold` | Semi-bold weight |

---

## 11. Binding Expression Quick Reference

| Syntax | Use | Direction |
|---|---|---|
| `[[ expr ]]` | Read-only — component reads from variable | One-way (VB → component) |
| `{{ expr }}` | Read/write — component can update variable | Two-way (VB ↔ component) |
| `[[$listeners.chainName]]` | Wire event to action chain | — |
| `$variables.name` | Access page variables in HTML expressions | — |
| `$page.variables.name` | Same, available in both HTML and JS chain | — |
| `$application.path` | Base URL of the app (for images, resources) | — |
| `$event` | Event object in listener parameter binding | — |
