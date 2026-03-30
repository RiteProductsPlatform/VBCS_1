# VBCS Skillset — 08: Debugging, Navigation & Variable Types

---

## 1. Reading the VBCS Browser Console

VBCS emits structured log messages to the browser console. Every log entry follows the format:

```
[VB (LEVEL), /vb/path/to/module]: Message text       source.js:lineNumber
```

### Log levels

| Level | Colour | Meaning |
|---|---|---|
| `INFO` | Blue | Normal execution — chain started/ended, action called, variable assigned |
| `WARN` | Yellow | Non-fatal issue — often missing keys, undeclared params, unresolved references |
| `ERROR` | Red | Failure — action failed, ADP mutation rejected, REST call error |

### Most important log categories and what they mean

#### `/vb/action/actionChain`
Chain execution trace. Each line shows what step is running:
```
[VB (INFO), /vb/action/actionChain]: Chain loadCrewsChain starting action
  Actions.callRest [Actions.callRest_abc123] with parameters: {endpoint: 'CrewsService/getCrews', ...}

[VB (INFO), /vb/action/actionChain]: Chain loadCrewsChain ending action
  Actions.callRest [Actions.callRest_abc123] with result undefined (completed in 227 ms)
```
Use these to trace exactly which step in a chain is running and how long each takes.

#### `/vb/action/builtin/assignVariablesAction`
Fires every time a variable is set. Shows the variable path and new value:
```
[VB (INFO), /vb/action/builtin/assignVariablesAction]: Action
  Actions.assignVariable assigning variable $page.variables['isLoading'] to true
```
Use this to verify variables are being set to the expected values at the right time.

#### `/vb/private/stateManagement/fireNotificationEventAction`
Fired by JSON-based `fireNotificationEventAction`. Shows the notification type and `displayMode`:
```
[VB (INFO), /vb/private/stateManagement/fireNotificationEventAction]:
  FireNotificationEventAction confirmation transient
```
If this line shows `transient`, the JSON chain correctly passed `displayMode`. If you see `undefined`, check your JSON chain parameters.

#### `/vb/private/stateManagement/fireDataProviderEventAction`
Shows ADP mutation events:
```
[VB (INFO), /vb/private/stateManagement/fireDataProviderEventAction]:
  FireDataProviderEventAction called with a mutation event for operations:
  ["add"] and payloads: [{"data":{"messageType":"general-success",...,"id":"3"}}]
```

**Warning to watch for:**
```
[VB (WARN), /vb/private/stateManagement/fireDataProviderEventAction]:
  No keys were specified in the event payload for the mutation operation add.
  Attempting to build keys from data.
```
This is harmless — VBCS is inferring the key from `keyAttributes`. Not a bug.

**Error to watch for:**
```
[VB (ERROR), /vb/types/ArrayDataProvider2]: Unable to dispatch the mutation event
  due to inadequate or inaccurate information to perform the operation,
  {"remove":{"data":[],"keys":["3"]}}

[VB (ERROR)]: event was raised but a valid payload was not provided!
```
Root causes: key not found in ADP (key type mismatch, stale context, ADP reset). See Doc 03.

#### `/vb/private/helpers/Rest`
Low-level HTTP trace. Shows the actual fetch request and response:
```
[VB (INFO), /vb/private/helpers/Rest]: Starting native fetch with parameters:
  {method: 'GET', url: 'https://host/ords/schema/crews_v/?_t=1774372441375', ...}

[VB (INFO), /vb/private/helpers/Rest]: Ending native fetch with response
  {type: 'cors', url: '...', redirected: false, status: 200, ok: true, ...}
```
Use this to verify: (a) the correct URL is being called, (b) query params are included, (c) HTTP status code.

#### `/vb/private/services/servicesManager`
Shows service resolution warnings:
```
[VB (WARN), /vb/private/services/servicesManager]: Resolving not fully qualified
  endpoint reference: {"endpoint":"base:CrewsService/getCrews",...}
```
Harmless — VBCS is resolving a short endpoint reference to its full form.

