# Agent API

Base path: `/api/v1/agents`

All endpoints require the authenticated user's `refresh_token` cookie. For browser
requests, send credentials (for example, `credentials: "include"` with `fetch`).
Agent list and detail operations are scoped to the signed-in user.

All responses use this envelope:

```json
{
  "success": true,
  "message": "Response message",
  "data": {},
  "timestamp": "2026-11-27T00:00:00.000Z"
}
```

## List agents

`GET /api/v1/agents`

Returns a compact summary for each agent owned by the signed-in user, newest
first. In the current API the summary text is returned as `knowledgeBase` (the
Agent model does not have a separate `description` field).

**Success: `200 OK`**

```json
{
  "success": true,
  "message": "Agents fetched successfully",
  "data": [
    {
      "agentId": "674f1234567890abcdef1234",
      "name": "Support Assistant",
      "knowledgeBase": "Answers questions about product setup and billing."
    }
  ],
  "timestamp": "2026-11-27T00:00:00.000Z"
}
```

An empty collection returns `"data": []`.

## Get an agent

`GET /api/v1/agents/:agentId`

Returns the full agent document for the requested ID, if it belongs to the
signed-in user. `agentId` must be a MongoDB ObjectId.

**Success: `200 OK`**

```json
{
  "success": true,
  "message": "Agent fetched successfully",
  "data": {
    "_id": "674f1234567890abcdef1234",
    "ownerId": "674e1234567890abcdef5678",
    "name": "Support Assistant",
    "knowledgeBase": "Answers questions about product setup and billing.",
    "instructions": "Be concise and refer to the support policy.",
    "tools": ["search_knowledge_base"],
    "isActive": true,
    "createdAt": "2026-11-26T14:00:00.000Z",
    "updatedAt": "2026-11-26T14:00:00.000Z",
    "__v": 0
  },
  "timestamp": "2026-11-27T00:00:00.000Z"
}
```

## Create an agent

`POST /api/v1/agents`

Send a JSON body. `name`, `knowledgeBase`, and `instructions` are required and
must be non-empty strings. `tools` must be an array of strings when provided;
`isActive` must be a boolean when provided. Do not send `ownerId`; it is taken
from the authenticated user. Unknown fields are rejected.

**Request**

```json
{
  "name": "Support Assistant",
  "knowledgeBase": "Answers questions about product setup and billing.",
  "instructions": "Be concise and refer to the support policy.",
  "tools": ["search_knowledge_base"],
  "isActive": true
}
```

`tools` and `isActive` are optional; their defaults are `[]` and `true`.

**Success: `201 Created`**

`data` contains the created agent document, with `_id`, `ownerId`, the supplied
fields, `createdAt`, `updatedAt`, and `__v`.

## Partially update an agent

`PATCH /api/v1/agents/:agentId`

Send one or more mutable fields as a JSON body. The path ID must be a MongoDB
ObjectId, and the agent must belong to the signed-in user. Only these fields can
be updated: `name`, `knowledgeBase`, `instructions`, `tools`, and `isActive`.
Provided values follow the same validation rules as create. An empty body and
unknown fields are rejected.

**Request**

```json
{
  "instructions": "Keep answers concise and include relevant support links.",
  "isActive": false
}
```

**Success: `200 OK`**

`data` contains the updated full agent document in the same shape as the
single-agent GET response.

## Errors

Errors use the same envelope with `success: false` and `data: null`:

```json
{
  "success": false,
  "message": "Agent not found",
  "data": null,
  "timestamp": "2026-11-27T00:00:00.000Z"
}
```

| Status | Meaning |
| --- | --- |
| `400 Bad Request` | Invalid agent ID or invalid/missing request fields |
| `401 Unauthorized` | Missing or invalid authentication cookie |
| `404 Not Found` | Agent does not exist or is not owned by the signed-in user |
| `500 Internal Server Error` | Unexpected server error |
