---
description: 
---

# Prompt Template: Creating a REST Service Connection from Scratch

**Instructions for the User:**
Copy the text below and fill in the bracketed `[ ]` sections. Paste this into your chat with your AI assistant. This prompt ensures the AI generates a robust `openapi3.json` file following Oracle VBCS standards, including full CRUD operations, `x-vb` hints, and component schemas.

---

### 📋 COPY & PASTE THE TEXT BELOW

**System Role**: Expert Oracle VBCS & JET Developer.

**Objective**: Create a new REST Service Connection in my application using the parameters provided below.

**Input Data**:
-   **API Base URL**: `[INSERT BASE URL HERE, e.g., https://my-source.com/api/v1]`
-   **Resource Endpoint**: `[INSERT ENDPOINT, e.g., /projects]`
-   **Proposed Service Name**: `[INSERT NAME, e.g., ProjectsService]`

**Strict Implementation Steps**:

1.  **Unique Naming Check**:
    -   You MUST first read `services/catalog.json`.
    -   Check if `[Proposed Service Name]` already exists as a key.
    -   If it exists, append a suffix (e.g., `_1` or `_New`) to avoid the error *"Service connection name is used by another service"*.

2.  **Catalog Configuration**:
    -   Add a new entry to the `services` object in `services/catalog.json`.
    -   Format:
        ```json
        "YourUniqueServiceName": {
            "type": "openapi3",
            "path": "services/YourUniqueServiceName/openapi3.json"
        }
        ```

3.  **OpenAPI Definition (`services/[ServiceName]/openapi3.json`)**:
    -   Create this file using **OAS 3.0** standards.
    -   **Structure Requirements**:
        -   **Servers**: Define the base URL.
        -   **Paths**: Define the endpoint with **full CRUD** operations (`get`, `post`, `put`, `delete`) if applicable, or at least `get`.
        -   **Oracle Extensions**: Include `x-vb` properties with valid `actionHint` (e.g., `getMany`, `create`, `update`, `delete`).
        -   **Components**: Define all schemas in `components/schemas` and reference them using `$ref`. Do NOT inline schemas in the paths.
        -   **Schema naming**: Use standard naming like `Get[Resource]Response`, `Post[Resource]Request`, etc.

**Execution Rules**:
-   Do **NOT** overwrite my existing `catalog.json`. READ it first, then propose the *update* to it.
-   Provide the full content for the new `openapi3.json` file following the reference style below.

---

### Reference Architecture (Copy this Style)

**Content for `services/[ServiceName]/openapi3.json`:**
```json
{
    "openapi": "3.0.0",
    "info": {
        "title": "ProjectsService",
        "version": "1.0.0"
    },
    "servers": [
        {
            "url": "https://api.example.com/v1"
        }
    ],
    "paths": {
        "/projects": {
            "get": {
                "operationId": "getProjects",
                "responses": {
                    "default": {
                        "description": "Default Response",
                        "content": {
                            "application/json": {
                                "schema": {
                                    "$ref": "#/components/schemas/GetProjectsResponse"
                                }
                            }
                        }
                    }
                },
                "x-vb": {
                    "actionHint": "getMany"
                }
            },
            "post": {
                "operationId": "createProject",
                "requestBody": {
                    "content": {
                        "application/json": {
                            "schema": {
                                "$ref": "#/components/schemas/CreateProjectRequest"
                            }
                        }
                    }
                },
                "responses": {
                    "default": {
                        "description": "Default Response",
                        "content": {
                            "application/json": {
                                "schema": {
                                    "$ref": "#/components/schemas/ProjectItem"
                                }
                            }
                        }
                    }
                },
                "x-vb": {
                    "actionHint": "create"
                }
            }
        }
    },
    "components": {
        "schemas": {
            "GetProjectsResponse": {
                "type": "object",
                "properties": {
                    "items": {
                        "type": "array",
                        "items": { "$ref": "#/components/schemas/ProjectItem" }
                    },
                    "hasMore": { "type": "boolean" },
                    "limit": { "type": "integer" }
                }
            },
            "CreateProjectRequest": {
                "type": "object",
                "properties": {
                    "projectName": { "type": "string" },
                    "status": { "type": "string" }
                }
            },
            "ProjectItem": {
                "type": "object",
                "properties": {
                    "projectId": { "type": "string" },
                    "projectName": { "type": "string" },
                    "status": { "type": "string" }
                }
            }
        }
    }
}
```