#### `/vb/types/ArrayDataProvider2`
ADP state changes:
```
[VB (INFO), /vb/types/ArrayDataProvider2]: data property for ADP variable
  messagesBannerADP has changed! old data: Array(1) new data: (2) [{…}, {…}]
```
Use this to confirm items are being added to or removed from an ADP correctly.

#### `/vb/stateManagement/container`
Page-level container events:
```
[VB (INFO), /vb/stateManagement/container]: Page main-crew-detail_copy
  handling component event executeDeleteChain with payload: {...}

[VB (INFO), /vb/stateManagement/container]: Page main-crew-detail_copy
  handled component event executeDeleteChain successfully (completed in 984 ms)
```
Use to measure total chain execution time and confirm the correct page handled an event.

---

## 2. Debugging Workflow

### Step 1 — Isolate which chain is running
Filter the console by searching for the chain name. VBCS logs every chain start and end.

### Step 2 — Confirm variables are set correctly
Search for `assignVariable` entries for the variable you care about.

### Step 3 — Confirm REST calls reach the server
Search for `native fetch` entries. Verify URL, method, and status code. If the URL is wrong, check `uriParams` in `callRest` and the OpenAPI spec path template.

### Step 4 — Confirm ADP mutations succeed
Search for `FireDataProviderEventAction` entries. If you see `data: []` in a remove payload, the key was not found.

### Step 5 — Add diagnostic `console.log` to JS chains
For chains not producing expected behaviour, add temporary logs:
```js
console.log('[myChain] Starting. Variables:', JSON.stringify({
  viewMode: $page.variables.viewMode,
  selectedCrewId: $page.variables.selectedCrewId,
}));
```
Remove all diagnostic logs before going to production.

### Common misread: completed time vs wall clock
```
Chain loadCrewsChain ending ... (completed in 227 ms)
```
This is the time from chain start to the specific action's end — not the total elapsed time since the user action. Multiple chains can run concurrently; the log timestamps indicate actual order.

---

## 3. Navigation Internals

### How the shell-page router works

The shell page uses `oj-vb-content` as the router outlet:

```html
<oj-vb-content id="vbRouterContent" config="[[vbRouterFlow]]"></oj-vb-content>
```

`vbRouterFlow` is a shell-page variable of type `object`:
```json
"vbRouterFlow": {
  "type": "object",
  "defaultValue": { "flowId": "main" }
}
```

When the user selects a navigation item, `onNavSelectionChanged` fires with `event.detail.value` = the selected `<li>` id (e.g. `"main-crew-detail_copy"`).

### `onNavSelectionChain.js` — how routing actually works

```js
async run(context, { pageId }) {
  const { $page } = context;

  // pageId is the full <li> id: "main-crew-detail_copy"
  // Split to get flowId and pageId
  const parts = pageId.split('-');
  // For "main-crew-detail_copy": flowId = "main", page = "crew-detail_copy"

  // Navigate by updating the vbRouterFlow variable
  $page.variables.vbRouterFlow = {
    flowId: 'main',
    pageId: pageId.replace('main-', '')  // strip the flow prefix
  };

  // Close the drawer after navigation
  $page.variables.isDrawerOpen = false;
}
```

**Rule:** Navigation is driven by assigning a new `{ flowId, pageId }` object to the `vbRouterFlow` variable. The `oj-vb-content` component observes this variable and loads the corresponding page.

### Adding a new page to navigation — complete checklist

1. Create page files: `flows/main/pages/<pageId>-page.html/.js/.json` and `<pageId>-page-chains/` directory.
2. Register page in `flows/main/main-flow.json`:
   ```json
   "<pageId>": { "path": "pages/<pageId>-page" }
   ```
3. Add nav item in `shell-page.html`:
   ```html
   <li id="main-<pageId>">
     <a href="#">
       <span class="oj-ux-ico-<icon> oj-navigationlist-item-icon"></span>
       <span class="oj-navigationlist-item-label ...">Page Label</span>
     </a>
   </li>
   ```
4. Ensure `onNavSelectionChain` handles the new `pageId` correctly (usually automatic if it uses the split/replace pattern above).

---

## 4. Variable Types In Depth

### Primitive types

```json
"myString":  { "type": "string",  "defaultValue": "" }
"myNumber":  { "type": "number",  "defaultValue": 0 }
"myBoolean": { "type": "boolean", "defaultValue": false }
"myAny":     { "type": "any",     "defaultValue": null }
```

