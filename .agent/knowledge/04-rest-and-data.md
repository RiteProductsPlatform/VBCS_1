# VBCS Skillset — 04: REST Integration, Data Handling & API Patterns

---

## 1. `Actions.callRest` — The VBCS REST Call

All HTTP calls to backend services go through `Actions.callRest`. It resolves (never rejects) with a result object.

```js
const result = await Actions.callRest(context, {
  endpoint: 'ServiceName/operationId',  // matches openapi3.json
  uriParams: { CR_CREWS_ID: 42 },       // path or query params
  body: { NAME: 'Alpha Crew', ... },    // request body (POST/PUT)
});
```

### Result object shape
```js
{
  ok: true,          // true for 2xx, false for 4xx/5xx
  status: 200,       // HTTP status code
  statusText: 'OK',
  body: { ... },     // parsed JSON response body
  headers: Headers,  // native fetch Headers object
  error: null        // non-null only for network-level failures
}
```

**Critical rule:** A 400 or 500 response does NOT throw. It resolves with `ok: false`. Always check `result.ok` before reading `result.body`.

```js
const response = await Actions.callRest(context, { endpoint: 'CrewsService/createCrew', body: payload });

if (response.ok) {
  // success path — response.body has the created resource
} else {
  // failure path — response.body may have error details from the server
  const serverMsg = response.body?.title || response.body?.message || response.statusText;
}
```

---

## 2. Parsing Oracle ORDS Error Responses

Oracle REST Data Services (ORDS) returns errors in a consistent format. When an API call fails:

```json
{
  "code": "ORA-00001",
  "message": "unique constraint (SCHEMA.CONSTRAINT_NAME) violated",
  "title": "Bad Request",
  "status": 400
}
```

Parse this to provide user-friendly messages:

```js
if (!response.ok) {
  const errBody = response.body || {};
  const errMsg = errBody.message || errBody.title || response.statusText || '';

  let friendlyMsg = `Operation failed: ${errMsg}`;

  // Specific Oracle constraint violations
  if (errMsg.includes('UK_CR_CREWS_CODE') || errMsg.includes('unique constraint')) {
    friendlyMsg = `Crew number already exists. Please use a different Crew Number.`;
  }

  await Actions.fireNotificationEvent(context, {
    summary: 'Error',
    message: friendlyMsg,
    severity: 'error',
    type: 'error',
    displayMode: 'transient',
  });
}
```

**Common Oracle ORDS error patterns:**
- `ORA-00001: unique constraint (...) violated` → Duplicate unique key
- `ORA-02291: integrity constraint (...) violated - parent key not found` → Foreign key violation
- `400 Bad Request` with no body → Malformed request (often wrong date format)
- `404 Not Found` → Resource ID does not exist

---

## 3. Date Format Requirements (Oracle ORDS)

Oracle ORDS APIs backed by Oracle Database expect ISO 8601 datetime strings with time component. Sending a date-only string (`YYYY-MM-DD`) causes a `400 Bad Request` with no meaningful error message.

### Required format: `YYYY-MM-DDTHH:MM:SSZ`
Example: `2025-01-15T00:00:00Z`

### Problem: VBCS date pickers and page variables store dates as `YYYY-MM-DD`

When reading from `oj-input-date` or splitting a response datetime, the time component is stripped:

```js
// From REST response: "2025-01-15T00:00:00Z"
const stored = response.body.START_DATE.split('T')[0]; // "2025-01-15"
$page.variables.selectedCrewData.start_date = stored;
```

When sending back to the API, you must re-append the time suffix:

```js
// Utility pattern — safe for both 10-char and full datetime strings
function toApiDate(d) {
  return (d && String(d).length === 10) ? d + 'T00:00:00Z' : d;
}

// In chain payload construction
START_DATE: toApiDate(rawData.start_date),
END_DATE: toApiDate(rawData.end_date),
```

Using an IIFE inline (no helper function needed):

```js
START_DATE: (() => {
  const d = payload.start_date || payload.START_DATE;
  return (d && String(d).length === 10) ? d + 'T00:00:00Z' : d;
})(),
```

**Rule:** Any field sent to Oracle ORDS that represents a date must be `YYYY-MM-DDTHH:MM:SSZ`. Never send just `YYYY-MM-DD`. Apply this conversion at the last moment before constructing the request body, not in the stored variable.

---

## 4. HTTP Caching (304 Not Modified)

VBCS apps running in Chrome/Edge are subject to browser HTTP caching. A `GET` endpoint that returns the same `ETag` will result in a `304 Not Modified` response with no body. This causes the data refresh after a create/update operation to silently return stale data — the user will not see their newly created record.

### Symptom
- User creates a resource.
- List refresh chain calls the GET endpoint.
- Browser returns `304 Not Modified`.
- The response body is empty; the list shows the old data.
- The new record appears only on a hard refresh.

### Fix: Cache-busting with `_t` parameter

Add a timestamp query parameter to force a unique URL on every call:

```js
const result = await Actions.callRest(context, {
  endpoint: 'CrewsService/getCrews',
  uriParams: { _t: Date.now() }   // unique timestamp on every call
});
```

**Mandatory: declare `_t` in the OpenAPI spec**, otherwise VBCS silently strips it:

