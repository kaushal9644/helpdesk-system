# IT Helpdesk Ticket Management System

Full-stack helpdesk application for employees and IT administrators.

## Tech Stack

| Layer        | Technology              |
|-------------|-------------------------|
| Frontend    | React, Vite, Tailwind CSS |
| Backend     | Java Spring Boot        |
| Database    | MySQL                   |
| Auth        | JWT                     |
| Realtime    | WebSocket (STOMP)       |

## Repository Layout

```
helpdesk-system/
├── docs/                 # Architecture & API design (no runtime code)
├── database/             # Reference SQL scripts & seed data
├── docker/               # Local dev containers (MySQL, optional stack)
├── frontend/             # React SPA
└── backend/              # Spring Boot REST API + WebSocket
```

## Documentation

- [Project structure & folder guide](docs/PROJECT_STRUCTURE.md)
- [Frontend ↔ backend communication](docs/COMMUNICATION.md)
- [Database flow & entity model](docs/DATABASE_FLOW.md)

## Features (planned)

- Employee & admin JWT login
- Ticket creation, assignment, and status tracking
- Admin dashboard with metrics
- Ticket comments & file attachments
- Branch (location) management
- Realtime ticket/comment updates via WebSocket

## Getting Started

Implementation pending. See `docs/` for architecture before generating code.
