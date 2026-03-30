---
trigger: always_on
---

## 💡 VBCS BEST PRACTICES

### 1. Data Binding & Reactivity
```javascript
// ONE-WAY (read-only)
[[ $variables.myValue ]]

// TWO-WAY (mutable form inputs)
{{ $variables.myValue }}

// DYNAMIC ATTRIBUTES
:disabled="[[ $variables.isFetching ]]"
:class="[[ { 'oj-bg-danger-30': hasError } ]]"
```

**Array & Object Reactivity Rules:**
VBCS will NOT detect nested changes or simple `.push()` calls. You MUST create a new reference to trigger a UI re-render.
```javascript
// ❌ WRONG (Mutating existing reference)
$variables.myArray.push(newItem);
$variables.myObject.status = 'ACTIVE';

// ✅ CORRECT (Creating new reference using spread syntax)
$variables.myArray = [...$variables.myArray, newItem];

$variables.myObject = {
  ...$variables.myObject,
  status: 'ACTIVE'
};
```

---

## 🏗️ 2. UI Components & Redwood Standards

### Input & Form Components
- **NEVER** use raw HTML (`<input>`, `<select>`).
- **ALWAYS** use Redwood/JET components (`oj-input-text`, `oj-select-single`, `oj-input-number`, `oj-switch`).
- **Labels**: You **must** define `label-hint="Your Label"` and `label-edge="inside"` for a modern Redwood appearance.
- **Buttons**: Never put `oj-bind-text` directly inside an `<oj-button>`. Always wrap the text natively in `<span>My Text</span>`.

### Tables and Data Providers (ADPs)
- **ADPs via Code**: 
  ```javascript
  const ArrayDataProvider = await ActionUtils.getModuleLoader().require('ojs/ojarraydataprovider');
  $variables.myDP = new ArrayDataProvider($variables.myArray, { keyAttributes: 'id' });
  ```
- **Declarative ADPs**: Prefer defining variables of type `vb/ArrayDataProvider2` in the page JSON, passing `$variables.cachedDataArray` as its data source. 

### Empty States & Loading Spinners
- **Selection Dropdowns / Tables**: If data might be empty, always provide a `noData` or `emptyText` slot to guide the user.
  ```html
  <oj-select-single data="[[ $variables.myADP ]]">
      <template slot="noData">
          <div class="oj-flex oj-sm-align-items-center">
              <span class="oj-ux-ico-info oj-sm-margin-2x-end"></span>
              <span>No results found.</span>
          </div>
      </template>
  </oj-select-single>
  ```
- **Loading UI**: Use `isFetching...` variables strictly. Wrap progress elements in simple tests:
  ```html
  <oj-bind-if test="[[ $variables.isFetching ]]">
      <oj-progress-circle value="-1" size="sm"></oj-progress-circle>
  </oj-bind-if>
  ```

---

## 📄 3. Pages & Layout Structure

### Redwood Page Templates
- Whenever creating structural views, start with common Redwood structural containers like `<oj-sp-welcome-page>` or `<oj-sp-general-overview-page>`.
- **Layout Flow**: Structure custom views using the Oracle forms flex system `class="oj-flex oj-sm-flex-direction-column"` combined with atomic spacing classes like `oj-sm-margin-4x-bottom`. Do NOT use inline CSS hardcoded margins (`style="margin: 10px;"`).

### Logic Separation (The Page Module)
- **Complex Logic**: Do not write heavy `.map()`, `.filter()`, or `.reduce()` functions inline within Action Chains.
- **Page Module**: Extract complex JSON manipulation to the page's `.js` file (PageModule) and call it using `const result = await $page.functions.transformMyData(rawApiArray)`. 

---

## ⚡ 4. Action Chains & Orchestration

### Modern Syntax & Structure
Always use JavaScript Action Chains class syntax with `async/await` rather than deprecated visual JSON declarative lists.

### Explicit State Management
Ensure that variables dictating UI feedback exist and are strictly maintained within the flow.
```javascript
// Proper wrapper for ANY fetch operation
$page.variables.isFetchingData = true;
try {
    const response = await Actions.callRest(...);
    // Process response
} catch (err) {
    // Handle error
} finally {
    $page.variables.isFetchingData = false;
}
```

### Advanced Data Fetching (Pagination)
For API endpoints (like Spring Boot or ORDS) that return `{ "items": [], "totalPages": n }` or require `offset/limit`:
```javascript
let allItems = [];
let currentPage = 0;
let totalPages = 1;

do {
    const response = await Actions.callRest(context, {
        endpoint: 'MyService/getRecords',
        uriParameters: { page: currentPage, size: 100 }
    });

    if (response.ok) {
        allItems = allItems.concat(response.body.items || response.body.content || []);
        totalPages = response.body.totalPages || 1;
        currentPage++;
    } else {
        break; // Or throw error
    }
} while (currentPage < totalPages);
```

### Interacting with the UI Natively
```javascript
// Safest way to trigger dialogs / refresh tables inside a chain
await Actions.callComponentMethod(context, {
  selector: '#addDialog',
  method: 'close'
});
```

### Robust Error Handling & Abort Errors
Network volatility combined with JET's rapid DOM rendering means previous REST calls can drop (resulting in an `AbortError`). Your `catch` blocks must silently ignore these to prevent spamming users with invalid "Failed to load" toasts.
```javascript
} catch (err) {
    if (err.name === 'AbortError' || err.message?.includes('Aborting stale fetch')) {
        console.log('Fetch aborted (normal JET rendering behavior).');
        return;
    }
    await Actions.fireNotificationEvent(context, {
        summary: 'Error',
        message: err.message || 'System failed to load data.',
        type: 'error'
    });
}
```
