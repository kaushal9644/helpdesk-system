# Database Flow

MySQL schema design and how data moves from API request to persistence.

## Entity relationship (conceptual)

```
┌──────────┐       ┌──────────┐       ┌─────────────┐
│  branch  │◄──────│   user   │──────►│   ticket    │
└──────────┘       └────┬─────┘       └──────┬──────┘
                        │                     │
                        │              ┌──────┴──────┐
                        │              │           │
                        ▼              ▼           ▼
                   ┌─────────┐   ┌──────────┐  ┌────────────┐
                   │ (role)  │   │ comment  │  │ attachment │
                   └─────────┘   └──────────┘  └────────────┘
                                        │
                                        ▼
                              ┌──────────────────┐
                              │ ticket_status_   │
                              │ history (audit)  │
                              └──────────────────┘
```

## Core tables

| Table | Purpose | Key columns |
|-------|---------|-------------|
| `branches` | Office/location | `id`, `name`, `code`, `address`, `active` |
| `users` | Employees & admins | `id`, `email`, `password_hash`, `role`, `branch_id`, `full_name` |
| `tickets` | Help requests | `id`, `title`, `description`, `status`, `priority`, `created_by`, `assigned_to`, `branch_id` |
| `comments` | Ticket thread | `id`, `ticket_id`, `user_id`, `body`, `created_at` |
| `attachments` | Files | `id`, `ticket_id`, `stored_name`, `original_name`, `mime_type`, `size`, `uploaded_by` |
| `ticket_status_history` | Audit trail | `id`, `ticket_id`, `old_status`, `new_status`, `changed_by`, `changed_at` |

### Enums (application-level or MySQL ENUM)

- **role**: `EMPLOYEE`, `ADMIN`
- **ticket status**: `OPEN`, `IN_PROGRESS`, `ON_HOLD`, `RESOLVED`, `CLOSED`
- **priority**: `LOW`, `MEDIUM`, `HIGH`, `CRITICAL`

---

## Request → database path (layered)

Every mutating API call follows the same stack:

```
HTTP Request
    → Controller (validate DTO, extract principal userId)
        → Service (@Transactional)
            → Authorization check (role + ownership)
            → Repository (JPA / custom @Query)
                → MySQL
            → Optional: WebSocket broadcast after commit
    → Response DTO
```

### Example: Employee creates ticket

```
POST /api/v1/tickets
{ title, description, priority, branchId? }

1. JwtFilter loads User entity for current user
2. TicketController → CreateTicketRequest validated
3. TicketService.create():
   - Sets created_by = current user id
   - Sets branch_id = user.branch_id (or request override if admin)
   - Sets status = OPEN
   - ticketRepository.save(ticket)
   - ticketStatusHistoryRepository.save(OPEN entry)
4. Returns TicketResponse
5. (Optional) WS: dashboard stats updated for admins
```

### Example: Admin changes status

```
PATCH /api/v1/tickets/{id}/status
{ status: "IN_PROGRESS" }

1. Verify ADMIN role
2. Load ticket by id (404 if missing)
3. Record old_status → insert ticket_status_history
4. Update ticket.status
5. save()
6. WS message to /topic/tickets/{id}
```

### Example: Add comment

```
POST /api/v1/tickets/{id}/comments
{ body }

1. Verify user can access ticket (creator, assignee, or admin)
2. commentRepository.save(...)
3. WS broadcast new comment payload to ticket topic
```

### Example: File upload

```
POST /api/v1/tickets/{id}/attachments (multipart)

1. Verify ticket access
2. Store binary to uploads/ or S3
3. attachmentRepository.save(metadata only in DB)
4. Return attachment URL/id
```

---

## Read patterns

| Use case | Query pattern |
|----------|----------------|
| Employee "my tickets" | `WHERE created_by = :userId ORDER BY created_at DESC` |
| Admin all tickets | Paginated `JOIN branch, user` with filters on status, branch, date |
| Ticket detail | `ticket` + `comments` + `attachments` + `status_history` (eager/lazy or DTO projection) |
| Dashboard stats | `COUNT(*) GROUP BY status`, `GROUP BY branch_id` — consider indexed columns |

Indexes to plan: `tickets(status)`, `tickets(created_by)`, `tickets(branch_id)`, `comments(ticket_id)`.

---

## Schema management

| Mechanism | Location |
|-----------|----------|
| **Flyway** (primary) | `backend/src/main/resources/db/migration/V1__init_schema.sql` |
| Reference copies | `database/scripts/` |
| Dev seed data | `database/seed/` |

Application startup: Flyway runs migrations → JPA `ddl-auto=validate` (no auto-alter in prod).

---

## Transaction boundaries

- One service method = one transaction for create ticket + history row.
- Comment + notification: same transaction; WebSocket send **after** commit (`@TransactionalEventListener` or explicit flush) to avoid ghost events on rollback.

---

## Data integrity rules

| Rule | Enforcement |
|------|-------------|
| User belongs to one branch | FK `users.branch_id → branches.id` |
| Ticket linked to branch | FK `tickets.branch_id` |
| Cannot delete branch with open tickets | Service-layer check or soft-delete `branches.active` |
| Closed ticket | Optional: block new comments except admin |
| Password storage | BCrypt hash only in `users.password_hash` |

---

## Authentication data flow

```
Login:
  users table lookup by email
  → BCrypt matches password_hash
  → JWT built with sub=userId, role, branchId
  → No session table (stateless JWT)

Optional future: refresh_tokens table for revoke/rotate
```

---

## Backup & environments

| Environment | Database |
|-------------|----------|
| Local | Docker MySQL (`docker/docker-compose.yml`) |
| Staging/Prod | Managed MySQL; credentials via env |

`database/scripts/` may hold backup/restore shell scripts (no application code).
