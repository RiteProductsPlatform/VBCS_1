---
trigger: always_on
---

## 🧱 Buttons & Actions
```html
<oj-button></oj-button>
<oj-split-button></oj-split-button>
<oj-menu-button></oj-menu-button>
<oj-toolbar></oj-toolbar>
```
**Common Attributes:**
- `chroming`: "solid" | "outlined" | "callToAction" | "borderless"
- `display`: "all" | "icons" | "label"
- `disabled`: boolean
- `on-oj-action`: event handler
**Example:**
```html
<oj-button chroming="callToAction" on-oj-action="[[$listeners.handleClick]]">
  <span slot="startIcon" class="oj-ux-ico-plus"></span>
  Create New
</oj-button>
```
---
## ✏️ Text & Input Fields
```html
<oj-input-text></oj-input-text>
<oj-input-password></oj-input-password>
<oj-input-number></oj-input-number>
<oj-text-area></oj-text-area>
<oj-input-search></oj-input-search>
```
**Common Attributes:**
- `value`: binding to variable `{{ $variables.myValue }}`
- `label-hint`: string label
- `placeholder`: string
- `required`: boolean
- `readonly`: boolean
- `disabled`: boolean
- `help.instruction`: help text
**Example:**
```html
<oj-input-text 
  label-hint="Email Address" 
  value="{{ $variables.email }}"
  placeholder="user@example.com"
  required="true">
</oj-input-text>
```
---
## 📅 Date & Time Inputs
```html
<oj-input-date></oj-input-date>
<oj-input-date-time></oj-input-date-time>
<oj-input-time></oj-input-time>
```

**Common Attributes:**
- `value`: date binding
- `min`: minimum date
- `max`: maximum date
- `converter`: date format converter

**Example:**
```html
<oj-input-date 
  label-hint="Start Date"
  value="{{ $variables.startDate }}"
  converter='{"type": "datetime", "options": {"formatType":"date","dateFormat":"medium"}}'>
</oj-input-date>
```

---

## 🔽 Dropdowns & Selectors

```html
<oj-select-single></oj-select-single>
<oj-select-multiple></oj-select-multiple>
<oj-combobox-one></oj-combobox-one>
<oj-combobox-many></oj-combobox-many>
```

**Common Attributes:**
- `data`: ArrayDataProvider
- `value`: selected value binding
- `item-text`: field name for display
- `placeholder`: string
- `on-value-changed`: event handler

**Example:**
```html
<oj-select-single 
  label-hint="Category"
  data="[[ $variables.categoriesDP ]]"
  value="{{ $variables.selectedCategory }}"
  item-text="label">
</oj-select-single>
```

---

## ☑️ Checkboxes, Radios & Toggles

```html
<oj-checkboxset></oj-checkboxset>
<oj-radioset></oj-radioset>
<oj-switch></oj-switch>
```

**Common Attributes:**
- `value`: binding to array (checkboxset) or string (radioset)
- `disabled`: boolean
- `on-value-changed`: event handler

**Example:**
```html
<oj-checkboxset value="{{ $variables.selectedOptions }}">
  <oj-option value="option1">Option 1</oj-option>
  <oj-option value="option2">Option 2</oj-option>
</oj-checkboxset>

<oj-switch 
  label-hint="Enable Feature"
  value="{{ $variables.featureEnabled }}">
</oj-switch>
```

---

## 📎 File Upload

```html
<oj-file-picker></oj-file-picker>
```

**Common Attributes:**
- `accept`: array of MIME types
- `selection-mode`: "single" | "multiple"
- `on-oj-select`: event handler

**Example:**
```html
<oj-file-picker 
  accept="['.pdf', '.doc', '.docx']"
  selection-mode="multiple"
  on-oj-select="[[$listeners.handleFileSelect]]">
  <span slot="trigger">
    <oj-button>Upload Files</oj-button>
  </span>
</oj-file-picker>
```

---

## 📊 Tables & Data Grids

```html
<oj-table></oj-table>
<oj-data-grid></oj-data-grid>
<oj-list-view></oj-list-view>
<oj-tree-view></oj-tree-view>
<oj-masonry-layout></oj-masonry-layout>
```

**Common Attributes:**
- `data`: ArrayDataProvider
- `columns`: array of column definitions
- `selection-mode`: object with row/column settings
- `edit-mode`: "none" | "rowEdit"
- `scroll-policy`: "loadMoreOnScroll" | "loadAll"

**Example:**
```html
<oj-table 
  data="[[ $variables.employeesDP ]]"
  columns='[
    {"headerText":"Name","field":"name"},
    {"headerText":"Email","field":"email"}
  ]'
  selection-mode.row="single"
  on-oj-before-row-edit="[[$listeners.beforeEdit]]">
</oj-table>
```

---

## 🧭 Navigation Components

```html
<oj-navigation-list></oj-navigation-list>
<oj-tab-bar></oj-tab-bar>
<oj-breadcrumbs></oj-breadcrumbs>
<oj-train></oj-train>
<oj-menu></oj-menu>
```