```json
"parameters": [
  {
    "name": "_t",
    "in": "query",
    "required": false,
    "schema": { "type": "integer" }
  }
]
```

**Rule:** Any GET endpoint that is called after a write operation (create/update/delete) must use cache-busting. Add `_t: Date.now()` to `uriParams` and declare `_t` in the service's OpenAPI spec.

---

## 5. Case Normalization in REST Responses

Oracle ORDS may return field names in uppercase or lowercase depending on the view definition and ORDS version. Build chains defensively:

```js
// Always try both cases
const id    = body.CR_CREWS_ID || body.cr_crews_id;
const code  = body.CREW_CODE   || body.crew_code;
const name  = body.NAME        || body.name;
const start = body.START_DATE  || body.start_date;
```

When storing to page variables, normalise to a consistent casing (lowercase in this project):

```js
$page.variables.selectedCrewData = {
  cr_crews_id: body.CR_CREWS_ID || body.cr_crews_id,
  crew_code:   body.CREW_CODE   || body.crew_code,
  name:        body.NAME        || body.name,
  start_date:  (body.START_DATE || body.start_date || '').split('T')[0],
  end_date:    (body.END_DATE   || body.end_date   || '').split('T')[0],
};
```

---

## 6. Payload Construction — Clean Before Send

### POST (create): remove null/empty fields
Oracle ORDS may reject a POST with `null` fields if those fields have non-nullable constraints.

```js
const payload = { CREW_CODE: 'CRW-001', NAME: 'Test Crew', SUPERVISOR_ID: null };

// Strip before send
for (let key of Object.keys(payload)) {
  if (payload[key] === null || payload[key] === '') delete payload[key];
}
// Result: { CREW_CODE: 'CRW-001', NAME: 'Test Crew' }
```

### PUT (update): send null to clear fields
For updates, `null` means "clear this field". Keep nulls but convert empty strings:

```js
for (let key of Object.keys(payload)) {
  if (payload[key] === '' || payload[key] === undefined) {
    payload[key] = null;
  }
}
```

---

## 7. Reading Response Body After `callRest`

VBCS parses the JSON response body automatically. Access it via `result.body`:

```js
if (result.ok) {
  const body = result.body || {};

  // ORDS collection responses use .items array
  if (body.items) {
    $page.variables.rawCrewsArray = body.items;
  }

  // Single resource responses return the object directly
  const newId = body.CR_CREWS_ID || body.cr_crews_id;
}
```

### ORDS collection response shape
```json
{
  "items": [ { "CR_CREWS_ID": 1, "CREW_CODE": "CRW-001" }, ... ],
  "count": 25,
  "hasMore": false,
  "limit": 25,
  "offset": 0,
  "links": [ ... ]
}
```

---

## 8. Pre-Flight Duplicate Checking (Client-Side)

Before making a create REST call, validate uniqueness against the locally cached array to give immediate, friendly feedback instead of waiting for a database constraint error.

```js
// In saveNewCrewChain.js
const rawCrews = $page.variables.rawCrewsArray || [];
const inputCode = rawData.crew_code?.trim().toUpperCase();
const duplicate = rawCrews.find(c =>
  (c.CREW_CODE || c.crew_code || '').trim().toUpperCase() === inputCode
);

if (duplicate) {
  await Actions.fireNotificationEvent(context, {
    summary: 'Validation Error',
    message: `Crew number "${rawData.crew_code}" already exists.`,
    severity: 'error',
    type: 'error',
    displayMode: 'transient',
  });
  $page.variables.isSaving = false;
  return;
}
```

**Still** parse server-side constraint errors as a fallback (the local cache may be stale):

```js
if (errMsg.includes('UK_CR_CREWS_CODE') || errMsg.includes('unique constraint')) {
  friendlyMsg = `Crew number already exists. Please use a different Crew Number.`;
}
```

---

## 9. OpenAPI 3 Service File — Key Rules

```json
{
  "openapi": "3.0.0",
  "info": { "title": "CrewsService", "version": "1.0" },
  "servers": [{ "url": "https://your-ords-host/ords/schema/" }],
  "paths": {
    "/resource_view/": {
      "get": {
        "operationId": "getResources",
        "parameters": [
          { "name": "_t", "in": "query", "required": false, "schema": { "type": "integer" } }
        ],
        "responses": { "200": { "description": "OK" } }
      },
      "post": {
        "operationId": "createResource",
        "requestBody": {
          "content": {
            "application/json": { "schema": { "type": "object" } }
          }
        },
        "responses": { "201": { "description": "Created" } }
      }
    },
    "/resource_view/{id}": {
      "put": {
        "operationId": "updateResource",
        "parameters": [
          { "name": "id", "in": "path", "required": true, "schema": { "type": "integer" } }
        ],
        "responses": { "200": { "description": "OK" } }
      }
    }
  }
}
```

**Rules:**
1. `operationId` must be unique across all paths. VBCS uses it as `ServiceName/operationId`.
2. Path parameters (`:id`) must be declared in `parameters` with `"in": "path"`.
3. Query parameters must be declared in `parameters` with `"in": "query"`.
4. Undeclared parameters are silently dropped at runtime by VBCS.
5. The `servers[0].url` determines the base URL for all calls.
