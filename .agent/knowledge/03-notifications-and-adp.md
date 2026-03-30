# VBCS Skillset — 03: Notifications & ArrayDataProvider2

---

## 1. The Notification Architecture

VBCS provides two visual notification components out of the box:

| Component | When to use |
|---|---|
| `oj-sp-messages-banner` | Persistent-ish banners at the top of the page. Supports close button. Best for action results (success, error, warning). |
| `oj-sp-messages-toast` | Transient floating toasts. Best for brief confirmations. |

The recommended pattern (used in CrewRite) is:
1. All notification requests from anywhere in the app call `Actions.fireNotificationEvent`.
2. This fires the `vbNotification` framework event.
3. The shell page listens to `vbNotification` and routes to the `showNotificationMessage` chain.
4. `showNotificationMessage` adds a message to the `messagesBannerADP` (an `ArrayDataProvider2`).
5. The `oj-sp-messages-banner` component renders the ADP content.
6. Auto-dismiss: a `setTimeout` removes the item from the ADP after a delay.
7. Manual close: the `on-sp-close` event fires `closeMessageBanner` chain which also removes the item from the ADP.

This centralises all notification rendering in one place.

---

## 2. Shell Page Setup

### `shell-page.json` — required declarations

```json
{
  "variables": {
    "messagesBannerADP": {
      "type": "vb/ArrayDataProvider2",
      "defaultValue": {
        "itemType": "MessagesBannerType",
        "keyAttributes": "id"
      }
    },
    "messageId": {
      "type": "string",
      "defaultValue": "1"
    }
  },
  "types": {
    "MessagesBannerType": {
      "id": "string",
      "messageType": "string",
      "primaryText": "string",
      "primaryText": "string",
      "secondaryText": "any",
      "primaryActionLabel": "string",
      "secondaryActionLabel": "string"
    }
  },
  "eventListeners": {
    "vbNotification": {
      "chains": [
        {
          "parameters": { "event": "{{ $event }}" },
          "chain": "showNotificationMessage"
        }
      ]
    },
    "messagesBannerSpClose": {
      "chains": [
        {
          "parameters": { "event": "{{ $event }}" },
          "chain": "closeMessageBanner"
        }
      ]
    }
  },
  "imports": {
    "components": {
      "oj-sp-messages-banner": { "path": "oj-sp/messages-banner/loader" },
      "oj-sp-messages-toast": { "path": "oj-sp/messages-toast/loader" }
    }
  }
}
```

### `shell-page.html` — component binding

```html
<oj-sp-messages-banner
  data="[[ $variables.messagesBannerADP ]]"
  class="oj-flex-item oj-sm-12 oj-md-12"
  on-sp-close="[[$listeners.messagesBannerSpClose]]">
</oj-sp-messages-banner>
```

---

## 3. Critical: `messageId` Variable Type

**Must be `type: "string"` with `defaultValue: "1"`** (or `type: "number"` with `defaultValue: 1`).

If declared as `type: "string"` with no `defaultValue`, the variable starts as `undefined`. Performing `++` on `undefined` in JavaScript gives `NaN`. A key of `NaN` cannot be matched during ADP remove operations, so notifications can never be dismissed programmatically.

```json
// WRONG — produces undefined/NaN keys
"messageId": { "type": "string" }

// CORRECT — string with explicit start value
"messageId": { "type": "string", "defaultValue": "1" }

// ALSO CORRECT — number type
"messageId": { "type": "number", "defaultValue": 1 }
```

**Key type consistency rule:** The type of `id` in `MessagesBannerType` and the type of `messageId` must match. If `id` is `"string"` in the type definition, always store string IDs. When VBCS processes the ADP's `keyAttributes`, it may coerce values to match the declared type. If you add a numeric `id: 3` but the type declares `"string"`, the stored key becomes `"3"`. A remove call with `keys: [3]` (number) will not match `"3"` (string) and will fail with `data: []`.

```js
// In showNotificationMessage.js — always use String() to be safe
const msgId = String($page.variables.messageId);
$page.variables.messageId = String(parseInt($page.variables.messageId, 10) + 1);

let msg = {
  id: msgId,           // string key
  messageType: ...,
  primaryText: ...,
  secondaryText: ...,
};
```

---

## 4. `showNotificationMessage.js` — Full Implementation

```js
define([
  'vb/action/actionChain',
  'vb/action/actions',
  'vb/action/actionUtils',
], (ActionChain, Actions) => {
  'use strict';

  class showNotificationMessage extends ActionChain {
    async run(context, { event }) {
      const { $page } = context;

      // JS-based Actions.fireNotificationEvent only forwards `type`, not `severity`.
      // Always read severity || type to support both chain styles.
      const notifType = event.severity || event.type;

      const msgId = String($page.variables.messageId);
      $page.variables.messageId = String(parseInt($page.variables.messageId, 10) + 1);

      const msg = {
        id: msgId,
        messageType: notifType === 'confirmation' ? 'general-success' : 'general-' + notifType,
        primaryText: event.summary,
        secondaryText: event.message,
      };

      // Add to the ADP — this triggers the banner to render the item
      await Actions.fireDataProviderEvent(context, {
        target: $page.variables.messagesBannerADP,
        add: { data: msg },
      });

      // Auto-dismiss logic:
      // JS-based notifications do NOT forward displayMode to vbNotification event.
      // Therefore event.displayMode is undefined for all JS-based notifications.
      // Using !== 'persist' (rather than === 'transient') treats undefined as transient.
      if (event.displayMode !== 'persist') {
        setTimeout(() => {
          Actions.fireDataProviderEvent(context, {
            target: $page.variables.messagesBannerADP,
            remove: { keys: [msgId] },
          });
        }, 5000);
      }
    }
  }

  return showNotificationMessage;
});
```