### Array types

```json
"crewsArray": {
  "type": "array",
  "defaultValue": []
}

"namesArray": {
  "type": "string[]",
  "defaultValue": []
}
```

Access in chain: `$page.variables.crewsArray.push(item)` — but direct mutation via `push` may not trigger JET reactivity. Prefer reassignment:

```js
$page.variables.crewsArray = [...$page.variables.crewsArray, newItem];
```

### Object type with a declared custom type

Define the shape in `types`, then reference it:

```json
"types": {
  "CrewDataType": {
    "cr_crews_id": "number",
    "crew_code": "string",
    "name": "string",
    "status": "string",
    "start_date": "string",
    "end_date": "string",
    "activeFlag": "boolean",
    "persons_count": "number",
    "equipment_count": "number"
  }
},
"variables": {
  "selectedCrewData": {
    "type": "CrewDataType",
    "defaultValue": {
      "cr_crews_id": 0,
      "crew_code": "",
      "name": "",
      "status": "Active",
      "activeFlag": true,
      "persons_count": 0,
      "equipment_count": 0
    }
  }
}
```

Access in chain: `$page.variables.selectedCrewData.crew_code`

Assign a full object:
```js
$page.variables.selectedCrewData = {
  cr_crews_id: body.CR_CREWS_ID,
  crew_code: body.CREW_CODE,
  name: body.NAME,
  status: body.STATUS,
  activeFlag: body.STATUS !== 'Inactive',
  start_date: (body.START_DATE || '').split('T')[0],
  end_date: (body.END_DATE || '').split('T')[0],
  persons_count: 0,
  equipment_count: 0,
};
```

### Object type with unknown/dynamic shape

Use `type: "object"` for untyped objects or when the shape is dynamic:

```json
"formData": { "type": "object", "defaultValue": {} }
```

Or use `type: "any"` for maximum flexibility (no type checking):

```json
"rawResponse": { "type": "any", "defaultValue": null }
```

### `vb/ArrayDataProvider2` type

Special VBCS type. Not a plain array — it is a JET reactive data provider.

```json
"myADP": {
  "type": "vb/ArrayDataProvider2",
  "defaultValue": {
    "itemType": "MyItemType",
    "keyAttributes": "id"
  }
}
```

Rules (from Doc 03): never reassign the variable; always mutate via `fireDataProviderEvent`.

### Deep object mutation — use spread or reassignment

VBCS tracks reactivity at the variable level, not deep property level. When you mutate a nested property, the UI may not update unless you reassign the top-level variable:

```js
// May NOT trigger reactivity:
$page.variables.selectedCrewData.name = 'New Name';

// SAFE — triggers reactivity by creating a new object reference:
$page.variables.selectedCrewData = {
  ...$page.variables.selectedCrewData,
  name: 'New Name',
};
```

**Exception:** `$page.variables.myADP` — always use `fireDataProviderEvent`, never spread/reassign.

---

## 5. Saving and Restoring State (Dirty-Check Pattern)

When you need to detect unsaved changes, keep a deep copy of the original state and compare:

```js
// After loading data from REST
$page.variables.selectedCrewData = parsedData;
$page.variables.selectedCrewData_original = JSON.parse(JSON.stringify(parsedData));

// To check for unsaved changes
const isDirty = JSON.stringify($page.variables.selectedCrewData)
  !== JSON.stringify($page.variables.selectedCrewData_original);

// After successful save — update the baseline
$page.variables.selectedCrewData_original =
  JSON.parse(JSON.stringify($page.variables.selectedCrewData));
```

**Rule:** `JSON.parse(JSON.stringify(...))` creates a deep clone that is disconnected from the original. Never use `Object.assign` or spread for deep clone — these are shallow and will share nested object references.

---

## 6. Common Console Log Patterns and Diagnoses

### Pattern: Chain never fires
**Log:** No chain start/end logs appear for the expected chain.
**Diagnosis:** Event listener not wired in `.json`, or the component event name is wrong.
**Fix:** Check `eventListeners` in `.json`. Confirm the `on-<event>` attribute matches the event name.

