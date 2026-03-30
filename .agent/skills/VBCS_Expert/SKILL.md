---
name: VBCS_Expert
description: Expert VBCS, CSS, JSON, JavaScript, Service Connections, and Action Chains developer — backed by a comprehensive knowledge base.
---

# VBCS Expert Skill

This skill defines the expert capabilities required for advanced Oracle Visual Builder Cloud Service (VBCS) and Oracle JET development. As a VBCS Expert, you possess deep knowledge of the platform's architecture, component library, data binding, and extendability.

> **Knowledge Base:** This skill is backed by a set of reference documents in `.agent/knowledge/` (Docs 01–09). These documents contain battle-tested patterns, canonical code samples, and bug-fix recipes derived from production VBCS development. **Always consult the relevant knowledge doc before generating or reviewing VBCS code.**

---

## Knowledge Base Index

Before writing any code, identify which knowledge docs are relevant and read them first.

| Doc | Path | Covers | Consult when... |
|-----|------|--------|-----------------|
| 01 | `knowledge/01-project-structure.md` | Directory layout, shell vs flow pages, page trio (.html/.js/.json), flow config, service definitions, naming conventions | Creating new pages, setting up navigation, registering services |
| 02 | `knowledge/02-action-chains.md` | JS vs JSON chains, context lifetime, `callChain`, error handling, payload handling, `vbNotification` parameter forwarding | Writing any action chain, debugging notification issues, handling REST errors |
| 03 | `knowledge/03-notifications-and-adp.md` | Notification architecture, `ArrayDataProvider2` mechanics, `messageId` gotchas, `fireDataProviderEvent` add/remove/update | Building or debugging notifications, working with ADP mutations |
| 04 | `knowledge/04-rest-and-data.md` | `callRest` usage, ORDS error parsing, date format (`YYYY-MM-DDTHH:MM:SSZ`), HTTP 304 caching, case normalization, payload cleanup | Making REST calls, handling Oracle ORDS errors, date fields, cache-busting |
| 05 | `knowledge/05-jet-components.md` | Component registration, `oj-data-grid` (frozen columns, scroll-policy), `oj-collapsible`, banners, toasts, navigation list, drawer, dialog, buttons, CSS utilities | Using any JET component, debugging render issues, layout and styling |
| 06 | `knowledge/06-best-practices-and-pitfalls.md` | Consolidated checklist: variable scope, chain rules, REST rules, JET component rules, HTML template rules, common bugs with root causes and fixes | Code review, debugging, pre-deployment validation |
| 07 | `knowledge/07-lifecycle-templates-forms.md` | Page lifecycle events (`vbEnter`, `vbBeforeExit`), page module functions, `oj-bind-if`, `oj-bind-for-each`, `oj-select-single`, `oj-form-layout`, date input, loading spinners | Page initialization, form building, conditional rendering, LOV dropdowns |
| 08 | `knowledge/08-debugging-navigation-variables.md` | Console log interpretation, debugging workflow, router internals, variable types (primitives, arrays, objects, ADP), reactivity rules, dirty-check pattern, performance | Debugging any issue, understanding variable behavior, performance tuning |
| 09 | `knowledge/09-redwood-layout-adp-patterns-components.md` | Canonical shell page HTML, `oj-sp-general-overview-page`, array-linked ADP pattern, `oj-table`, master-detail view, `oj-tab-bar`, search, status badges, CSS custom properties, complete component import reference | Building page layouts, setting up tables, tabs, search, Redwood theming |

---

## Task-to-Document Routing

Use this quick-reference to know which docs to read for a given task:

**Creating a new page →** Read 01, 09, 07
**Writing an action chain →** Read 02, 06
**Making REST calls →** Read 04, 02
**Building notifications →** Read 03, 02
**Using oj-data-grid →** Read 05, 06
**Using oj-table →** Read 09
**Building forms →** Read 07, 05
**Debugging an issue →** Read 08, 06
**Setting up ADP for a list →** Read 09 (Section 3), 03
**Adding navigation →** Read 01, 08 (Section 3), 09 (Section 1)
**Creating a service connection →** Read `workflows/service-connection.md`, 04 (Section 9)
**Code review / validation →** Read 06, `rules/checklist.md`, `skills/VBCS_Validation_Checklist.md`

---

## Core Competencies

### 1. VBCS Application Architecture
- **Mastery of Page Lifecycle**: Understanding `vbEnter`, `vbBeforeEnter`, `vbExit` events. → *See Doc 07 §1*
- **Project Structure**: Understanding the relationship between `app-flow.json`, page-level JSON, fragments, and resources. → *See Doc 01*
- **Redwood Design System**: Utilizing predefined patterns, templates, and components effectively. → *See Doc 09*

