<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

# Zurich Customer Portal — Backend

A NestJS-based backend API for the Zurich Customer & Billing Portal, providing customer management, policy administration, and claims handling with Google OAuth 2.0 authentication.

---

## Tech Stack

| Layer             | Technology                        |
| ----------------- | --------------------------------- |
| Runtime           | Node.js (TypeScript)              |
| Framework         | NestJS 11                         |
| ORM               | TypeORM 0.3                       |
| Database          | PostgreSQL 16                     |
| Authentication    | Passport (JWT + Google OAuth 2.0) |
| Validation        | class-validator + class-transformer |
| API Documentation | Swagger / OpenAPI (via `@nestjs/swagger`) |

---

## Prerequisites

- [Node.js](https://nodejs.org/) >= 18
- [PostgreSQL](https://www.postgresql.org/download/) 16 installed locally and running on port 5432
- npm

---

## Getting Started

### 1. Clone & Install

```bash
cd backend
npm install
```

### 2. Environment Configuration

Copy the sample environment file and fill in your values:

```bash
cp .env.sample .env
```

The key database variables are:

| Variable      | Default       | Description                     |
|---------------|---------------|---------------------------------|
| `DB_HOST`     | `localhost`   | PostgreSQL host                 |
| `DB_PORT`     | `5432`        | PostgreSQL port (dev)           |
| `DB_USERNAME` | `zurich`      | Database user                   |
| `DB_PASSWORD` | `zurich_pass` | Database password               |
| `DB_DATABASE` | `CUSTOMER_BILLING_PORTAL` | Database name |

> **Note:** Default credentials shown here are for local development only. For production, always use strong, unique credentials.

---

## Database Setup

### Local PostgreSQL (Development)

For day-to-day development, the application connects to a PostgreSQL instance running directly on your machine (not via Docker).

**1. Install PostgreSQL 16**

Download and install from the [official website](https://www.postgresql.org/download/) or use your package manager:

```bash
# macOS (Homebrew)
brew install postgresql@16
brew services start postgresql@16

# Ubuntu/Debian
sudo apt install postgresql-16
sudo systemctl start postgresql

# Windows
# Download installer from https://www.postgresql.org/download/windows/
```

**2. Create the database and user (suggested)**

Depending on your PostgreSQL setup, you may need to create the database user and database first. For example, from a `psql` shell:

```sql
CREATE USER zurich WITH PASSWORD 'zurich_pass';
CREATE DATABASE "CUSTOMER_BILLING_PORTAL" OWNER zurich;
GRANT ALL PRIVILEGES ON DATABASE "CUSTOMER_BILLING_PORTAL" TO zurich;
```

> Adjust the username, password, and database name to match your `.env` configuration.

**3. Verify the connection**

```bash
psql -h localhost -p 5432 -U zurich -d CUSTOMER_BILLING_PORTAL
```

Enter the password `zurich_pass` when prompted. You should see a `CUSTOMER_BILLING_PORTAL=>` prompt.

> **Note:** The default credentials above match the `.env.sample` file. In production, always use strong, unique credentials.

---

## Database Schema & Migrations

### Current Approach: `synchronize: true` (Development Only)

For local development, TypeORM is configured with `synchronize: true` in `src/app.module.ts`:

```typescript
TypeOrmModule.forRoot({
  type: 'postgres',
  host: process.env.DB_HOST ?? 'localhost',
  port: parseInt(process.env.DB_PORT ?? '5432', 10),
  username: process.env.DB_USERNAME ?? 'zurich',
  password: process.env.DB_PASSWORD ?? 'zurich_pass',
  database: process.env.DB_DATABASE ?? 'CUSTOMER_BILLING_PORTAL',
  autoLoadEntities: true,
  synchronize: true, // Auto-creates tables from entities (dev only)
})
```

This means tables are **automatically created and updated** from your entity definitions on every application start. **Do not use `synchronize: true` in production** — it can cause data loss.

### Entities

The following entities are auto-loaded and synchronized:

| Entity     | Table       | Key Fields                                                                        |
|------------|-------------|-----------------------------------------------------------------------------------|
| `Customer` | `customers` | `id` (UUID PK), `email`, `firstName`, `lastName`, `location` (enum), `role` (enum) |
| `Policy`   | `policies`  | `id` (UUID PK), `policyNumber`, `status` (enum), `premiumAmount`, `customerId` (FK), `productId` (FK) |
| `Claim`    | `claims`    | `id` (UUID PK), `claimNumber`, `type` (enum), `status` (enum), `description`, `policyId` (FK), `customerId` (FK) |
| `Product`  | `products`  | `id` (UUID PK), `productCode`, `name`, `description`, `basePremium`, `status` (enum) |

### Entity Relationships

```
Customer ──1:N──> Policy ──1:N──> Claim
                     │
                     └──N:1── Product
```

### Adding TypeORM Migrations

```bash
# Generate a migration from entity changes
npm run migration:generate -- src/migrations/AddNewColumn

# Apply pending migrations
npm run migration:run

# Revert the last migration
npm run migration:revert

# Create an empty migration (for custom SQL)
npm run migration:create -- src/migrations/CustomMigration
```

### Migration Workflow

```
1. Modify entity files (add columns, change types, etc.)
2. Generate:  npm run migration:generate -- src/migrations/AddNewColumn
3. Review:    Check the generated SQL in src/migrations/
4. Run:       npm run migration:run
5. Commit:    Commit both the entity changes and migration files
```

---

## Seeding

The project includes a seed script to populate the database with sample data:

```bash
npm run seed
```

This creates:

- Sample customers with different locations (West Malaysia / East Malaysia)
- Sample products with varying coverages
- Policies linked to customers with active/expired/cancelled statuses
- Sample claims under review

> **Note:** The seed script connects using environment variables from your `.env` file. Ensure the database is running before executing.

---

## Running the Application

```bash
# Development (watch mode with hot reload)
npm run start:dev

# Debug mode
npm run start:debug

# Production build
npm run build
npm run start:prod
```

The server starts on the port defined by `API_URL` in `.env` (defaults to `http://localhost:3001`).

---

## Testing

```bash
# Unit tests
npm test

# Unit tests (watch mode)
npm run test:watch

# Unit tests with coverage
npm run test:cov

# Integration tests (spins up test DB, runs tests, tears down)
npm run test:integration

# E2E tests
npm run test:e2e

# All tests (unit + integration)
npm run test:all
```

### Integration Tests

Integration tests use an isolated PostgreSQL container spun up via Docker specifically for testing:

- Defined in [`test/docker-compose.test.yml`](./test/docker-compose.test.yml) — a separate PostgreSQL container on port `5433` with database `CUSTOMER_BILLING_PORTAL_TEST`.
- The `test:integration` script (`npm run test:db:start && jest ... && npm run test:db:stop`) automatically starts the container, runs the test suite, and tears it down.
- **No Docker required for normal development** — the test database container is only started during `npm run test:integration` and `npm run test:all`.
- The test database uses the same entity schema via TypeORM's `synchronize` mode.

> **Prerequisite for integration tests:** [Docker Desktop](https://www.docker.com/products/docker-desktop/) must be installed and running to spin up the test PostgreSQL container.

---

## Project Structure

```
backend/
├── src/
│   ├── auth/                    # Authentication module (Google OAuth, JWT)
│   ├── common/                  # Shared guards, decorators, filters
│   ├── customer/                # Customer module
│   ├── entities/                # TypeORM entity definitions
│   │   ├── customer.entity.ts
│   │   ├── policy.entity.ts
│   │   ├── claim.entity.ts
│   │   ├── product.entity.ts
│   │   └── enums.ts
│   ├── seed/                    # Database seed script
│   │   ├── seed.ts
│   │   └── seed.integration.spec.ts
│   ├── test/
│   │   ├── docker-compose.test.yml   # PostgreSQL container for integration tests
│   │   └── ...                       # E2E test setup
│   ├── app.module.ts            # Root module (TypeORM config here)
│   ├── app.controller.ts
│   ├── main.ts                  # Application entry point
│   └── ...
├── .env                         # Environment variables (git-ignored)
├── .env.sample                  # Environment template with documentation
├── jest.integration.config.js
├── nest-cli.json
├── package.json
└── README.md
```

---

## Linting & Formatting

```bash
# Lint (ESLint)
npm run lint

# Format (Prettier)
npm run format
```

---

## Environment Variables Reference

| Variable                | Required | Default        | Description                                      |
| ----------------------- | -------- | -------------- | ------------------------------------------------ |
| `DB_HOST`               | Yes      | `localhost`    | PostgreSQL hostname                              |
| `DB_PORT`               | Yes      | `5432`         | PostgreSQL port                                  |
| `DB_USERNAME`           | Yes      | `zurich`       | Database user                                    |
| `DB_PASSWORD`           | Yes      | `zurich_pass`  | Database password                                |
| `DB_DATABASE`           | Yes      | `CUSTOMER_BILLING_PORTAL` | Database name                    |
| `GOOGLE_CLIENT_ID`      | Yes      | —              | Google OAuth 2.0 client ID                       |
| `GOOGLE_CLIENT_SECRET`  | Yes      | —              | Google OAuth 2.0 client secret                   |
| `JWT_SECRET`            | Yes      | —              | Secret key for JWT signing                       |
| `API_URL`               | Yes      | —              | Full base URL of the backend API                 |

---

## Resources

- [NestJS Documentation](https://docs.nestjs.com)
- [TypeORM Documentation](https://typeorm.io)
- [PostgreSQL 16 Documentation](https://www.postgresql.org/docs/16/index.html)
- [Passport Documentation](https://www.passportjs.org/docs/)
