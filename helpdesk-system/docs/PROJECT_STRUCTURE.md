# Project Structure

Complete folder layout for the IT Helpdesk Ticket Management System.

## Root

```
helpdesk-system/
├── README.md
├── .gitignore                    # (to add) ignore node_modules, target/, .env
├── docs/
├── database/
├── docker/
├── frontend/
└── backend/
```

---

## `docs/`

Design-time documentation only. Keeps architecture, API contracts, and ERDs separate from application code.

| File | Purpose |
|------|---------|
| `PROJECT_STRUCTURE.md` | This document — folder map |
| `COMMUNICATION.md` | REST, JWT, WebSocket flows |
| `DATABASE_FLOW.md` | Tables, relationships, request→DB path |

---

## `database/`

Reference and operational SQL outside Flyway (optional duplicates for DBAs).

```
database/
├── scripts/          # Manual migrations, backups, one-off fixes
└── seed/             # Dev/test seed data (branches, demo users)
```

Primary schema migrations live in `backend/src/main/resources/db/migration/` (Flyway).

---

## `docker/`

Local development orchestration.

```
docker/
├── docker-compose.yml    # MySQL + optional phpMyAdmin
└── .env.example            # DB credentials for compose
```

---

## `frontend/` — React + Vite + Tailwind

```
frontend/
├── public/                 # Static assets (favicon, robots.txt)
├── src/
│   ├── api/                # Axios instance, interceptors, endpoint paths
│   ├── assets/
│   │   ├── images/
│   │   └── styles/         # Global CSS beyond Tailwind
│   ├── components/
│   │   ├── auth/           # Login forms (employee vs admin entry)
│   │   ├── common/         # Button, Modal, Spinner, Badge, Pagination
│   │   ├── layout/         # Navbar, Sidebar, Footer, AppShell
│   │   ├── tickets/        # TicketCard, TicketForm, StatusTimeline
│   │   ├── comments/       # CommentList, CommentInput
│   │   ├── admin/          # Dashboard widgets, assign-ticket UI
│   │   └── branches/       # Branch table, create/edit branch modal
│   ├── constants/          # API URLs, roles, ticket status labels
│   ├── context/            # AuthContext, ThemeContext
│   ├── hooks/              # useAuth, useTickets, useWebSocket
│   ├── pages/
│   │   ├── auth/           # Login, Forgot password (future)
│   │   ├── employee/       # My tickets, create ticket, ticket detail
│   │   └── admin/          # Dashboard, all tickets, branches, users
│   ├── routes/             # React Router, ProtectedRoute, role guards
│   ├── services/           # Business calls: ticketService, branchService
│   ├── store/              # Optional Zustand/Redux for global state
│   ├── types/              # TypeScript interfaces (Ticket, User, Branch)
│   ├── utils/              # dateFormat, fileSize, token helpers
│   └── websocket/          # STOMP client, subscribe handlers
├── index.html
├── package.json            # (to add)
├── vite.config.ts          # (to add) proxy /api → backend
├── tailwind.config.js      # (to add)
└── .env.example            # VITE_API_URL, VITE_WS_URL
```

### Frontend folder roles

| Folder | Responsibility |
|--------|----------------|
| `api/` | Single HTTP client; attaches JWT; handles 401 refresh/logout |
| `components/*` | Presentational & container UI; no direct `fetch` in deep leaves |
| `pages/` | Route-level screens; compose components and hooks |
| `services/` | Map UI actions to API calls; return typed data |
| `routes/` | URL → page mapping; redirect unauthenticated users |
| `context/` | Current user, role, token lifecycle |
| `hooks/` | Reusable stateful logic (pagination, filters, WS reconnect) |
| `websocket/` | Connect after login; topic subscriptions per ticket/dashboard |
| `types/` | Shared contracts aligned with backend DTOs |

---

## `backend/` — Spring Boot

```
backend/
├── pom.xml                         # (to add) Spring Web, Security, JPA, MySQL, JWT, WS
├── src/main/java/com/helpdesk/
│   ├── HelpdeskApplication.java    # (to add) entry point
│   ├── config/                     # Security, CORS, WebSocket, Jackson, file storage
│   ├── controller/                 # REST endpoints (@RestController)
│   ├── dto/
│   │   ├── request/                # LoginRequest, CreateTicketRequest, etc.
│   │   └── response/               # TicketResponse, DashboardStatsResponse
│   ├── entity/                     # JPA entities (User, Ticket, Comment, …)
│   ├── enums/                      # Role, TicketStatus, Priority
│   ├── exception/                  # Custom exceptions + @ControllerAdvice
│   ├── mapper/                     # Entity ↔ DTO (MapStruct or manual)
│   ├── repository/                 # Spring Data JPA interfaces
│   ├── security/                   # JWT filter, UserDetailsService, password encoder
│   ├── service/                    # Interfaces
│   ├── service/impl/               # Business logic implementations
│   ├── util/                       # JWT utils, file validators
│   └── websocket/                  # STOMP config, message controllers, broadcasters
├── src/main/resources/
│   ├── application.yml             # (to add) datasource, JWT secret, upload path
│   ├── db/migration/               # Flyway V1__init.sql, V2__…
│   ├── static/                     # Optional served files
│   └── templates/                  # Unused if SPA-only; reserved for emails
└── src/test/java/com/helpdesk/
    ├── controller/                 # MockMvc API tests
    └── service/                    # Unit tests with mocked repositories
```

### Backend package roles

| Package | Responsibility |
|---------|----------------|
| `config` | Beans: SecurityFilterChain, CorsConfiguration, WebSocketMessageBroker |
| `controller` | HTTP layer; validation; returns DTOs; no business rules |
| `service` | Transactions, authorization checks, orchestration |
| `repository` | CRUD and query methods; no HTTP knowledge |
| `entity` | DB table mapping; relationships and cascades |
| `security` | Login, JWT issue/validate, role-based `@PreAuthorize` |
| `websocket` | Push ticket status/comment events to subscribed clients |
| `exception` | Consistent error JSON (`code`, `message`, `timestamp`) |

---

## Feature → folder mapping

| Feature | Frontend | Backend |
|---------|----------|---------|
| Employee login | `pages/auth`, `components/auth` | `security`, `controller/AuthController` |
| Admin login | Same login page; role-based redirect | Same auth; `Role.ADMIN` |
| Create ticket | `pages/employee`, `components/tickets` | `TicketController`, `TicketService` |
| Status tracking | `StatusTimeline`, `hooks/useTickets` | `TicketService`, status history entity |
| Admin dashboard | `pages/admin`, `components/admin` | `DashboardController`, aggregations |
| Comments | `components/comments` | `CommentController`, WS broadcast |
| File upload | Ticket form + detail | `FileController`, local/S3 storage config |
| Branch management | `components/branches`, `pages/admin` | `BranchController`, `BranchService` |
| Realtime | `websocket/` | `websocket/` STOMP topics |