---

## 5. `closeMessageBanner.js` — Manual Close Handler

Called when the user clicks the × on a banner message. The `event.detail.messageId` contains the message's `id` field as set during add.

```js
define([
  'vb/action/actionChain',
  'vb/action/actions',
  'vb/action/actionUtils',
], (ActionChain, Actions) => {
  'use strict';

  class closeMessageBanner extends ActionChain {
    async run(context, { event }) {
      const { $page } = context;
      await Actions.fireDataProviderEvent(context, {
        target: $page.variables.messagesBannerADP,
        remove: { keys: [event.detail.messageId] },
      });
    }
  }

  return closeMessageBanner;
});
```

---

## 6. `ArrayDataProvider2` Rules and Gotchas

`vb/ArrayDataProvider2` is VBCS's reactive wrapper around JET's `ArrayDataProvider`. It powers all list-bound JET components.

### Declare with `keyAttributes`
Always specify which field is the unique key:
```json
"defaultValue": {
  "itemType": "YourItemType",
  "keyAttributes": "id"
}
```

### `fireDataProviderEvent` — add operation
```js
// Add one item
await Actions.fireDataProviderEvent(context, {
  target: $page.variables.myADP,
  add: { data: { id: '1', name: 'Alice' } },
});

// VBCS warning: "No keys were specified in the event payload for the mutation
// operation add. Attempting to build keys from data."
// This warning is harmless — VBCS correctly infers the key from keyAttributes.
```

### `fireDataProviderEvent` — remove operation
```js
// Remove by key
await Actions.fireDataProviderEvent(context, {
  target: $page.variables.myADP,
  remove: { keys: ['1'] },   // must match the type of the stored key
});
```

**Remove failure signature:**
```
Unable to dispatch mutation event — {"remove":{"data":[],"keys":["1"]}}
event was raised but a valid payload was not provided!
```
When `data: []`, VBCS could not find an item matching the supplied key. Causes: key type mismatch (string vs number), stale context, or ADP reset between add and remove.

### `fireDataProviderEvent` — update operation
```js
await Actions.fireDataProviderEvent(context, {
  target: $page.variables.myADP,
  update: {
    data: { id: '1', name: 'Updated Name' },
    keys: ['1'],
  },
});
```

### ADP is reactive — do not replace the variable reference
Never reassign `$page.variables.myADP` to a new object. VBCS tracks the ADP by reference; replacing it breaks the component binding. Instead, use `fireDataProviderEvent` to mutate the contents.

```js
// WRONG
$page.variables.myADP = { itemType: 'Foo', keyAttributes: 'id', data: newItems };

// CORRECT — clear and re-add, or use update operations
```

---

## 7. `messageType` Values for `oj-sp-messages-banner`

The `messageType` field controls the visual style of each banner row:

| Value | Appearance |
|---|---|
| `general-success` | Green / checkmark |
| `general-error` | Red / X icon |
| `general-warning` | Yellow / warning icon |
| `general-info` | Blue / info icon |
| `general-confirmation` | (avoid — use `general-success`) |

**Rule:** Map `type: 'confirmation'` → `messageType: 'general-success'`. The `confirmation` type in VBCS notifications is the semantic success type, but `oj-sp-messages-banner` uses `general-success` as the CSS class.

```js
const messageType = notifType === 'confirmation'
  ? 'general-success'
  : 'general-' + notifType;
```

---

## 8. `displayMode` Values Reference

| Value | Meaning | Who sets it |
|---|---|---|
| `'transient'` | Auto-dismiss | JSON chain `fireNotificationEventAction` |
| `'persist'` | Stays until manually closed | JSON chain `fireNotificationEventAction` |
| `undefined` | Always treat as transient | JS `Actions.fireNotificationEvent` (never forwards this) |

---

## 9. Firing Notifications from Any Page Chain

From any JS chain in any page, to show a notification:

```js
// Minimal — works for all cases
await Actions.fireNotificationEvent(context, {
  summary: 'Success',
  message: 'Operation completed.',
  severity: 'confirmation',  // for shell-page chain compatibility
  type: 'confirmation',      // the field actually forwarded
  displayMode: 'transient',  // included for clarity (not forwarded by JS, but documents intent)
});
```

The `vbNotification` event bubbles up and the shell page's `showNotificationMessage` chain handles display.