**Common Attributes:**
- `data`: navigation data
- `selection`: selected item
- `edge`: "top" | "start"
- `on-selection-changed`: event handler

**Example:**
```html
<oj-tab-bar 
  selection="{{ $variables.selectedTab }}"
  on-selection-changed="[[$listeners.tabChanged]]">
  <ul>
    <li id="tab1"><a href="#">Overview</a></li>
    <li id="tab2"><a href="#">Details</a></li>
  </ul>
</oj-tab-bar>
```

---

## 🪟 Dialogs, Popups & Drawers

```html
<oj-dialog></oj-dialog>
<oj-popup></oj-popup>
<oj-drawer-layout></oj-drawer-layout>
```

**Common Attributes:**
- `dialog-title`: string
- `cancel-behavior`: "icon" | "escape" | "none"
- `modality`: "modal" | "modeless"

**Example:**
```html
<oj-dialog 
  id="confirmDialog"
  dialog-title="Confirm Action"
  cancel-behavior="icon">
  <div slot="body">
    Are you sure you want to proceed?
  </div>
  <div slot="footer">
    <oj-button on-oj-action="[[$listeners.cancel]]">Cancel</oj-button>
    <oj-button chroming="callToAction" on-oj-action="[[$listeners.confirm]]">Confirm</oj-button>
  </div>
</oj-dialog>
```

**Open/Close:**
```javascript
// Open
await Actions.callComponentMethod(context, {
  selector: '#confirmDialog',
  method: 'open'
});

// Close
await Actions.callComponentMethod(context, {
  selector: '#confirmDialog',
  method: 'close'
});
```

---

## 📦 Cards, Panels & Containers

```html
<oj-card></oj-card>
<oj-panel></oj-panel>
<oj-accordion></oj-accordion>
<oj-collapsible></oj-collapsible>
```

**Example:**
```html
<oj-collapsible expanded="true">
  <span slot="header">Section Title</span>
  <div>
    Content goes here
  </div>
</oj-collapsible>
```

---

## 📈 Charts & Visualizations

```html
<oj-chart></oj-chart>
<oj-spark-chart></oj-spark-chart>
<oj-diagram></oj-diagram>
<oj-thematic-map></oj-thematic-map>
<oj-gauge></oj-gauge>
<oj-progress-bar></oj-progress-bar>
<oj-progress-circle></oj-progress-circle>
```

**Common Attributes:**
- `type`: "bar" | "line" | "pie" | "area"
- `data`: chart data provider
- `orientation`: "horizontal" | "vertical"

**Example:**
```html
<oj-chart
  type="bar"
  data="[[ $variables.chartDataDP ]]"
  orientation="vertical">
</oj-chart>

<oj-progress-bar 
  value="{{ $variables.progress }}"
  max="100">
</oj-progress-bar>
```

---

## 🔔 Messages, Alerts & Feedback

```html
<oj-messages></oj-messages>
<oj-message-toast></oj-message-toast>
<oj-message-banner></oj-message-banner>
```

**Fire Notification Event:**
```javascript
await Actions.fireNotificationEvent(context, {
  summary: 'Success',
  message: 'Operation completed successfully',
  type: 'confirmation',
  displayMode: 'transient'
});
```

**Types:** `confirmation` | `info` | `warning` | `error`
---

## 🏷️ Badges, Icons & Avatars

```html
<oj-badge></oj-badge>
<oj-avatar></oj-avatar>
<oj-icon></oj-icon>
```

**Example:**
```html
<oj-badge value="5" size="sm"></oj-badge>

<oj-avatar 
  initials="JD"
  size="xs">
</oj-avatar>

<span class="oj-ux-ico-plus"></span>
```

**Common Icons:**
- `oj-ux-ico-plus` - Add/Create
- `oj-ux-ico-trash` - Delete
- `oj-ux-ico-edit` - Edit
- `oj-ux-ico-save` - Save
- `oj-ux-ico-search` - Search
- `oj-ux-ico-filter` - Filter
- `oj-ux-ico-download` - Download
- `oj-ux-ico-upload` - Upload
- `oj-ux-ico-close` - Close
- `oj-ux-ico-check` - Check/Success
- `oj-ux-ico-error` - Error
- `oj-ux-ico-warning` - Warning
- `oj-ux-ico-info` - Information

---

## 🧠 Tooltips & Help

```html
<oj-tooltip></oj-tooltip>
```

**Example:**
```html
<oj-button id="myButton">Hover Me</oj-button>
<oj-tooltip target="#myButton">
  This is helpful information
</oj-tooltip>
```

---

## 🧱 Layouts & Responsive Grids

```html
<oj-flex></oj-flex>
<oj-flex-item></oj-flex-item>
<oj-responsive-layout></oj-responsive-layout>
<oj-spacer></oj-spacer>
```

**Example:**
```html
<div class="oj-flex">
  <div class="oj-flex-item oj-sm-12 oj-md-6">
    Half width on medium+, full width on small
  </div>
  <div class="oj-flex-item oj-sm-12 oj-md-6">
    Half width on medium+, full width on small
  </div>
</div>
```

