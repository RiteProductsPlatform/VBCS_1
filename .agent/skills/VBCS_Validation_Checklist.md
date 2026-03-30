# VBCS Validation Checklist

Before submitting code, verify it against the following rules derived from Redwood and VBCS best practices:

## 1. UI & Redwood Components
- [ ] **Input Components**: Use `label-hint` and `label-edge="inside"` for all input fields (e.g., `oj-input-text`, `oj-select-single`, `oj-input-number`).
- [ ] **Buttons & Text**: Never nest `oj-bind-text` directly inside an `oj-button` tag. Always wrap text nodes inside an HTML `<span>`.
- [ ] **Layout**: Use standard flex layouts (`oj-flex`, `oj-flex-item`) with Redwood spacing tokens (`oj-sm-margin-2x-bottom`, `oj-sm-padding-4x`). Avoid hardcoding pixel values like `margin: 10px;`.
- [ ] **Empty States**: For selection components like `oj-select-single` or data lists, explicitly provide a `<template slot="noData">` when results might be empty.
- [ ] **Loading States**: Wrap UI blocks in `<oj-bind-if test="[[ $variables.isFetching... ]]">` and use `<oj-progress-circle size="sm">` while waiting for backend operations to finish.
- [ ] **Visibility Control**: Control toggles/rendering using `<oj-bind-if test="[[ ... ]]">` rather than relying on CSS `display: none;` toggles.

## 2. JavaScript Action Chains
- [ ] **Modern Syntax**: Use `async`/`await` JS action chains over the legacy declarative JSON action chains when possible.
- [ ] **Abort Errors**: Network delays can cause multiple rapid fetches which JET cancels (throwing an `AbortError`). Always wrap `Actions.callRest` in `try/catch` and explicitly ignore `AbortError` or check for `err.name === 'AbortError'`.
- [ ] **Pagination Handling**: For APIs that paginate (e.g., Spring Boot or ORDS returning `{ "items": [], "totalPages": X }`), use a `do...while (currentPage < totalPages)` loop inside your chain to process massive datasets.
- [ ] **State Variables**: Always cleanly set `$page.variables.isFetching... = true;` at the start of a fetch, and use a `finally { }` block to set it to `false`.

## 3. General Architecture & Logic
- [ ] **Logic Separation**: Complex data transformations (filtering Arrays, formatting strings, aggregating data) belong in standard functions inside `[pageName].js` (`$page.functions.transformData()`), NOT tightly coupled inside the action chain. Let the action chain call the PageModule function.
- [ ] **Data Providers**: Define robust `vb/ArrayDataProvider2` items in JSON pointing to an `any[]` variable array (`data: "{{ $variables.myFetchedArray }}"`), instead of fetching the whole structure manually every UI cycle.
- [ ] **Variables Map**: Maintain precise default values (e.g., `false` for booleans, `[]` for arrays) in `[pageName].json` to avoid `undefined` template initialization errors.

## 4. Service Connections
- [ ] **Path & Query separation**: Avoid injecting raw query strings directly into endpoint URLs. Map them using `uriParams` or `uriParameters` gracefully.
- [ ] **Schema Definition**: Never leave `openapi3.json` responses blank. Define at least `properties: { items: { type: "array" } }` so the VBCS designer can infer the shape.

## 5. Accessibility (A11y)
- [ ] All inputs must have an associated label (`label-hint`).
- [ ] Informational icons MUST use `aria-label` or `title` if they stand alone without text. Use Semantic Redwood icons `oj-ux-ico-info`, `oj-ux-ico-warning`, etc.
- [ ] Sensitive forms (passwords, usernames) should utilize standard HTML properties like `autocomplete="off"` if requested to prevent auto-fill conflicts with browsers.
