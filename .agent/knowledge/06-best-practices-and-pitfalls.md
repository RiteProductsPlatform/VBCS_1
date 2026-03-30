# VBCS Skillset — 06: Best Practices, Rules & Common Pitfalls

> A consolidated checklist. If you are reviewing a VBCS implementation or building one
> from scratch, verify every item in this document.

---

## 1. Variable Scope Rules

| Scope | Defined in | Survives navigation? | Access from chain |
|---|---|---|---|
| Application | `app.json` | Always | `context.$application.variables.x` |
| Shell page | `shell-page.json` | Yes — lives as long as the app | `context.$page.variables.x` (in shell chain) |
| Flow page | `<page>.json` | No — resets on navigate away | `context.$page.variables.x` (in that page's chain) |

**Pitfall:** A shell-page chain's `context.$page` is the shell page, not the child flow page. A flow-page chain's `context.$page` is the flow page. There is no cross-scope shortcut.

**Rule:** Never store data in a flow page variable if it must survive navigation. Move it to the shell page or re-fetch it on page activate.

---

## 2. Chain Context Lifetime

The `context` object passed to a chain's `run()` method is only valid during the chain's execution. Accessing `context` inside a `setTimeout` or `Promise` that outlives the chain is unreliable.

```js
// UNSAFE — context may be stale when the callback fires
async run(context) {
  setTimeout(() => {
    Actions.fireDataProviderEvent(context, { ... }); // may produce "data: []" error
  }, 5000);
}
```

**Known failure mode:** `fireDataProviderEvent` with `remove` returns an error saying `data: []` and `event was raised but a valid payload was not provided!`. The ADP proxy is accessible but its internal data appears empty — meaning VBCS cannot find the item to confirm the removal payload.

**Working pattern:** For auto-dismiss timeouts, the simplest reliable approach is to keep the timeout short enough that the page lifecycle hasn't changed, and accept that manual close via `on-sp-close` → `closeMessageBanner` is the guaranteed dismiss path.

---

## 3. Notification System Rules

1. **Always set both `severity` and `type`** in `Actions.fireNotificationEvent` calls. `severity` is ignored by the runtime but documents intent; `type` is the field forwarded to `vbNotification`.

2. **In `showNotificationMessage.js`, read `event.severity || event.type`** — not just `event.type`. Different chain styles set different fields.

3. **Use `event.displayMode !== 'persist'`** for auto-dismiss logic, not `=== 'transient'`. JS-based notifications deliver `undefined` for `displayMode`.

4. **`messageId` must have a `defaultValue`**. Without it, it starts as `undefined`, `++` gives `NaN`, and ADP remove operations silently fail.

5. **Keep ADP key type consistent.** If `MessagesBannerType.id` is `"string"`, always store and remove with string keys (`String(id)`), not numbers.

6. **Map `type: 'confirmation'` → `messageType: 'general-success'`** in the banner message. The word `confirmation` is not a valid `messageType` value for `oj-sp-messages-banner`.

7. **Do not manually dismiss a notification by setting the variable.** Always go through `fireDataProviderEvent` remove, which keeps the ADP consistent and triggers proper JET reactivity.

---

## 4. REST & API Rules

1. **Always check `response.ok`** before reading `response.body`. 400/500 responses resolve, not reject.

2. **Always use cache-busting** (`_t: Date.now()` in `uriParams`) for any GET called after a write. Declare `_t` in the OpenAPI spec or it will be silently stripped.

3. **Always send dates as `YYYY-MM-DDTHH:MM:SSZ`** to Oracle ORDS. Date-only strings (`YYYY-MM-DD`) cause cryptic `400 Bad Request` errors with no useful message.

4. **Strip null/empty fields from POST bodies.** Keep them (as `null`) in PUT bodies.

5. **Normalise field names from responses.** Oracle ORDS may return `CR_CREWS_ID` or `cr_crews_id`. Handle both: `body.CR_CREWS_ID || body.cr_crews_id`.

6. **Declare every query parameter in the OpenAPI spec.** Undeclared params are silently dropped.

7. **Parse server error messages** to give friendly feedback. Check for Oracle constraint names (e.g. `UK_CR_CREWS_CODE`) and translate to user-friendly text.

---

## 5. Action Chain Rules

1. **Always use try/catch/finally.** Reset `isLoading`/`isSaving` in `finally`, not in try/catch.

2. **Validate input before the REST call.** Show error notification and `return` early. Do not rely on server validation for user-facing messages.

3. **Use `await` for all `Actions.*` calls** that you need to complete before the next step. Without `await`, the chain continues before the action resolves.

4. **Always `return` after early exits** (validation failures, missing data). Without a `return`, execution falls through to subsequent code.

5. **Use `isSaving = true` guards** to prevent double-submission. Always reset in `finally`.

6. **Handle the missing payload pattern** for chains called from both JSON and JS contexts. Payload may arrive as `params.payload` or directly as `params`:
   ```js
   const payload = params ? (params.payload || params) : null;
   if (!payload || Object.keys(payload).length === 0) {
     // fallback to page variable
   }
   ```

7. **Do not create new ADPs inside chains.** Always reference the existing ADP variable and mutate it via `fireDataProviderEvent`.

---

## 6. JET Component Rules

1. **Use `{{ }}` for any JET component attribute that the component writes back to** (e.g. `expanded`, `value`, `selected`, `opened`, `frozen-column-count`). Use `[[ ]]` for read-only.

2. **`frozen-column-count` requires `scroll-policy="loadMoreOnScroll"`**. It silently does nothing with the default scroll policy.

3. **Wire `on-frozen-column-count-changed`** to a chain that writes `event.detail.value` back to the variable. Without this, the user's freeze action is undone on the next render.

4. **`oj-collapsible` requires a `slot="header"` child.** Without it the component renders with no visible header.

5. **Register every JET component in `.json` imports before using it in `.html`**. Missing imports cause silent render failures with no console error.

6. **Never use `display="icons"` on `oj-button` without also providing a text `<span>`** child. Screen readers need the text for accessibility; JET hides it visually.

---

## 7. HTML Template Rules

1. **`[[ expr ]]` is one-way. `{{ expr }}` is two-way.** Using `[[ ]]` where the component needs to write back will cause the component to appear correct but the variable will never update.

2. **Event listeners use `on-<event-name>`** (not `v-on` or `@event`). VBCS/JET is not Vue. The prefix is always `on-`.

3. **`$variables` in HTML expressions refers to the current page's variables.** In shell-page HTML, `$variables` is shell-page variables. In flow-page HTML, it's the flow page variables.

4. **Do not inline complex logic in HTML expressions.** Move it to a page module function (`<page>.js`) or a chain.

5. **Images and resources use `$application.path`** as the prefix: `[[ $application.path + 'resources/images/logo.png' ]]`.

---

## 8. Common Bugs and Their Root Causes

### Bug: Success notification shows in red (error style)
**Root cause:** Chain sets `severity: 'confirmation'` but not `type: 'confirmation'`. JS `Actions.fireNotificationEvent` only forwards `type`. The shell chain reads `event.severity || event.type` — if `type` is missing or wrong, the colour mapping fails.
**Fix:** Always set both `severity` and `type`. Use `type: 'confirmation'` for success.

### Bug: Notifications never auto-dismiss
**Root cause A:** `showNotificationMessage.js` condition was `event.displayMode === 'transient'`, which is always false for JS-based notifications (they deliver `undefined`).
**Fix:** Use `event.displayMode !== 'persist'`.

**Root cause B:** `messageId` has no `defaultValue`, starts as `undefined`, `++` gives `NaN`. ADP cannot find an item with key `NaN` to remove.
**Fix:** `"messageId": { "type": "string", "defaultValue": "1" }`.

**Root cause C:** Key type mismatch. `MessagesBannerType.id` is `"string"` but `messageId` is `"number"`. ADP stores key as string `"3"` but remove is called with number `3`.
**Fix:** `id: String($page.variables.messageId)` when creating the message object.

### Bug: Disband/update gives "Bad Request" with no details
**Root cause:** Date fields are sent as `YYYY-MM-DD` (10 chars). Oracle ORDS expects `YYYY-MM-DDTHH:MM:SSZ`.
**Fix:** Append `T00:00:00Z` to any 10-char date string before including in the request body.

### Bug: Newly created record doesn't appear after refresh
**Root cause:** Browser returns `304 Not Modified` for the GET call. Response body is empty; data is stale.
**Fix:** Add `_t: Date.now()` to `uriParams` and declare `_t` in the OpenAPI spec.

### Bug: Duplicate crew gives "Bad Request" instead of a friendly message
**Root cause:** The DB unique constraint violation returns an ORDS error body with the constraint name buried in the message. No pre-flight uniqueness check was done.
**Fix:** Check `rawCrewsArray` before the REST call. Also parse `response.body.message` for `unique constraint` or the specific constraint name and translate to user-friendly text.

### Bug: `frozen-column-count` has no effect
**Root cause:** `scroll-policy` is not set to `"loadMoreOnScroll"`. JET's freeze engine is inactive.
**Fix:** Add `scroll-policy="loadMoreOnScroll"` to the `oj-data-grid`.

### Bug: Chain receives empty `params` / payload
**Root cause:** The VBCS visual designer wraps chain parameters differently depending on how the chain is called (from JSON action, from `callChain`, from event listener). Payload may be at `params`, `params.payload`, or a named key.
**Fix:** Defensive extraction: `const payload = params ? (params.payload || params) : null`. Fall back to a page variable if still empty.

---

## 9. AMD Module Boilerplate (Always Use This)

Every JS action chain file must follow this exact AMD `define` pattern. VBCS loads chains as RequireJS modules.

```js
define([
  'vb/action/actionChain',
  'vb/action/actions',
  'vb/action/actionUtils',
], (
  ActionChain,
  Actions,
  ActionUtils
) => {
  'use strict';

  class myChainName extends ActionChain {
    async run(context, params) {
      const { $page } = context;
      // chain logic here
    }
  }

  return myChainName;
});
```

**Rules:**
- The class name must match the file name (e.g. `myChainName.js` → `class myChainName`).
- Always `'use strict'`.
- Always `return myChainName` at the bottom — this is what VBCS registers.
- Import only what you use. `ActionUtils` can be omitted if unused.

---

## 10. Knowledge Sources

The VBCS knowledge applied in this project came from:

1. **Oracle VBCS documentation** (docs.oracle.com/en/cloud/paas/visual-builder/) — project structure, chain JSON format, variable types, event system.
2. **Oracle JET API documentation** (jet.oracle.com) — component attributes, events, CSS utilities.
3. **Oracle JET Cookbook** (jet.oracle.com/jetCookbook) — component examples including data-grid patterns.
4. **Live debugging** of this project — the JS vs JSON notification behaviour, date format requirements, HTTP 304 caching, and ADP key type issues were all discovered empirically by reading chain files and browser console logs.

There were **no `.md` files in this project** providing VBCS guidance. All rules in this document are grounded in either official Oracle documentation (training data) or bugs discovered and fixed in the CrewRite project itself.
