import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import { AuthModule } from '../src/auth/auth.module';
import { CustomerModule } from '../src/customer/customer.module';
import { Customer } from '../src/entities/customer.entity';
import { Product } from '../src/entities/product.entity';
import { Policy } from '../src/entities/policy.entity';
import { Claim } from '../src/entities/claim.entity';
import { CustomerLocation, CustomerRole } from '../src/entities/enums';

// ---------------------------------------------------------------------------
// Test module — uses the PostgreSQL test database defined in
// docker-compose.test.yml (port 5433).
// ---------------------------------------------------------------------------
@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres' as const,
      host: process.env.DB_HOST ?? 'localhost',
      port: 5433,
      username: process.env.DB_USERNAME ?? 'zurich_test',
      password: process.env.DB_PASSWORD ?? 'zurich_test_pass',
      database: 'CUSTOMER_BILLING_PORTAL_TEST',
      entities: [Customer, Product, Policy, Claim],
      synchronize: true,
    }),
    AuthModule,
    CustomerModule,
  ],
})
class TestE2eModule {}

describe('Customer Search API (e2e)', () => {
  let app: INestApplication;
  let customerRepo: Repository<Customer>;
  let jwtService: JwtService;
  let adminToken: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [TestE2eModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    await app.init();

    customerRepo = app.get<Repository<Customer>>(getRepositoryToken(Customer));
    jwtService = app.get(JwtService);
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    // Fresh data for every test — delete in reverse FK order
    await customerRepo.query('DELETE FROM claims');
    await customerRepo.query('DELETE FROM policies');
    await customerRepo.query('DELETE FROM customers');
    await customerRepo.query('DELETE FROM products');

    const admin = await customerRepo.save<Customer>({
      email: 'admin@zurich.com',
      firstName: 'Admin',
      lastName: 'User',
      photoUrl: null as any,
      location: CustomerLocation.WEST_MALAYSIA,
      premiumPaid: 0,
      role: CustomerRole.ADMIN,
    } as unknown as Customer);

    await customerRepo.save<Customer>({
      email: 'ahmad@example.com',
      firstName: 'Ahmad',
      lastName: 'bin Abdullah',
      photoUrl: null as any,
      location: CustomerLocation.WEST_MALAYSIA,
      premiumPaid: 500,
      role: CustomerRole.CUSTOMER,
    } as unknown as Customer);

    await customerRepo.save<Customer>({
      email: 'siti@example.com',
      firstName: 'Siti',
      lastName: 'binti Ahmad',
      photoUrl: null as any,
      location: CustomerLocation.EAST_MALAYSIA,
      premiumPaid: 1200,
      role: CustomerRole.CUSTOMER,
    } as unknown as Customer);

    await customerRepo.save<Customer>({
      email: 'john@example.com',
      firstName: 'John',
      lastName: 'Doe',
      photoUrl: null as any,
      location: CustomerLocation.WEST_MALAYSIA,
      premiumPaid: 0,
      role: CustomerRole.CUSTOMER,
    } as unknown as Customer);

    adminToken = jwtService.sign({
      sub: admin.id,
      email: admin.email,
      firstName: admin.firstName,
      lastName: admin.lastName,
      photoUrl: admin.photoUrl,
      role: admin.role,
    });
  });

  // -----------------------------------------------------------------------
  // Auth guards
  // -----------------------------------------------------------------------
  describe('authentication', () => {
    it('GET /api/customers should return 401 without token', async () => {
      await request(app.getHttpServer()).get('/api/customers').expect(401);
    });

    it('GET /api/customers should return 403 for non-admin user', async () => {
      const customer = await customerRepo.findOne({
        where: { email: 'ahmad@example.com' },
      });
      const customerToken = jwtService.sign({
        sub: customer!.id,
        email: customer!.email,
        firstName: customer!.firstName,
        lastName: customer!.lastName,
        photoUrl: customer!.photoUrl,
        role: customer!.role,
      });

      await request(app.getHttpServer())
        .get('/api/customers')
        .set('Authorization', `Bearer ${customerToken}`)
        .expect(403);
    });
  });

  // -----------------------------------------------------------------------
  // List all — no filters
  // -----------------------------------------------------------------------
  describe('list all (no filters)', () => {
    it('GET /api/customers returns all customers with pagination meta', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/customers')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(res.body.data).toHaveLength(4);
      expect(res.body.meta.totalItems).toBe(4);
      expect(res.body.meta.page).toBe(1);
      expect(res.body.meta.limit).toBe(20);
      expect(res.body.meta.totalPages).toBe(1);
    });
  });

  // -----------------------------------------------------------------------
  // Search
  // -----------------------------------------------------------------------
  describe('search (?search=…)', () => {
    it('finds by last name', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/customers')
        .query({ search: 'bin Abdullah' })
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(res.body.data).toHaveLength(1);
      expect(res.body.data[0].firstName).toBe('Ahmad');
    });

    it('finds by email', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/customers')
        .query({ search: 'ahmad@example.com' })
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(res.body.data).toHaveLength(1);
      expect(res.body.data[0].email).toBe('ahmad@example.com');
    });

    it('finds by email domain', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/customers')
        .query({ search: 'example.com' })
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(res.body.data).toHaveLength(3);
    });

    it('returns empty result for non-matching search', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/customers')
        .query({ search: 'nonexistent' })
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(res.body.data).toHaveLength(0);
      expect(res.body.meta.totalItems).toBe(0);
    });
  });

  // -----------------------------------------------------------------------
  // Individual field filters
  // -----------------------------------------------------------------------
  describe('field filters', () => {
    it('?firstName=… filters by first name (LIKE)', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/customers')
        .query({ firstName: 'Ahmad' })
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(res.body.data).toHaveLength(1);
      expect(res.body.data[0].firstName).toBe('Ahmad');
    });

    it('?lastName=… filters by last name (LIKE)', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/customers')
        .query({ lastName: 'Doe' })
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(res.body.data).toHaveLength(1);
      expect(res.body.data[0].lastName).toBe('Doe');
    });

    it('?email=… filters by email (LIKE)', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/customers')
        .query({ email: 'siti' })
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(res.body.data).toHaveLength(1);
      expect(res.body.data[0].email).toBe('siti@example.com');
    });

    it('?location=… filters by exact location', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/customers')
        .query({ location: 'East Malaysia' })
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(res.body.data).toHaveLength(1);
      expect(res.body.data[0].firstName).toBe('Siti');
    });

    it('?role=… filters by role', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/customers')
        .query({ role: 'admin' })
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(res.body.data).toHaveLength(1);
      expect(res.body.data[0].role).toBe('admin');
    });
  });

  // -----------------------------------------------------------------------
  // Pagination
  // -----------------------------------------------------------------------
  describe('pagination', () => {
    it('?page=1&limit=2 returns first page with 2 items', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/customers')
        .query({ page: '1', limit: '2' })
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(res.body.data).toHaveLength(2);
      expect(res.body.meta.page).toBe(1);
      expect(res.body.meta.limit).toBe(2);
      expect(res.body.meta.totalItems).toBe(4);
      expect(res.body.meta.totalPages).toBe(2);
    });
  });
});
