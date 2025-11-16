# Docker Setup for Choose the Heat

This guide will help you run the entire Choose the Heat application stack using Docker, including:

- 🚀 Node.js 24 Application (TanStack Start)
- 🐘 PostgreSQL 14 Database
- 🔴 Redis 7 Cache

## Prerequisites

- Docker Desktop or Docker Engine installed
- Docker Compose (usually included with Docker Desktop)

## Quick Start

### 1. Configure Environment Variables

Copy the environment template:

```bash
# Windows PowerShell
copy .env.example .env

# Linux/Mac
cp .env.example .env
```

Edit `.env` and configure for Docker:

1. **Comment out DATABASE_URL and REDIS_URL** (Docker Compose sets these automatically):

   ```env
   # DATABASE_URL=postgresql://...  ← Comment this out
   # REDIS_URL=redis://...           ← Comment this out
   ```

2. **Set required values**:

   ```env
   # REQUIRED - Get from https://platform.openai.com/api-keys
   OPENAI_API_KEY=sk-your-actual-openai-api-key

   # REQUIRED - Generate a secure random secret
   SESSION_SECRET=your-random-secret-here

   # OPTIONAL - Only if you want Google OAuth
   GOOGLE_CLIENT_ID=your-client-id
   GOOGLE_CLIENT_SECRET=your-client-secret

   # OPTIONAL - Set to true on first run to seed templates
   SEED_DATABASE=true
   ```

**Generate a secure session secret:**

```bash
# Linux/Mac/WSL
openssl rand -base64 32

# PowerShell
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Maximum 256 }))
```

**Note**: The `.env.example` file works for both local development AND Docker. For Docker, just comment out the DATABASE_URL and REDIS_URL since docker-compose.yml provides those.

### 2. Build and Start All Services

```bash
docker-compose up --build
```

This will:

- ✅ Build the application Docker image
- ✅ Start PostgreSQL database
- ✅ Start Redis cache
- ✅ Run database migrations automatically
- ✅ Start the application

### 3. Access the Application

- **Application**: <http://localhost:3000>
- **PostgreSQL**: localhost:5432 (user: postgres, password: postgres)
- **Redis**: localhost:6379

### 4. Seed the Database (First Time Only)

On first run, you'll want to seed the database with sample novel templates:

```bash
# Stop the containers
docker-compose down

# Edit .env and set:
SEED_DATABASE=true

# Restart
docker-compose up
```

After seeding completes, you can set `SEED_DATABASE=false` again.

## Docker Commands

### Start Services (Detached)

```bash
docker-compose up -d
```

### Stop Services

```bash
docker-compose down
```

### View Logs

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f app
docker-compose logs -f postgres
docker-compose logs -f redis
```

### Restart a Service

```bash
docker-compose restart app
```

### Rebuild After Code Changes

```bash
docker-compose up --build app
```

### Stop and Remove Everything (including volumes)

```bash
docker-compose down -v
```

**⚠️ Warning**: The `-v` flag will delete your database data!

## Development Workflow

### Making Code Changes

When you make code changes:

```bash
# Rebuild and restart the app
docker-compose up --build app
```

### Database Operations

**Run migrations manually:**

```bash
docker-compose exec app node --loader tsx ./app/lib/db/migrate.ts
```

**Seed database manually:**

```bash
docker-compose exec app node --loader tsx ./app/lib/db/seed.ts
```

**Connect to PostgreSQL:**

```bash
docker-compose exec postgres psql -U postgres -d romance_novels
```

**Connect to Redis:**

```bash
docker-compose exec redis redis-cli
```

### Viewing Database

You can use a database client to connect:

- **Host**: localhost
- **Port**: 5432
- **User**: postgres
- **Password**: postgres
- **Database**: romance_novels

Recommended tools:

- pgAdmin
- DBeaver
- TablePlus
- DataGrip

## Production Deployment

### Environment Variables for Production

Update `.env` with production values:

```env
APP_URL=https://your-domain.com
NODE_ENV=production
SESSION_SECRET=<strong-random-secret>

