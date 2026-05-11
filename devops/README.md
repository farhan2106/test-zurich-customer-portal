# Zurich App — Production Deployment

Production-ready Docker Compose stack for the Zurich Customer Portal. This folder contains all infrastructure definitions needed to build, configure, and run the full application stack locally or in a production environment.

## 📋 Overview

The `devops/` folder provides a complete containerized deployment for the Zurich Customer Portal monorepo:

| Component | Technology | Port |
|-----------|------------|------|
| **Frontend** | Next.js 16 + React 19 + Tailwind CSS + daisyUI | 3000 |
| **Backend** | NestJS + TypeORM + PostgreSQL client | 3001 |
| **Database** | PostgreSQL 16 (Alpine) | 5432 (internal) |

All three services run on a shared Docker bridge network with health checks, automatic restart policies, and persistent named volumes for data durability. Both application images use multi-stage builds running as a non-root user for security hardening.

## 📁 Folder Structure

```
devops/
├── docker-compose.yml      # Orchestrates postgres, backend, and frontend services
├── Dockerfile.backend      # Multi-stage build for NestJS backend (Node 22, Alpine)
├── Dockerfile.frontend     # Multi-stage build for Next.js frontend (Node 22, Alpine)
├── .env.example            # Template with all environment variables and defaults
├── .dockerignore           # Excludes node_modules, dist, .next, .git from build context
└── README.md               # This file
```

## 🚀 Quick Start

### 1. Copy the environment template

```bash
cp .env.example .env
```

### 2. Fill in required variables

Open `.env` and set the three **required** variables:

```env
JWT_SECRET=<your-secret>
GOOGLE_CLIENT_ID=<your-google-client-id>
GOOGLE_CLIENT_SECRET=<your-google-client-secret>
```

Generate a secure JWT secret:

```bash
openssl rand -hex 64
```