**Responsive Classes:**
- `oj-sm-12` - Full width on small screens
- `oj-md-6` - Half width on medium screens
- `oj-lg-4` - Third width on large screens
- `oj-sm-margin-4x-top` - Top margin
- `oj-sm-padding-2x` - Padding
- `oj-sm-gap-2` - Gap between flex items

---

## 📜 Binding & Rendering

```html
<oj-bind-text></oj-bind-text>
<oj-bind-dom></oj-bind-dom>
<oj-bind-for-each></oj-bind-for-each>
<oj-bind-if></oj-bind-if>
```

**Example:**
```html
<!-- Display text -->
<oj-bind-text value="[[ $variables.userName ]]"></oj-bind-text>

<!-- Conditional rendering -->
<oj-bind-if test="[[ $variables.showContent ]]">
  <div>Content shown when true</div>
</oj-bind-if>

<!-- Loop through array -->
<oj-bind-for-each data="[[ $variables.items ]]">
  <template data-oj-as="item">
    <div>
      <oj-bind-text value="[[ item.data.name ]]"></oj-bind-text>
    </div>
  </template>
</oj-bind-for-each>
```

**Binding Syntax:**
- `[[ ]]` - One-way (read-only)
- `{{ }}` - Two-way (mutable)
- `:attribute="[[ ]]"` - Dynamic attribute binding

---

## 🔁 Paging & Scrolling

```html
<oj-paging-control></oj-paging-control>
<oj-infinite-scroll></oj-infinite-scroll>
```

**Example:**
```html
<oj-paging-control 
  data="[[ $variables.dataProvider ]]"
  page-size="10">
</oj-paging-control>
```

---

## 🧬 Forms & Validation

```html
<oj-form-layout></oj-form-layout>
<oj-validation-group></oj-validation-group>
```

**Example:**
```html
<oj-form-layout 
  max-columns="2"
  label-edge="top"
  direction="row">
  <oj-input-text 
    label-hint="First Name"
    value="{{ $variables.firstName }}"
    required="true">
  </oj-input-text>
  
  <oj-input-text 
    label-hint="Last Name"
    value="{{ $variables.lastName }}"
    required="true">
  </oj-input-text>
</oj-form-layout>
```
---
## 🔧 Utilities & Helpers

```html
<oj-context-menu></oj-context-menu>
<oj-shortcut></oj-shortcut>
<oj-idle-monitor></oj-idle-monitor>
```

---

## 🎥 Media

```html
<oj-video></oj-video>
<oj-audio></oj-audio>
```

---

## 🧩 Advanced / Enterprise UI

```html
<oj-waterfall-layout></oj-waterfall-layout>
<oj-sticky-header></oj-sticky-header>
<oj-defer></oj-defer>
```

---

## ⚙️ Dynamic & Composite Components

```html
<oj-composite></oj-composite>
<oj-module></oj-module>
```

---

## 📋 REDWOOD SPECIFIC COMPONENTS

```html
<!-- Redwood Page Templates -->
<oj-sp-welcome-page></oj-sp-welcome-page>
<oj-sp-simple-create-edit></oj-sp-simple-create-edit>

<!-- Redwood Cards -->
<oj-sp-card></oj-sp-card>

<!-- Redwood Components -->
<oj-c-card-view></oj-c-card-view>
```

**Example:**
```html
<oj-sp-welcome-page 
  page-title="My Dashboard"
  description-text="Welcome back!">
  <div slot="main">
    Main content here
  </div>
</oj-sp-welcome-page>
```

---

## 🎨 COMMON CSS UTILITY CLASSES

### Spacing
```css
.oj-sm-margin-2x-top
.oj-sm-margin-4x-bottom
.oj-sm-padding-2x
.oj-sm-padding-4x-horizontal
```

### Layout
```css
.oj-flex
.oj-flex-item
.oj-sm-12 (full width)
.oj-md-6 (half width)
.oj-lg-4 (third width)
.oj-sm-align-items-center
.oj-sm-justify-content-center
.oj-sm-justify-content-space-between
.oj-sm-flex-direction-column
.oj-sm-flex-wrap-wrap
```

### Typography
```css
.oj-typography-heading-lg
.oj-typography-heading-md
.oj-typography-heading-sm
.oj-typography-body-lg
.oj-typography-body-md
.oj-typography-body-sm
.oj-typography-bold
```

### Colors
```css
.oj-text-color-primary
.oj-text-color-secondary
.oj-text-color-disabled
.oj-bg-neutral-0
.oj-bg-neutral-20
```

---

## 🔗 USEFUL LINKS

- **Oracle JET Documentation**: https://www.oracle.com/webfolder/technetwork/jet/index.html
- **Oracle JET Cookbook**: https://www.oracle.com/webfolder/technetwork/jet/jetCookbook.html
- **Redwood Design System**: https://redwood.oracle.com/
- **VBCS Documentation**: https://docs.oracle.com/en/cloud/paas/app-builder-cloud/

---