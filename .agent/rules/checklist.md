---
trigger: always_on
---


## Pre-Deployment Checklist

### ✓ Complete ALL items before marking build as ready

**Syntax & Structure:**
- [ ] No 'Identifier expected' errors in HTML/JSON
- [ ] All components have correct imports in JSON
- [ ] oj-bind-text is wrapped in `<span>` inside buttons
- [ ] Slots are not applied to oj-bind-if/oj-bind-for-each
- [ ] Obsolete attributes removed (e.g., direction on radioset)

**Error Handling:**
- [ ] All REST calls have failure paths
- [ ] Error notifications are user-friendly
- [ ] Input validation occurs before REST calls
- [ ] HTTP status codes are handled explicitly
- [ ] displayMode: 'transient' included in all notifications

**Accessibility:**
- [ ] All inputs have labels (label-hint or aria-label)
- [ ] Heading hierarchy is correct
- [ ] Icons have proper aria attributes
- [ ] Application is keyboard navigable

**Data Binding:**
- [ ] `[[ ]]` used for read-only bindings
- [ ] `{{ }}` used ONLY for input fields
- [ ] Variable scoping is correct (page/flow/app)

**Testing:**
- [ ] Application runs without console errors
- [ ] All error scenarios tested manually
- [ ] Happy path and edge cases validated
- [ ] Cross-browser testing completed

---

## Quick Reference

### HTTP Status Code Reference

| Code | Meaning | Action |
|------|---------|--------|
| 200-299 | Success | Process response normally |
| 400 | Bad Request | Show validation error message |
| 401 | Unauthorized | Redirect to login |
| 403 | Forbidden | Show access denied message |
| 404 | Not Found | Verify endpoint URL |
| 408 | Timeout | Retry with user notification |
| 500-599 | Server Error | Log & show generic error message |

### Critical Error Patterns to Avoid

| ✗ Don't Do This | ✓ Do This Instead |
|----------------|-------------------|
| Ignore REST failures | Always handle with failure path + notification |
| Use console.log for errors | Use oj-messages for user feedback |
| Generic error messages | Specific, actionable error messages |
| No input validation | Validate before REST calls |
| `<oj-button><oj-bind-text/></oj-button>` | `<oj-button><span><oj-bind-text/></span></oj-button>` |
| `<oj-bind-if slot="...">` | `<div slot="..."><oj-bind-if>...</oj-bind-if></div>` |
| `direction="row"` | `class="oj-choice-direction-row"` |

---

## ⚠️ CRITICAL REMINDER

**Code that violates these rules will be rejected. Validate each item before delivery.**
