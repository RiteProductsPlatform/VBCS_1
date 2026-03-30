# VBCS Skillset — 01: Project Structure & Architecture

> Applies to: Oracle Visual Builder Cloud Service (VBCS) with Redwood theme.
> Framework version target: VBCS 23.x / 24.x with Oracle JET 15+.

---

## 1. Top-Level Directory Layout

A VBCS web application lives inside a `webApps/<appName>/` directory. The canonical structure is:

```
webApps/
  vbredwoodapp/
    app.json                  # Application-level metadata
    app.html                  # Application-level HTML wrapper
    pages/                    # Shell-page (the persistent outer frame)
      shell-page.html
      shell-page.js
      shell-page.json
      shell-page-chains/      # JS action chains owned by the shell page
        showNotificationMessage.js
        closeMessageBanner.js
        onNavSelectionChain.js
        ...
    flows/                    # Named navigation flows
      main/
        main-flow.json        # Flow-level router config
        pages/                # Pages within this flow
          main-crew-detail_copy-page.html
          main-crew-detail_copy-page.js
          main-crew-detail_copy-page.json
          main-crew-detail_copy-page-chains/   # JS chains for this page
            loadCrewsChain.js
            saveNewCrewChain.js
            deleteCrewChain.js
            ...
    services/                 # Backend service definitions
      CrewsService/
        openapi3.json         # OpenAPI 3 spec describing REST endpoints
    resources/
      images/
      css/
```

**Rule:** Every page is defined by a **trio** of files: `.html` (markup), `.js` (lifecycle hooks, computed functions), `.json` (variables, types, event listeners, component imports). Never create just one without the others.

---

## 2. Shell Page vs Flow Pages

### Shell Page (`pages/shell-page.*`)
- Rendered **once** and persists for the lifetime of the app session.
- Owns the top navigation header, the hamburger drawer, global notification banners, and the `<oj-vb-content>` router outlet.
- Variables declared in `shell-page.json` survive page-to-page navigation within flows.
- Use the shell page for **cross-page state**: notification queues, user session data, drawer open/close flags.

### Flow Pages (`flows/<flowName>/pages/<pageName>-page.*`)
- Each page in a flow is an independently routed view.
- Page variables are **scoped to the page** — they reset when you navigate away and back (unless persisted explicitly).
- Chains in `<pageName>-page-chains/` can only access their own page's `context.$page`.

**Rule:** Put state that needs to survive navigation in the shell page. Put state that is only relevant while on a specific screen in that page's variables.

---

## 3. The Page Trio: `.html`, `.js`, `.json`

### `<page>.html`
- Oracle JET component markup using custom HTML elements (`oj-*`).
- Data bindings use `[[ ]]` for one-way (read) and `{{ }}` for two-way (read/write).
- Event listeners use `on-<event-name>="[[$listeners.<chainName>]]"`.
- Component-level variables referenced as `$variables.<name>` in HTML context.
- Page-level variables referenced as `$page.variables.<name>` in inline expressions.

```html
<!-- One-way binding -->
<oj-input-text value="[[ $variables.crewName ]]"></oj-input-text>

<!-- Two-way binding (allows JET component to write back) -->
<oj-input-text value="{{ $variables.crewName }}"></oj-input-text>

<!-- Event listener wired to a chain -->
<oj-button on-oj-action="[[ $listeners.saveNewCrewChain ]]">Save</oj-button>
```

### `<page>.json`
Declares:
- `variables`: typed page variables with optional `defaultValue`
- `types`: custom object shapes used by variables and ADP
- `eventListeners`: maps DOM/framework events to action chains
- `imports.components`: JET components that must be registered before use

```json
{
  "variables": {
    "isLoading": { "type": "boolean", "defaultValue": false },
    "selectedCrewId": { "type": "number" }
  },
  "types": {
    "CrewType": {
      "cr_crews_id": "number",
      "crew_code": "string",
      "name": "string",
      "status": "string"
    }
  },
  "imports": {
    "components": {
      "oj-data-grid": { "path": "ojs/ojdatagrid" }
    }
  }
}
```