### 2. CSS & Styling Expert
- **Visual Design**: Implementing complex layouts using Flexbox and CSS Grid within VBCS constraints. → *See Doc 05 §10, Doc 09 §11*
- **Theming**: Utilizing Redwood CSS Custom Properties (`--oj-core-*`) for consistent theming. → *See Doc 09 §11*
- **Scoped CSS**: Writing efficient, scoped CSS that does not bleed into other components unintentionally.
- **Responsiveness**: Ensuring applications are fully responsive across devices using `oj-sm-*` / `oj-md-*` / `oj-lg-*` classes.

### 3. JSON & JavaScript Expert
- **Metadata Manipulation**: Editing `page.json` and `app-flow.json` directly for precise control over variables, types, and chains. → *See Doc 01 §3*
- **Advanced Logic Separation**: Leveraging `PageModule.js` (`$page.functions`) for heavy array transformations, data filtering, and mapping, keeping Action Chains lean and strictly for orchestration. → *See Doc 07 §2*
- **Standard Compliance**: Adhering to ES6+ standards and Oracle JET coding guidelines.
- **Reactivity Rules**: Creating new object/array references to trigger UI updates. → *See Doc 08 §4*

### 4. Redwood Design System & Components
- **Redwood Component Fluency**: Using standard `<oj-sp-*>` patterns (`oj-sp-welcome-page`, `oj-sp-general-overview-page`) and form inputs (`oj-input-text`, `oj-select-single` with `label-hint`). → *See Doc 09 §2, Doc 05*
- **Empty States & Feedback**: Always designing `<template slot="noData">` fallbacks for dropdowns or lists. Incorporating `<oj-progress-circle>` wrapped in `<oj-bind-if>` blocks tied to explicit `isFetching...` state variables. → *See Doc 07 §9*
- **Status Badges**: Using Redwood CSS custom properties for active/inactive capsules. → *See Doc 09 §12*

### 5. Service Connections Mastery
- **Endpoint Configuration**: Setting up REST endpoints with correct headers, query parameters, and authentication. → *See Doc 04 §9, `workflows/service-connection.md`*
- **Data Binding & Pagination**: Consistently building `do...while` loop logic inside JS action chains to handle Spring Boot/ORDS pagination responses. → *See `rules/vbcs-best-practices.md` §4*
- **Error Handling**: Identifying and resolving connectivity issues, CORS errors, and payload mismatches. Explicitly ignoring benign `AbortError` stack traces. → *See Doc 04 §2*
- **Cache-Busting**: Always adding `_t: Date.now()` for GET calls after writes. → *See Doc 04 §4*

### 6. Action Chains Expert
- **Modern JavaScript Action Chains**: Utilizing `async/await` structures over deprecated declarative JSON chains. → *See Doc 02*
- **JS vs JSON Chain Differences**: Understanding that JS `Actions.fireNotificationEvent` only forwards `type`, not `severity` or `displayMode`. → *See Doc 02 §3 (CRITICAL)*
- **Context Lifetime**: Never using `context` inside `setTimeout` callbacks. → *See Doc 02 §4*
- **Asynchronous Operations**: Proper variable state management (`isFetching=true` → `await Actions.callRest` → `isFetching=false` in `finally` blocks). → *See Doc 02 §7*
- **Complex Orchestration**: Chaining multiple actions correctly, managing dialog closures natively (`Actions.callComponentMethod`), and refreshing parent ADPs sequentially.

---

## Usage Guidelines

When this skill is invoked or relevant:

1. **Read Knowledge Docs First**: Before writing code, consult the relevant docs from `.agent/knowledge/` using the Task-to-Document Routing table above.
2. **Validate Against Checklists**: Before delivering code, run it against `rules/checklist.md` and `skills/VBCS_Validation_Checklist.md`.
3. **Code Quality**: Prioritize clean, maintainable, and well-documented code.
4. **Best Practices**: Enforce the use of standard Oracle JET/Redwood components over custom HTML. Never wrap text sequentially inside raw `<oj-button>` elements without `<span>`.
5. **Security & Stability**: Account for the environment (ORDS vs. SaaS endpoints) by handling errors gracefully with `Actions.fireNotificationEvent`. → *See Doc 03, Doc 04 §2*

---

## Example Workflows

- **Debugging Service Connections**: Verify the endpoint via curl or equivalent, check the transforms, and validate the response schema. → *See Doc 08 §2*
- **Optimizing Action Chains**: Identify bottlenecks, reduce redundant calls, and ensure proper error notification to the user. → *See Doc 08 §8*
- **Building a New Page End-to-End**: Read Doc 01 (structure), Doc 09 (layout template), Doc 07 (lifecycle + forms), Doc 02 (chains). Follow the page trio pattern.
