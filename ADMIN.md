# Admin Dashboard - Choose the Heat

Complete guide to the admin dashboard system for managing users and novel templates.

---

## Table of Contents

- [Overview](#overview)
- [User Roles](#user-roles)
- [Getting Started](#getting-started)
- [Features](#features)
- [API Reference](#api-reference)
- [Maintenance](#maintenance)
- [Security](#security)

---

## Overview

The admin dashboard provides role-based access control for managing the Choose the Heat platform. It includes:

- **Role-based permissions** (User, Editor, Admin)
- **Template management** (Create, edit, publish, archive)
- **User management** (Update details, assign roles, delete)
- **Audit logging** (Track all admin/editor actions)
- **Dashboard statistics** (Role-specific metrics)

**Backend Status:** ✅ 100% Complete
**Frontend Status:** 🚧 In Progress

---

## User Roles

### Role Hierarchy

```
User → Editor → Admin
```

### Permissions Matrix

| Feature | User | Editor | Admin |
|---------|------|--------|-------|
| **Templates** | | | |
| Browse published templates | ✅ | ✅ | ✅ |
| View draft/archived templates | ❌ | ✅ | ✅ |
| Create templates | ❌ | ✅ | ✅ |
| Edit templates | ❌ | ✅ | ✅ |
| Archive templates | ❌ | ✅ | ✅ |
| Delete templates | ❌ | ❌ | ✅ |
| **Users** | | | |
| View user list | ❌ | ❌ | ✅ |
| Edit user details | ❌ | ❌ | ✅ |
| Change user roles | ❌ | ❌ | ✅ |
| Delete users | ❌ | ❌ | ✅ |
| **Audit Logs** | | | |
| View audit logs | ❌ | ❌ | ✅ |

### Role Descriptions

**User (Default)**

- Can browse published templates and create stories
- No administrative access

**Editor**

- Can manage novel templates (CRUD operations)
- Can see template statistics
- Cannot manage users or view audit logs

**Admin**

- Full access to all features
- Can manage users and assign roles
- Can view audit logs
- Can delete templates and users

---

## Getting Started

### Creating the First Admin User

1. **Set environment variables** in `.env`:

```bash
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=your-secure-password
ADMIN_NAME=Admin User
```

1. **Run the seed script**:

```bash
pnpm db:seed
```

The admin user will be created with the credentials above.

**⚠️ Important:** Change the admin password immediately after first login!

### Promoting Users to Editor/Admin

Use the admin API to update user roles:

```bash
# Example using curl
curl -X PATCH http://localhost:3000/api/admin/users/{userId} \
  -H "Content-Type: application/json" \
  -H "Cookie: session_id=your-session-id" \
  -d '{"role": "editor"}'
```

Or through the admin UI (once frontend is complete).

---

## Features

### Template Management

#### Template Status Workflow

```
Draft → Published → Archived
  ↑         ↓
  └─────────┘
```

- **Draft**: Template is being created/edited, not visible to users
- **Published**: Template is live and visible to all users
- **Archived**: Template is hidden from browse page, but existing user stories remain accessible

#### Creating a Template

**Endpoint:** `POST /api/admin/templates`

```json
{
  "title": "The CEO's Secret Arrangement",
  "description": "A powerful CEO needs a fake fiancée...",
  "base_tropes": ["fake-dating", "ceo-romance", "enemies-to-lovers"],
  "estimated_scenes": 12,
  "cover_gradient": "from-rose-500 to-pink-600",
  "status": "draft"
}
```

#### Archiving a Template

When you archive a template:

- ✅ Template is hidden from public browse page
- ✅ Existing user stories continue to work
- ✅ Users can still read their in-progress stories
- ✅ New stories cannot be created from this template
- ✅ `archived_at` and `archived_by` are tracked

**Endpoint:** `PATCH /api/admin/templates/{id}/status`

```json
{
  "status": "archived"
}
```

#### Deleting a Template (Admin Only)

**⚠️ Warning:** This is permanent and will fail if user stories exist.

**Endpoint:** `DELETE /api/admin/templates/{id}`

---

### User Management (Admin Only)

#### Listing Users

**Endpoint:** `GET /api/admin/users`

**Query Parameters:**

- `role` - Filter by role (user, editor, admin)
- `search` - Search by email or name
- `limit` - Results per page (default: 50)
- `offset` - Pagination offset (default: 0)

**Example:**

```
GET /api/admin/users?role=editor&limit=20&offset=0
```

#### Updating User Details

**Endpoint:** `PATCH /api/admin/users/{id}`

```json
{
  "email": "newemail@example.com",
  "name": "New Name",
  "role": "editor"
}
```

**Validations:**

- Email must be unique
- Role must be: user, editor, or admin

#### Deleting a User

**Endpoint:** `DELETE /api/admin/users/{id}`

**⚠️ Warning:**

- This action is permanent
- All user data is deleted (stories, scenes, choices)
- Admins cannot delete their own account

---

### Dashboard Statistics

**Endpoint:** `GET /api/admin/dashboard`

**Response for Editors:**

```json
{
  "stats": {
    "templates": {
      "total": 15,
      "draft": 3,
      "published": 10,
      "archived": 2
    }
  }
}
```

**Response for Admins:**

```json
{
  "stats": {
    "templates": {
      "total": 15,
      "draft": 3,
      "published": 10,
      "archived": 2
    },
    "users": {
      "total": 142,
      "user": 135,
      "editor": 5,
      "admin": 2
    }
  }
}
```

---

### Audit Logging

All admin and editor actions are automatically logged to the `admin_audit_logs` table.

#### Logged Actions

**Templates:**

- `create_template` - Template created
- `update_template` - Template fields updated
- `published_template` - Template published
- `archived_template` - Template archived
- `draft_template` - Template set to draft
- `delete_template` - Template deleted

**Users:**

- `update_user` - User details updated
- `update_user_role` - User role changed
- `delete_user` - User deleted

#### Viewing Audit Logs

**Endpoint:** `GET /api/admin/audit-logs`

**Query Parameters:**

- `entityType` - Filter by entity type (template, user)
- `entityId` - Filter by specific entity ID
- `userId` - Filter by user who performed action
- `action` - Filter by specific action
- `limit` - Results per page (default: 50)
- `offset` - Pagination offset (default: 0)

**Example:**

```
GET /api/admin/audit-logs?entityType=template&limit=100
```

**Response:**

```json
{
  "logs": [
    {
      "id": "uuid",
      "userId": "user-uuid",
      "userEmail": "admin@example.com",
      "userName": "Admin User",
      "action": "archived_template",
      "entityType": "template",
      "entityId": "template-uuid",
      "changes": {
        "status": {
          "old": "published",
          "new": "archived"
        }
      },
      "createdAt": "2025-01-14T10:30:00Z"
    }
  ],
  "pagination": {
    "total": 245,
    "limit": 50,
    "offset": 0,
    "hasMore": true
  }
}
```

---

## API Reference

### Base URL

All admin endpoints are prefixed with `/api/admin/`

### Authentication

All endpoints require:

1. Valid session cookie (`session_id`)
2. User must have appropriate role (editor or admin)

**Responses:**

- `401 Unauthorized` - No valid session
- `403 Forbidden` - Insufficient permissions

### Templates

| Method | Endpoint | Role | Description |
|--------|----------|------|-------------|
| GET | `/api/admin/templates` | Editor+ | List all templates |
| POST | `/api/admin/templates` | Editor+ | Create template |
| GET | `/api/admin/templates/:id` | Editor+ | Get template |
| PATCH | `/api/admin/templates/:id` | Editor+ | Update template |
| PATCH | `/api/admin/templates/:id/status` | Editor+ | Update status |
| DELETE | `/api/admin/templates/:id` | Admin | Delete template |

### Users

| Method | Endpoint | Role | Description |
|--------|----------|------|-------------|
| GET | `/api/admin/users` | Admin | List all users |
| GET | `/api/admin/users/:id` | Admin | Get user |
| PATCH | `/api/admin/users/:id` | Admin | Update user |
| DELETE | `/api/admin/users/:id` | Admin | Delete user |

### Dashboard

| Method | Endpoint | Role | Description |
|--------|----------|------|-------------|
| GET | `/api/admin/dashboard` | Editor+ | Get statistics |

### Audit Logs

| Method | Endpoint | Role | Description |
|--------|----------|------|-------------|
| GET | `/api/admin/audit-logs` | Admin | Get audit logs |

---

## Maintenance

### Cleaning Up Audit Logs

Audit logs are retained for **90 days (3 months)** by default.

**Manual Cleanup:**

```bash
# Use default 90-day retention
pnpm cleanup:audit-logs

# Custom retention (e.g., 30 days)
pnpm cleanup:audit-logs 30
```

**Automated Cleanup (Recommended):**

Add a cron job to run the cleanup script:

```bash
# Run daily at 2 AM
0 2 * * * cd /path/to/choose-the-heat && pnpm cleanup:audit-logs
```

**Docker:**

```bash
# Add to docker-compose.yml or run manually
docker exec choose-the-heat-app pnpm cleanup:audit-logs
```

### Database Migrations

When deploying updates:

```bash
pnpm db:migrate
pnpm db:codegen
```

---

## Security

### Best Practices

1. **Change Default Admin Password**
   - Update admin password immediately after first login
   - Use strong, unique passwords

2. **Limit Admin Accounts**
   - Only create admin accounts when absolutely necessary
   - Prefer editor role for template management

3. **Regular Audit Reviews**
   - Review audit logs regularly for suspicious activity
   - Monitor role changes and user deletions

4. **Environment Variables**
   - Never commit `.env` file to version control
   - Use different credentials for production

5. **HTTPS in Production**
   - Always use HTTPS in production
   - Session cookies have `Secure` flag enabled

### Role Assignment Guidelines

- **User**: Default role for all new registrations
- **Editor**: For trusted users who manage content
- **Admin**: For platform administrators only

### Preventing Security Issues

**Self-Deletion Protection:**

- Admins cannot delete their own account
- Prevents accidental lockout

**Email Uniqueness:**

- Email addresses must be unique
- Prevents duplicate accounts

**Cascade Deletion:**

- Deleting a user removes all their data
- Templates with user stories cannot be deleted

---

## Troubleshooting

### Cannot Access Admin Panel

1. Check user role in database:

   ```sql
   SELECT id, email, role FROM users WHERE email = 'your-email@example.com';
   ```

2. Verify session is valid:
   - Check session cookie exists
   - Session must not be expired (30-day default)

### Admin User Not Created During Seed

1. Verify environment variables are set:

   ```bash
   echo $ADMIN_EMAIL
   echo $ADMIN_PASSWORD
   ```

2. Check seed script output for errors

3. Manually create admin user:

   ```sql
   UPDATE users SET role = 'admin' WHERE email = 'your-email@example.com';
   ```

### Audit Logs Growing Too Large

1. Run cleanup script more frequently
2. Reduce retention period:

   ```bash
   pnpm cleanup:audit-logs 30  # 30 days instead of 90
   ```

3. Add database index if queries are slow (already included in migration)

---

## Future Enhancements

Planned features for the admin dashboard:

- 📊 Advanced analytics and reporting
- 📧 Email notifications for admin actions
- 🔒 Two-factor authentication for admins
- 📱 Mobile-responsive admin UI
- 🎨 Template preview before publishing
- 📈 User engagement metrics
- 🔍 Advanced search and filtering
- 💾 Bulk operations (import/export templates)
- 🚨 Alert system for suspicious activities

---

## Support

For issues or questions:

1. Check this documentation
2. Review [PROGRESS.md](PROGRESS.md) for implementation details
3. Open a GitHub issue at [github.com/Azhrak/choose-the-heat](https://github.com/Azhrak/choose-the-heat)

---

**Last Updated:** 2025-01-14
**Version:** Backend 1.0 (Frontend pending)