# Use strong database password
# Update docker-compose.yml postgres section
```

### Security Checklist

- [ ] Change PostgreSQL password in `docker-compose.yml`
- [ ] Use a strong `SESSION_SECRET`
- [ ] Set proper `APP_URL` for OAuth redirects
- [ ] Don't expose ports 5432 and 6379 externally (remove from docker-compose.yml)
- [ ] Use Docker secrets for sensitive data
- [ ] Enable SSL/HTTPS (use nginx or Traefik as reverse proxy)
- [ ] Set up regular database backups

### Using Docker Secrets (Recommended for Production)

Create a `docker-compose.prod.yml`:

```yaml
version: '3.9'

services:
  postgres:
    environment:
      POSTGRES_PASSWORD_FILE: /run/secrets/db_password
    secrets:
      - db_password

  app:
    environment:
      OPENAI_API_KEY_FILE: /run/secrets/openai_key
      SESSION_SECRET_FILE: /run/secrets/session_secret
    secrets:
      - openai_key
      - session_secret

secrets:
  db_password:
    file: ./secrets/db_password.txt
  openai_key:
    file: ./secrets/openai_key.txt
  session_secret:
    file: ./secrets/session_secret.txt
```

## Troubleshooting

### Application Won't Start

**Check logs:**

```bash
docker-compose logs app
```

**Common issues:**

- Database not ready → Wait a few seconds, it should auto-retry
- Missing environment variables → Check your `.env` file
- Port already in use → Change ports in `docker-compose.yml`

### Database Connection Failed

**Verify PostgreSQL is running:**

```bash
docker-compose ps postgres
```

**Check health:**

```bash
docker-compose exec postgres pg_isready -U postgres
```

### Redis Connection Failed

**Verify Redis is running:**

```bash
docker-compose ps redis
```

**Test connection:**

```bash
docker-compose exec redis redis-cli ping
# Should return: PONG
```

### Rebuild Everything from Scratch

```bash
# Stop and remove containers, networks, volumes
docker-compose down -v

# Remove the built image
docker rmi choose-the-heat-app

# Rebuild and start fresh
docker-compose up --build
```

### Can't Connect to Database from Host

If you're trying to connect from your local machine (outside Docker), ensure:

- Ports are exposed in `docker-compose.yml` (they are by default)
- Use `localhost:5432` (not the container name)
- Firewall isn't blocking the connection

## Multi-Stage Build Explanation

The Dockerfile uses a multi-stage build for optimization:

1. **deps stage**: Installs dependencies
2. **builder stage**: Builds the application
3. **runner stage**: Minimal production image with only what's needed

This results in:

- ✅ Smaller final image size
- ✅ Faster deployment
- ✅ Better security (fewer packages)

## Health Checks

Both PostgreSQL and Redis have health checks configured. The app won't start until both are healthy.

**Check health status:**

```bash
docker-compose ps
```

Look for `healthy` in the status column.

## Volume Management

Data is persisted in Docker volumes:

- `postgres_data`: Database files
- `redis_data`: Redis persistence

**View volumes:**

```bash
docker volume ls | grep choose-the-heat
```

**Backup database:**

```bash
docker-compose exec postgres pg_dump -U postgres romance_novels > backup.sql
```

**Restore database:**

```bash
docker-compose exec -T postgres psql -U postgres romance_novels < backup.sql
```

## Performance Tips

### For Development

```yaml
# Add to docker-compose.yml under 'app' service
volumes:
  - ./app:/app/app  # Live reload for code changes
  - /app/node_modules  # Don't override node_modules
```

### For Production

- Enable Redis cache for sessions (already configured)
- Use a CDN for static assets
- Consider horizontal scaling (multiple app containers)
- Use managed PostgreSQL (AWS RDS, etc.) for better performance

## Next Steps

Once your Docker environment is running:

1. ✅ Visit <http://localhost:3000>
2. ✅ Create an account (email/password works without Google OAuth)
3. ✅ Complete onboarding (when implemented)
4. ✅ Start reading AI-generated romance novels!

## Support

For issues with Docker setup, check:

- Docker logs: `docker-compose logs`
- Container status: `docker-compose ps`
- Resource usage: `docker stats`

For application issues, see [README.md](README.md) and [PROGRESS.md](PROGRESS.md).