Obtain Google OAuth credentials from the [Google Cloud Console](https://console.cloud.google.com/apis/credentials).

### 3. Start the stack

```bash
docker compose -f docker-compose.yml up -d
```

Docker Compose will:
1. Pull the PostgreSQL 16 Alpine image
2. Build the backend and frontend images from source
3. Start PostgreSQL and wait for it to become healthy (`pg_isready`)
4. Start the backend (which depends on a healthy database)
5. Start the frontend (with `NEXT_PUBLIC_API_URL` baked into the client bundle)

### 4. Access the application

| Service | URL |
|---------|-----|
| Frontend | http://localhost:3000 |
| Backend API | http://localhost:3001 |
| PostgreSQL | Internal only (port 5432, not exposed to host) |

## 🏗️ Architecture

### Service Topology

```
┌─────────────────────────────────────────────────────────────┐
│                      zurich-network                         │
│                                                             │
│  ┌──────────────┐    ┌──────────────┐    ┌───────────────┐ │
│  │   Frontend   │───▶│   Backend    │───▶│   PostgreSQL  │ │
│  │  Next.js     │    │   NestJS     │    │   v16 Alpine  │ │
│  │  Port 3000   │    │   Port 3001  │    │   Port 5432   │ │
│  └──────────────┘    └──────────────┘    └───────────────┘ │
│         │                   │                    │          │
│         ▼                   ▼                    ▼          │
│    (host: 3000)        (host: 3001)        (volume only)    │
└─────────────────────────────────────────────────────────────┘
```

### Service Details

#### PostgreSQL (`postgres`)
- **Image**: `postgres:16-alpine`
- **Port**: 5432 (internal only — not exposed to the host)
- **Health check**: Runs `pg_isready` every 10 seconds
- **Volume**: `postgres_data` mounted at `/var/lib/postgresql/data`
- **Credentials**: Configured via `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_DB`

#### Backend (`backend`)
- **Image**: Built from `Dockerfile.backend`
- **Port**: 3001 (exposed to host)
- **Depends on**: `postgres` (waits for healthy status before starting)
- **Volume**: `app_data` mounted at `/app/data` for file uploads and exports
- **Database connection**: Connects to PostgreSQL via the Docker service name `postgres` (e.g., `DATABASE_HOST=postgres`)

#### Frontend (`frontend`)
- **Image**: Built from `Dockerfile.frontend`
- **Port**: 3000 (exposed to host)
- **Build arg**: `NEXT_PUBLIC_API_URL` is baked into the client bundle at build time
- **API calls**: All frontend-to-backend requests go through `NEXT_PUBLIC_API_URL` (default: `http://localhost:3001`)

### Network

All services are connected to a shared bridge network named `zurich-network`. This enables service discovery by container name — the backend resolves the database hostname as `postgres` automatically via Docker DNS.

## 🔐 Required Environment Variables

These three variables **must** be set before starting the stack. The application will not function correctly without them.

| Variable | Description | How to Generate |
|----------|-------------|-----------------|
| `JWT_SECRET` | Secret key used for signing and verifying JWT tokens. Must be at least 64 hex characters. | `openssl rand -hex 64` |
| `GOOGLE_CLIENT_ID` | OAuth 2.0 Client ID from Google Cloud Console for user authentication. | [Google Cloud Console → Credentials](https://console.cloud.google.com/apis/credentials) |
| `GOOGLE_CLIENT_SECRET` | OAuth 2.0 Client Secret paired with the Client ID above. | Same as above (click the credential to reveal) |

### Setting Up Google OAuth

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create or select a project
3. Enable the **Google+ API** (or the relevant identity API)
4. Navigate to **APIs & Services → Credentials**
5. Create an **OAuth 2.0 Client ID** (type: Web application)
6. Add authorized redirect URIs (e.g., `http://localhost:3001/auth/google/callback`)
7. Copy the **Client ID** and **Client Secret** into your `.env` file

## 💾 Volumes

Two named detachable volumes provide data persistence across container restarts and rebuilds.

| Volume | Mount Point | Purpose |
|--------|-------------|---------|
| `postgres_data` | `postgres:/var/lib/postgresql/data` | PostgreSQL database files. Persists all tables, indexes, and data across container lifecycle. |
| `app_data` | `backend:/app/data` | Application data directory. Used for file uploads, generated exports, and any runtime files the backend needs to persist. |

### Volume Management

```bash
# List all volumes
docker volume ls

# Inspect a specific volume
docker volume inspect devops_postgres_data

# Remove all volumes (WARNING: deletes all persisted data)
docker compose down -v
```

## 🐳 Dockerfiles

Both application images use a **multi-stage build** strategy to minimize the final image size, reduce the attack surface, and ensure production-ready outputs.

### Backend (`Dockerfile.backend`)

| Stage | Purpose |
|-------|---------|
| **deps** | Installs all Node.js dependencies (both `dependencies` and `devDependencies`) with `npm ci`. This layer is cached separately so dependency changes don't invalidate the build stage. |
| **build** | Compiles the NestJS application (`npm run build`). TypeScript is transpiled to JavaScript, producing the `dist/` output. |
| **production** | Final runtime image. Copies only the compiled `dist/` folder and production dependencies from previous stages. Runs as the non-root `node` user (UID 1000) for security. Based on `node:22-alpine` for a minimal footprint. |

**Key features:**
- Non-root user (`node`) — the container does not run as root
- Alpine-based — minimal image size (~50MB base vs ~200MB for Debian)
- Only production dependencies in the final image
- Working directory: `/app`

### Frontend (`Dockerfile.frontend`)

| Stage | Purpose |
|-------|---------|
| **deps** | Installs all Node.js dependencies with `npm ci`. Cached separately for faster rebuilds. |
| **build** | Runs `npm run build` to produce the optimized Next.js output (`.next/`). Accepts the `NEXT_PUBLIC_API_URL` build arg so the API endpoint is baked into the static client bundle. |
| **production** | Final runtime image. Copies only the `.next/` output, `public/` assets, and production dependencies. Runs as the non-root `node` user. Based on `node:22-alpine`. |

**Key features:**
- Non-root user (`node`) — same security posture as backend
- `NEXT_PUBLIC_API_URL` build arg — configured at build time, not runtime
- Standalone output mode for minimal production footprint
- Working directory: `/app`

### Build Context

Both Dockerfiles use the **project root** (`..` relative to the `devops/` folder) as their build context. This is configured in `docker-compose.yml` via:

```yaml
build:
  context: ..
  dockerfile: devops/Dockerfile.backend
```

The `.dockerignore` file ensures unnecessary files (node_modules, .git, local dist folders, etc.) are excluded from the build context, keeping builds fast and images lean.

## 🛠️ Useful Commands

### Lifecycle

```bash
# Start all services in detached mode
# [docker compose down -v] for removing old container
docker compose -f docker-compose.yml up -d

# Stop all services (preserves volumes and data)
docker compose -f docker-compose.yml down

# Stop and remove volumes (WARNING: deletes all persisted data)
docker compose -f docker-compose.yml down -v

# Restart a specific service
docker compose -f docker-compose.yml restart backend
```

### Logs

```bash
# Follow logs for all services
docker compose -f docker-compose.yml logs -f

# Follow logs for a specific service
docker compose -f docker-compose.yml logs -f backend
docker compose -f docker-compose.yml logs -f frontend
docker compose -f docker-compose.yml logs -f postgres

# Show last 100 lines of logs
docker compose -f docker-compose.yml logs --tail=100
```

### Building

```bash
# Rebuild all services (uses cache where possible)
docker compose -f docker-compose.yml build

# Rebuild a specific service without cache
docker compose -f docker-compose.yml build --no-cache backend

# Rebuild with specific build args
docker compose -f docker-compose.yml build --build-arg NEXT_PUBLIC_API_URL=https://api.example.com frontend
```

### Debugging

```bash
# Open a shell inside the backend container
docker compose -f docker-compose.yml exec backend sh

# Open a shell inside the frontend container
docker compose -f docker-compose.yml exec frontend sh

# Open a psql shell inside the postgres container
docker compose -f docker-compose.yml exec postgres psql -U zurich_user -d zurich_db

# Check service health status
docker compose -f docker-compose.yml ps

# Inspect a running container
docker inspect devops-backend-1
```

### Volume Management

```bash
# List all volumes
docker volume ls

# Inspect a volume
docker volume inspect devops_postgres_data

# Back up the database
docker compose -f docker-compose.yml exec postgres pg_dump -U zurich_user zurich_db > backup.sql

# Restore a database backup
cat backup.sql | docker compose -f docker-compose.yml exec -T postgres psql -U zurich_user -d zurich_db
```

## 🔄 Environment Variables Reference

### Backend Environment Variables

| Variable | Default | Required | Description |
|----------|---------|----------|-------------|
| `NODE_ENV` | `production` | No | Node environment mode (`development`, `production`, `test`) |
| `PORT` | `3001` | No | Port the NestJS backend listens on |
| `DATABASE_HOST` | `postgres` | No | PostgreSQL hostname (use `postgres` for Docker, `localhost` for local dev) |
| `DATABASE_PORT` | `5432` | No | PostgreSQL port |
| `DATABASE_USERNAME` | `zurich_user` | No | PostgreSQL username |
| `DATABASE_PASSWORD` | `zurich_password` | No | PostgreSQL password |
| `DATABASE_NAME` | `zurich_db` | No | PostgreSQL database name |
| `JWT_SECRET` | — | **Yes** | Secret key for JWT signing and verification (min 64 hex chars) |
| `JWT_EXPIRATION` | `24h` | No | JWT token expiration duration |
| `GOOGLE_CLIENT_ID` | — | **Yes** | Google OAuth 2.0 Client ID |
| `GOOGLE_CLIENT_SECRET` | — | **Yes** | Google OAuth 2.0 Client Secret |
| `GOOGLE_CALLBACK_URL` | `http://localhost:3001/auth/google/callback` | No | OAuth callback redirect URL |
| `FRONTEND_URL` | `http://localhost:3000` | No | Frontend URL for CORS and redirect purposes |
| `UPLOAD_MAX_SIZE` | `10485760` | No | Maximum file upload size in bytes (default: 10MB) |

### Frontend Environment Variables

| Variable | Default | Required | Description |
|----------|---------|----------|-------------|
| `NODE_ENV` | `production` | No | Node environment mode |
| `PORT` | `3000` | No | Port the Next.js server listens on |
| `NEXT_PUBLIC_API_URL` | `http://localhost:3001` | No | Backend API base URL (baked into client bundle at build time) |

### PostgreSQL Environment Variables

| Variable | Default | Required | Description |
|----------|---------|----------|-------------|
| `POSTGRES_USER` | `zurich_user` | No | Database superuser username |
| `POSTGRES_PASSWORD` | `zurich_password` | No | Database superuser password |
| `POSTGRES_DB` | `zurich_db` | No | Default database created on first run |

> **Note:** The PostgreSQL credentials (`POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_DB`) must match the backend's `DATABASE_USERNAME`, `DATABASE_PASSWORD`, and `DATABASE_NAME` respectively. The defaults in `.env.example` are already aligned.

## ⚠️ Notes & Troubleshooting

### Important Notes

- **`.env` file location**: The `.env` file must reside in the `devops/` directory alongside `docker-compose.yml`. Docker Compose automatically loads `.env` from the same directory as the compose file.
- **Build context**: The Docker build context is the **project root** (`..` from `devops/`). Do not move the Dockerfiles outside of this folder without updating the `context` paths in `docker-compose.yml`.
- **All three services are required**: The frontend depends on the backend for API calls, and the backend depends on PostgreSQL for data storage. Starting only one or two services will result in errors.
- **`NEXT_PUBLIC_API_URL` is a build-time variable**: Changing this value requires rebuilding the frontend image. It cannot be changed at runtime because Next.js bakes it into the static JavaScript bundle.
- **JWT_SECRET security**: Use a strong, randomly generated secret of at least 64 hex characters. Never commit this value to version control.

### Common Issues

#### Port Already in Use

```bash
# Check what's using port 3000
lsof -i :3000

# Check what's using port 3001
lsof -i :3001

# Kill the process (replace PID with actual process ID)
kill -9 <PID>
```

Alternatively, change the host port mapping in `docker-compose.yml`:

```yaml
ports:
  - "3002:3000"  # Map host 3002 to container 3000
```

#### Backend Cannot Connect to Database

1. Verify PostgreSQL is healthy:
   ```bash
   docker compose -f docker-compose.yml ps
   ```
   The `postgres` service should show `(healthy)`.

2. Check database credentials match between `POSTGRES_*` and `DATABASE_*` variables.

3. Verify the backend is using `postgres` as the `DATABASE_HOST` (not `localhost`).

4. View backend logs for connection errors:
   ```bash
   docker compose -f docker-compose.yml logs backend
   ```

#### Frontend Cannot Reach Backend

1. Verify `NEXT_PUBLIC_API_URL` is set correctly in `.env`.
2. The value must be accessible from the **browser** (use `http://localhost:3001` for local development, not the internal Docker hostname).
3. Rebuild the frontend after changing `NEXT_PUBLIC_API_URL`:
   ```bash
   docker compose -f docker-compose.yml build --no-cache frontend
   docker compose -f docker-compose.yml up -d frontend
   ```

#### Google OAuth Redirect Mismatch

Ensure the **Authorized redirect URIs** in Google Cloud Console exactly match the `GOOGLE_CALLBACK_URL` in your `.env` file, including the protocol (`http://` vs `https://`) and port.

#### Stale Build Cache

If changes are not reflected after rebuilding:

```bash
# Full rebuild without any cache
docker compose -f docker-compose.yml build --no-cache

# Then restart
docker compose -f docker-compose.yml up -d
```

#### Volume Data Corruption

If the database volume becomes corrupted:

```bash
# Stop services
docker compose -f docker-compose.yml down

# Remove the postgres volume (WARNING: deletes all data)
docker volume rm devops_postgres_data

# Restart (PostgreSQL will reinitialize)
docker compose -f docker-compose.yml up -d
```

### Health Check Details

| Service | Health Check | Interval | Timeout | Retries |
|---------|-------------|----------|---------|---------|
| PostgreSQL | `pg_isready -U zurich_user -d zurich_db` | 10s | 5s | 5 |
| Backend | `curl -f http://localhost:3001/health` | 30s | 10s | 3 |
| Frontend | `curl -f http://localhost:3000` | 30s | 10s | 3 |

The backend service has a `depends_on` condition that waits for PostgreSQL to report `(healthy)` before starting, preventing connection errors during initial startup.

---

*For application-level documentation, see the `backend/README.md` and `frontend/README.md` files.*
