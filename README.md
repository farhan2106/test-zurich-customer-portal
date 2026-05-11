# Zurich Customer Portal

A comprehensive customer and billing portal for insurance policy management, claims handling, and account administration. Built as a modern monorepo with a Next.js frontend, NestJS backend API, and Docker-based production deployment.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 16, React 19, Tailwind CSS, daisyUI, Redux Toolkit |
| Backend | NestJS 11, TypeORM, PostgreSQL 16 |
| Auth | Google OAuth 2.0, JWT |
| Infrastructure | Docker Compose, PostgreSQL 16 Alpine, multi-stage builds |

## Project Structure

```
zurich-app/
├── backend/       # NestJS API server (port 3001)
├── frontend/      # Next.js application (port 3000)
└── devops/        # Docker Compose + production deployment
```

## Quick Links

- [Backend README](./backend/README.md) — API documentation, environment setup, database migrations, Swagger
- [Frontend README](./frontend/README.md) — UI development, component library, environment variables
- [DevOps README](./devops/README.md) — Production deployment, Docker Compose, volumes, troubleshooting

## Quick Start

### Path A — Local Development (without Docker)

```bash
# Backend
cd backend
cp .env.sample .env   # Fill in your values
npm install
npm run migration:run
npm run start:dev

# Frontend (separate terminal)
cd frontend
cp .env.sample .env.local
npm install
npm run dev
```

### Path B — Production Stack (with Docker)

```bash
cd devops
cp .env.example .env    # Fill in required values
docker compose up -d
```

## Navigation

- **API Docs** → `/api/docs` when the backend is running
- **Database Config** → `backend/src/config/`
- **UI Components** → `frontend/src/`
- **Deployment Config** → `devops/`