### Pattern: REST call returns 304 with empty body
**Log:** `/vb/private/helpers/Rest` shows `status: 304` and the data variable is not updated.
**Diagnosis:** Browser cached the GET response. Cache-busting not in place.
**Fix:** Add `_t: Date.now()` to `uriParams`, declare `_t` in OpenAPI spec.

### Pattern: Variable assigned but UI not updating
**Log:** `assignVariablesAction` confirms the new value, but the component still shows the old value.
**Diagnosis:** Shallow mutation of a nested property without triggering reactivity.
**Fix:** Reassign the top-level variable using spread: `{ ...$page.variables.obj, field: newVal }`.

### Pattern: Notification shows wrong colour (red instead of green)
**Log:** `showNotificationMessage` entry shows `messageType=general-error` for a success case.
**Diagnosis:** Chain set `severity: 'confirmation'` but not `type: 'confirmation'`. The shell chain read `event.type` which was `undefined` or `'error'`.
**Fix:** Set both `severity: 'confirmation'` and `type: 'confirmation'` in the notification call.

### Pattern: Chain called but payload is empty (`{}`)
**Log:** `deleteCrewChain: Missing or empty payload in params, falling back to page variables`.
**Diagnosis:** The chain was invoked via `callChain` without parameters, or the calling JSON chain did not pass parameters correctly.
**Fix:** Use defensive extraction: `const payload = params ? (params.payload || params) : null`. Add fallback to a page variable.

### Pattern: REST call URL has no query params despite setting `uriParams`
**Log:** `/vb/private/helpers/Rest` shows the URL without the expected `?param=value`.
**Diagnosis:** The parameter is not declared in `openapi3.json`.
**Fix:** Add the parameter to the OpenAPI spec under the correct path and method.

### Pattern: `oj-data-grid` freeze option greyed out
**Symptom:** Right-click context menu shows freeze option but it is disabled/greyed.
**Diagnosis:** `scroll-policy` is not `"loadMoreOnScroll"`.
**Fix:** Add `scroll-policy="loadMoreOnScroll"` to the `oj-data-grid` element.

---

## 7. Application-Level Variables

For state that must survive across ALL pages and flows (e.g. logged-in user info), declare variables in `app.json`:

```json
{
  "variables": {
    "currentUser": {
      "type": "object",
      "defaultValue": null
    },
    "appTitle": {
      "type": "string",
      "defaultValue": "CrewRite"
    }
  }
}
```

Access from any chain:
```js
const user = context.$application.variables.currentUser;
```

Access from HTML:
```html
[[ $application.variables.currentUser.name ]]
```

**Rule:** Use application variables sparingly. Most state belongs at the page or shell level. Application variables are appropriate only for user session data and app-wide configuration that is set once at startup.

---

## 8. Performance Considerations

### Avoid large arrays in page variables
Page variables are observed by the JET reactivity system. Arrays with thousands of items cause slow re-renders on every change. Keep raw data in an unobserved cache and expose only filtered/paginated subsets to the UI.

```js
// Store all data here (raw, not reactive-observed)
$page.variables.rawCrewsArray = result.body.items;

// Expose filtered subset to the UI list
$page.variables.crewsArray = rawCrewsArray.filter(c => c.STATUS === activeFilter);
```

### Use `scroll-policy="loadMoreOnScroll"` on `oj-data-grid`
This activates virtual scrolling — only renders visible rows. Without it, all rows render at once, which is slow for large datasets.

### Chain parallelism with `Promise.all`
When two REST calls are independent, run them in parallel:

```js
// Sequential (slow — waits for each before starting next)
await Actions.callRest(context, { endpoint: 'ServiceA/getA' });
await Actions.callRest(context, { endpoint: 'ServiceB/getB' });

// Parallel (fast — both run simultaneously)
const [resultA, resultB] = await Promise.all([
  Actions.callRest(context, { endpoint: 'ServiceA/getA' }),
  Actions.callRest(context, { endpoint: 'ServiceB/getB' }),
]);
```

Note: `Actions.callChain` cannot be used inside `Promise.all` — it requires sequential execution within the VBCS runtime. Use `Promise.all` only for `Actions.callRest` and native async operations.