### `<page>.js`
- AMD module format (RequireJS `define()`).
- Exports a Page module with lifecycle methods: `pageActivated`, `pageDeactivated`, etc.
- Used for computed observables and helper functions called from HTML expressions.
- **Not** used for business logic — that lives in action chains.

```js
define(['vb/BusinessObjectsTransform'], (BusinessObjectsTransform) => {
  'use strict';
  class PageModule {
    formatDate(dateStr) {
      return dateStr ? dateStr.split('T')[0] : '';
    }
  }
  return PageModule;
});
```

---

## 4. Flow Configuration (`main-flow.json`)

The flow JSON maps page IDs to their file paths and defines the default start page.

```json
{
  "defaultPage": "main-crew-detail_copy",
  "pages": {
    "main-crew-detail_copy": {
      "path": "pages/main-crew-detail_copy-page"
    },
    "main-datagrid_dev": {
      "path": "pages/main-datagrid_dev-page"
    }
  }
}
```

**Rule:** The page ID in `main-flow.json` must exactly match the `<li id="...">` used in the shell-page navigation list and the chain names that navigate to it.

---

## 5. Navigation via `oj-navigation-list`

Navigation items in the shell page hamburger drawer use `<li id="<flowId>-<pageId>">`. The selection change event fires `onNavSelectionChanged`, which calls `onNavSelectionChain`.

```html
<oj-navigation-list
  selection="main"
  on-selection-changed="[[ $listeners.onNavSelectionChanged ]]">
  <ul>
    <li id="main-crew-detail_copy">
      <a href="#">
        <span class="oj-ux-ico-contact-group oj-navigationlist-item-icon"></span>
        <span class="oj-navigationlist-item-label">Crew Definition</span>
      </a>
    </li>
    <li id="main-datagrid_dev">
      <a href="#">
        <span class="oj-ux-ico-calendar oj-navigationlist-item-icon"></span>
        <span class="oj-navigationlist-item-label">Timesheets</span>
      </a>
    </li>
  </ul>
</oj-navigation-list>
```

The `<oj-vb-content>` tag in the shell page renders the active flow page:

```html
<oj-vb-content id="vbRouterContent" config="[[vbRouterFlow]]"></oj-vb-content>
```

**Rule:** To add a new page to the menu, you must do **three** things:
1. Add the `<li id="<flow>-<page>">` entry to the shell-page navigation list HTML.
2. Add the page definition to `main-flow.json`.
3. Create the page trio files (`.html`, `.js`, `.json`) and its chains directory.

---

## 6. Service Definitions (`services/<ServiceName>/openapi3.json`)

REST endpoints are described in OpenAPI 3 format. VBCS reads this at design time to generate typed `Actions.callRest` calls.

```json
{
  "openapi": "3.0.0",
  "info": { "title": "CrewsService", "version": "1.0" },
  "paths": {
    "/crews_v/": {
      "get": {
        "operationId": "getCrews",
        "parameters": [
          {
            "name": "_t",
            "in": "query",
            "required": false,
            "schema": { "type": "integer" }
          }
        ]
      },
      "post": {
        "operationId": "createCrew"
      }
    },
    "/crews_v/{CR_CREWS_ID}": {
      "put": {
        "operationId": "updateCrew",
        "parameters": [
          { "name": "CR_CREWS_ID", "in": "path", "required": true, "schema": { "type": "integer" } }
        ]
      }
    }
  }
}
```

**Rule:** If you add a query parameter (e.g. cache-busting `_t`) that is not declared in the OpenAPI spec, VBCS will silently strip it at runtime. Always declare every parameter you intend to use.

---

## 7. Key Naming Conventions

| Artefact | Convention | Example |
|---|---|---|
| Page ID | kebab-case, prefixed with flow | `main-crew-detail_copy` |
| Chain file | camelCase | `saveNewCrewChain.js` |
| Variable | camelCase | `selectedCrewId`, `isLoading` |
| Type | PascalCase | `CrewType`, `MessagesBannerType` |
| Service endpoint operationId | camelCase | `getCrews`, `createCrew` |
| JET component attribute | kebab-case | `frozen-column-count`, `scroll-policy` |
| JET component event listener | `on-<event>` | `on-oj-action`, `on-selection-changed` |
