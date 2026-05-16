# Frontend ↔ Backend Communication

How the React SPA talks to Spring Boot over HTTP and WebSocket.

## High-level diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                     Browser (React + Vite)                       │
│  ┌──────────┐  ┌────────────┐  ┌─────────────┐  ┌────────────┐ │
│  │  Pages   │→ │  Services  │→ │  api/axios  │  │ websocket/ │ │
│  └──────────┘  └────────────┘  └──────┬──────┘  └─────┬──────┘ │
└───────────────────────────────────────┼───────────────┼────────┘
                                        │ HTTPS/HTTP    │ WS
                                        ▼               ▼
┌─────────────────────────────────────────────────────────────────┐
│              Spring Boot (port 8080)                             │
│  ┌──────────────┐  ┌─────────────┐  ┌──────────────────────────┐│
│  │ JWT Filter   │→ │ Controllers │→ │ Services → Repositories  ││
│  └──────────────┘  └─────────────┘  └────────────┬─────────────┘│
│  ┌──────────────────────────────────────────────┴─────────────┐│
│  │              WebSocket / STOMP broker                         ││
│  └──────────────────────────────────────────────────────────────┘│
└───────────────────────────────────────┬─────────────────────────┘
                                        │ JDBC
                                        ▼
                                   ┌─────────┐
                                   │  MySQL  │
                                   └─────────┘
```

## Development proxy

Vite dev server (`localhost:5173`) proxies API calls to Spring Boot (`localhost:8080`) to avoid CORS during development.

```
Browser → /api/** → Vite proxy → http://localhost:8080/api/**
```

Production: frontend static build served by CDN or nginx; `VITE_API_URL` points to the API host.

---

## REST API (primary channel)

### Base URL

| Environment | Base path |
|-------------|-----------|
| Dev (proxied) | `/api/v1` |
| Prod | `https://api.yourdomain.com/api/v1` |

### Authentication flow (JWT)

```
1. POST /api/v1/auth/login
   Body: { email, password }
   Response: { accessToken, refreshToken?, user: { id, role, branchId } }

2. Frontend stores accessToken (memory + httpOnly cookie OR localStorage per security policy)

3. All subsequent requests:
   Header: Authorization: Bearer <accessToken>

4. Spring Security JwtAuthenticationFilter validates token → sets SecurityContext

5. On 401: optional POST /api/v1/auth/refresh → retry or redirect to login
```

### Role-based access

| Role | Typical routes |
|------|----------------|
| `EMPLOYEE` | Own tickets, create ticket, comment on own tickets |
| `ADMIN` | All tickets, dashboard, assign, branches, users |

Enforced on backend via `@PreAuthorize("hasRole('ADMIN')")`. Frontend hides UI but never relies on UI alone for security.

### Planned REST endpoints (contract sketch)

| Method | Path | Who | Purpose |
|--------|------|-----|---------|
| POST | `/auth/login` | Public | Issue JWT |
| POST | `/auth/register` | Admin | Create employee (optional) |
| GET | `/tickets` | Both | List (filtered by role) |
| POST | `/tickets` | Employee | Create ticket |
| GET | `/tickets/{id}` | Both | Detail + comments + attachments |
| PATCH | `/tickets/{id}/status` | Admin | Update status |
| PATCH | `/tickets/{id}/assign` | Admin | Assign to technician |
| POST | `/tickets/{id}/comments` | Both | Add comment |
| POST | `/tickets/{id}/attachments` | Both | Multipart upload |
| GET | `/attachments/{id}` | Both | Download file |
| GET | `/branches` | Admin | List branches |
| POST | `/branches` | Admin | Create branch |
| PUT | `/branches/{id}` | Admin | Update branch |
| GET | `/dashboard/stats` | Admin | Counts by status, branch, SLA |

### Request/response shape

- Requests: JSON bodies (`Content-Type: application/json`) except file upload (`multipart/form-data`).
- Responses: JSON with consistent envelope optional:
  ```json
  { "data": { ... }, "message": "OK" }
  ```
- Errors: HTTP status + `{ "code": "TICKET_NOT_FOUND", "message": "..." }`

### Frontend call chain

```
Page → service.ticketService.create(data)
     → api.post('/tickets', data)   // interceptor adds JWT
     → Spring TicketController
     → TicketService.save()
     → JSON TicketResponse
     → Page updates state / navigates to detail
```

---

## WebSocket (realtime channel)

Used for live updates without polling: new comments, status changes, dashboard counters.

### Stack

- **Protocol**: WebSocket with **STOMP** over SockJS (Spring default) or native WebSocket
- **Endpoint**: `ws://localhost:8080/ws` (dev) / `wss://...` (prod)
- **Auth**: JWT passed in STOMP connect headers (`Authorization: Bearer ...`)

### Connection lifecycle

```
1. User logs in → receives JWT
2. websocket/client connects to /ws with JWT in CONNECT frame
3. Server validates JWT → associates session with userId + role
4. Client SUBSCRIBEs to topics (see below)
5. On server events → MESSAGE pushed to subscribers
6. On logout / token expiry → DISCONNECT and clear subscriptions
```

### Topic design

| Topic | Subscribers | Event examples |
|-------|-------------|----------------|
| `/topic/tickets/{ticketId}` | Viewers of that ticket | New comment, status change |
| `/topic/admin/dashboard` | Admins only | Ticket count updated |
| `/user/queue/notifications` | Individual user | Assigned to your ticket |

### Server publish points

After successful DB commit in `TicketService` or `CommentService`:

```
save comment → repository.save() → messagingTemplate.convertAndSend("/topic/tickets/{id}", payload)
```

Frontend `websocket/` handler merges event into React state (or invalidates React Query cache).

---

## File upload flow

```
1. User selects file in ticket form
2. POST /api/v1/tickets/{id}/attachments (multipart)
3. Backend validates type/size → stores on disk or object storage
4. DB row: attachment (ticket_id, filename, path, uploaded_by)
5. Response includes attachment metadata URL
6. Optional WS event so other viewers see new attachment
```

Downloads: `GET /api/v1/attachments/{id}` with authorization check (user owns ticket or is admin).

---

## CORS & security summary

| Concern | Approach |
|---------|----------|
| CORS | Allow frontend origin in `WebMvcConfigurer` / Security |
| CSRF | Disabled for stateless JWT API; enabled if cookie session added |
| XSS | Sanitize comment HTML if rich text; prefer plain text |
| Secrets | JWT secret and DB password in env vars, not in repo |
