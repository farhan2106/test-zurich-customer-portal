import { DataSource, Repository } from 'typeorm';
import { createTestDataSource, initializeTestDataSource } from '../config/test-db.config';
import { Customer } from '../entities/customer.entity';
import { Product } from '../entities/product.entity';
import { Policy } from '../entities/policy.entity';
import { Claim } from '../entities/claim.entity';
import { CustomerLocation, CustomerRole, ProductStatus, PolicyStatus } from '../entities/enums';

describe('Database Seeder', () => {
  let dataSource: DataSource;
  let productRepo: Repository<Product>;
  let customerRepo: Repository<Customer>;
  let policyRepo: Repository<Policy>;

  beforeAll(async () => {
    dataSource = createTestDataSource([Customer, Product, Policy, Claim]);
    await initializeTestDataSource(dataSource);

    productRepo = dataSource.getRepository(Product);
    customerRepo = dataSource.getRepository(Customer);
    policyRepo = dataSource.getRepository(Policy);
  });

  afterAll(async () => {
    if (dataSource && dataSource.isInitialized) {
      await dataSource.destroy();
    }
  });

  beforeEach(async () => {
    await policyRepo.createQueryBuilder().delete().execute();
    await customerRepo.createQueryBuilder().delete().execute();
    await productRepo.createQueryBuilder().delete().execute();
  });

  function generatePolicyNumber(date: Date, index: number): string {
    const yyyy = date.getFullYear().toString();
    const mm = (date.getMonth() + 1).toString().padStart(2, '0');
    const dd = date.getDate().toString().padStart(2, '0');
    const nnnn = (index + 1).toString().padStart(4, '0');
    return `POL-${yyyy}${mm}${dd}-${nnnn}`;
  }

  async function runSeed(): Promise<void> {
    const PRODUCTS = [
      {
        productCode: 4000,
        name: 'Auto Insurance',
        description:
          'Comprehensive auto insurance covering accidents, theft, and third-party liability.',
        coverageDetails: JSON.stringify({
          accidentDamage: 'Up to RM 100,000',
          theftProtection: 'Market value of vehicle',
          thirdPartyLiability: 'Up to RM 1,000,000',
          roadsideAssistance: '24/7, unlimited callouts',
          windscreenCoverage: 'Up to RM 2,000',
        }),
        basePremium: 500.0,
      },
      {
        productCode: 5000,
        name: 'Property Insurance',
        description:
          'Property insurance covering fire, flood, and structural damage for residential and commercial properties.',
        coverageDetails: JSON.stringify({
          fireAndFlood: 'Up to RM 500,000',
          theftAndBurglary: 'Up to RM 50,000',
          naturalDisaster: 'Up to RM 500,000',
          temporaryHousing: 'Up to RM 10,000',
          contentsInsurance: 'Up to RM 100,000',
        }),
        basePremium: 1200.0,
      },
    ];

    const CUSTOMERS = [
      {
        email: 'george.bluth@yahoo.com.my',
        firstName: 'George',
        lastName: 'Bluth',
        photoUrl: 'https://reqres.in/img/faces/1-image.jpg',
        productCode: 4000,
        location: CustomerLocation.WEST_MALAYSIA,
        premiumPaid: 521.03,
      },
      {
        email: 'janet.weaver@gmail.com',
        firstName: 'Janet',
        lastName: 'Weaver',
        photoUrl: 'https://reqres.in/img/faces/2-image.jpg',
        productCode: 5000,
        location: CustomerLocation.EAST_MALAYSIA,
        premiumPaid: 0.0,
      },
      {
        email: 'emma.wong@mailsaur.net',
        firstName: 'Emma',
        lastName: 'Wong',
        photoUrl: 'https://reqres.in/img/faces/3-image.jpg',
        productCode: 5000,
        location: CustomerLocation.EAST_MALAYSIA,
        premiumPaid: 1453.5,
      },
      {
        email: 'eve.holt@googlemail.co.uk',
        firstName: 'Eve',
        lastName: 'Holt',
        photoUrl: 'https://reqres.in/img/faces/4-image.jpg',
        productCode: 5000,
        location: CustomerLocation.EAST_MALAYSIA,
        premiumPaid: 210.0,
      },
      {
        email: 'charles.morris@grabmart.com.my',
        firstName: 'Charles',
        lastName: 'Morris',
        photoUrl: 'https://reqres.in/img/faces/5-image.jpg',
        productCode: 4000,
        location: CustomerLocation.WEST_MALAYSIA,
        premiumPaid: 700.0,
      },
      {
        email: 'tracey.remos@gmail.com',
        firstName: 'Tracey',
        lastName: 'Ramos',
        photoUrl: 'https://reqres.in/img/faces/6-image.jpg',
        productCode: 4000,
        location: CustomerLocation.WEST_MALAYSIA,
        premiumPaid: 0.0,
      },
      {
        email: 'michael.jackson@sony.com',
        firstName: 'Michael',
        lastName: 'Jackson',
        photoUrl: 'https://reqres.in/img/faces/7-image.jpg',
        productCode: 5000,
        location: CustomerLocation.EAST_MALAYSIA,
        premiumPaid: 0.0,
      },
      {
        email: 'gwen.ferguson@bluebottle.com',
        firstName: 'Gwendolyn',
        lastName: 'Ferguson',
        photoUrl: 'https://reqres.in/img/faces/8-image.jpg',
        productCode: 4000,
        location: CustomerLocation.WEST_MALAYSIA,
        premiumPaid: 342.2,
      },
      {
        email: 'tobias.funke@docomo.co.jp',
        firstName: 'Tobias',
        lastName: 'Funke',
        photoUrl: 'https://reqres.in/img/faces/9-image.jpg',
        productCode: 4000,
        location: CustomerLocation.EAST_MALAYSIA,
        premiumPaid: 95.55,
      },
      {
        email: 'byron.fields@gmail.com',
        firstName: 'Byron',
        lastName: 'Fields',
        photoUrl: 'https://reqres.in/img/faces/10-image.jpg',
        productCode: 4000,
        location: CustomerLocation.WEST_MALAYSIA,
        premiumPaid: 0.0,
      },
      {
        email: 'george.edwards@yahoo.co.id',
        firstName: 'George',
        lastName: 'Edwards',
        photoUrl: 'https://reqres.in/img/faces/11-image.jpg',
        productCode: 5000,
        location: CustomerLocation.EAST_MALAYSIA,
        premiumPaid: 105.9,
      },
      {
        email: 'rachel.winterson@altavista.com',
        firstName: 'Rachel',
        lastName: 'Winterson',
        photoUrl: 'https://reqres.in/img/faces/12-image.jpg',
        productCode: 4000,
        location: CustomerLocation.WEST_MALAYSIA,
        premiumPaid: 0.0,
      },
    ];

    // Clear existing data (idempotency)
    const existingProductCount = await productRepo.count();
    const existingCustomerCount = await customerRepo.count();

    if (existingProductCount > 0 || existingCustomerCount > 0) {
      await policyRepo.createQueryBuilder().delete().execute();
      await customerRepo.createQueryBuilder().delete().execute();
      await productRepo.createQueryBuilder().delete().execute();
    }

    // Seed products
    const savedProducts: Record<number, Product> = {};
    for (const productData of PRODUCTS) {
      const product = productRepo.create({
        productCode: productData.productCode,
        name: productData.name,
        description: productData.description,
        coverageDetails: productData.coverageDetails,
        basePremium: productData.basePremium,
        status: ProductStatus.ACTIVE,
      });
      const saved = await productRepo.save(product);
      savedProducts[productData.productCode] = saved;
    }

    // Seed customers and policies
    const now = new Date();
    const endDate = new Date(now);
    endDate.setFullYear(endDate.getFullYear() + 1);

    for (let i = 0; i < CUSTOMERS.length; i++) {
      const c = CUSTOMERS[i];

      const customer = customerRepo.create({
        email: c.email,
        firstName: c.firstName,
        lastName: c.lastName,
        photoUrl: c.photoUrl,
        location: c.location,
        premiumPaid: c.premiumPaid,
        role: CustomerRole.CUSTOMER,
      });
      const savedCustomer = await customerRepo.save(customer);

      const product = savedProducts[c.productCode];
      const policy = policyRepo.create({
        policyNumber: generatePolicyNumber(now, i),
        customerId: savedCustomer.id,
        productId: product.id,
        status: PolicyStatus.ACTIVE,
        startDate: now,
        endDate: endDate,
        premiumAmount: c.premiumPaid,
        location: c.location,
      });
      await policyRepo.save(policy);
    }
  }

  describe('product seeding', () => {
    it('should create exactly 2 products', async () => {
      await runSeed();
      const count = await productRepo.count();
      expect(count).toBe(2);
    });

    it('should create Auto Insurance with productCode 4000', async () => {
      await runSeed();
      const autoProduct = await productRepo.findOneBy({ productCode: 4000 });
      expect(autoProduct).not.toBeNull();
      expect(autoProduct!.name).toBe('Auto Insurance');
      expect(Number(autoProduct!.basePremium)).toBe(500.0);
    });

    it('should create Property Insurance with productCode 5000', async () => {
      await runSeed();
      const propertyProduct = await productRepo.findOneBy({
        productCode: 5000,
      });
      expect(propertyProduct).not.toBeNull();
      expect(propertyProduct!.name).toBe('Property Insurance');
      expect(Number(propertyProduct!.basePremium)).toBe(1200.0);
    });

    it('should set product status to active', async () => {
      await runSeed();
      const products = await productRepo.find();
      products.forEach((p) => {
        expect(p.status).toBe(ProductStatus.ACTIVE);
      });
    });

    it('should set coverageDetails as JSON string', async () => {
      await runSeed();
      const autoProduct = await productRepo.findOneBy({ productCode: 4000 });
      expect(autoProduct!.coverageDetails).not.toBeNull();
      const coverage = JSON.parse(autoProduct!.coverageDetails);
      expect(coverage.accidentDamage).toBe('Up to RM 100,000');
    });
  });

  describe('customer seeding', () => {
    it('should create exactly 12 customers', async () => {
      await runSeed();
      const count = await customerRepo.count();
      expect(count).toBe(12);
    });

    it('should create George Bluth with correct data', async () => {
      await runSeed();
      const customer = await customerRepo.findOneBy({
        email: 'george.bluth@yahoo.com.my',
      });
      expect(customer).not.toBeNull();
      expect(customer!.firstName).toBe('George');
      expect(customer!.lastName).toBe('Bluth');
      expect(customer!.location).toBe(CustomerLocation.WEST_MALAYSIA);
      expect(customer!.role).toBe(CustomerRole.CUSTOMER);
    });

    it('should create Janet Weaver with correct data', async () => {
      await runSeed();
      const customer = await customerRepo.findOneBy({
        email: 'janet.weaver@gmail.com',
      });
      expect(customer).not.toBeNull();
      expect(customer!.firstName).toBe('Janet');
      expect(customer!.lastName).toBe('Weaver');
      expect(customer!.location).toBe(CustomerLocation.EAST_MALAYSIA);
    });

    it('should create Emma Wong with correct data', async () => {
      await runSeed();
      const customer = await customerRepo.findOneBy({
        email: 'emma.wong@mailsaur.net',
      });
      expect(customer).not.toBeNull();
      expect(customer!.firstName).toBe('Emma');
      expect(customer!.lastName).toBe('Wong');
      expect(customer!.location).toBe(CustomerLocation.EAST_MALAYSIA);
    });

    it('should set all customers to customer role', async () => {
      await runSeed();
      const customers = await customerRepo.find();
      customers.forEach((c) => {
        expect(c.role).toBe(CustomerRole.CUSTOMER);
      });
    });
  });

  describe('policy seeding', () => {
    it('should create exactly 12 policies', async () => {
      await runSeed();
      const count = await policyRepo.count();
      expect(count).toBe(12);
    });

    it('should create one policy per customer', async () => {
      await runSeed();
      const customers = await customerRepo.find();
      const policies = await policyRepo.find();
      expect(policies.length).toBe(customers.length);
    });

    it('should assign correct product to each policy', async () => {
      await runSeed();
      const policies = await policyRepo.find({ relations: ['product'] });

      const georgeBluth = await customerRepo.findOneBy({
        email: 'george.bluth@yahoo.com.my',
      });
      const georgeBluthPolicy = policies.find((p) => p.customerId === georgeBluth?.id);
      expect(georgeBluthPolicy).toBeDefined();
      expect(georgeBluthPolicy!.product.productCode).toBe(4000);

      const janetWeaver = await customerRepo.findOneBy({
        email: 'janet.weaver@gmail.com',
      });
      const janetWeaverPolicy = policies.find((p) => p.customerId === janetWeaver?.id);
      expect(janetWeaverPolicy).toBeDefined();
      expect(janetWeaverPolicy!.product.productCode).toBe(5000);
    });

    it('should generate policy numbers matching POL-YYYYMMDD-NNNN format', async () => {
      await runSeed();
      const policies = await policyRepo.find();
      const policyNumberRegex = /^POL-\d{8}-\d{4}$/;

      policies.forEach((policy) => {
        expect(policy.policyNumber).toMatch(policyNumberRegex);
      });
    });

    it('should set startDate to now and endDate to now + 365 days', async () => {
      await runSeed();
      const policies = await policyRepo.find();
      const now = new Date();
      const toleranceMs = 5000; // 5 second tolerance

      policies.forEach((policy) => {
        const startDateDiff = Math.abs(policy.startDate.getTime() - now.getTime());
        expect(startDateDiff).toBeLessThan(toleranceMs);

        const expectedEndDate = new Date(now);
        expectedEndDate.setFullYear(expectedEndDate.getFullYear() + 1);
        const endDateDiff = Math.abs(policy.endDate.getTime() - expectedEndDate.getTime());
        expect(endDateDiff).toBeLessThan(toleranceMs);
      });
    });

    it('should set policy status to active', async () => {
      await runSeed();
      const policies = await policyRepo.find();
      policies.forEach((policy) => {
        expect(policy.status).toBe(PolicyStatus.ACTIVE);
      });
    });
  });

  describe('premiumPaid values', () => {
    it('should set George Bluth premiumPaid to 521.03', async () => {
      await runSeed();
      const customer = await customerRepo.findOneBy({
        email: 'george.bluth@yahoo.com.my',
      });
      expect(Number(customer!.premiumPaid)).toBe(521.03);
    });

    it('should set Janet Weaver premiumPaid to 0.00', async () => {
      await runSeed();
      const customer = await customerRepo.findOneBy({
        email: 'janet.weaver@gmail.com',
      });
      expect(Number(customer!.premiumPaid)).toBe(0.0);
    });

    it('should set Emma Wong premiumPaid to 1453.50', async () => {
      await runSeed();
      const customer = await customerRepo.findOneBy({
        email: 'emma.wong@mailsaur.net',
      });
      expect(Number(customer!.premiumPaid)).toBe(1453.5);
    });

    it('should set Charles Morris premiumPaid to 700.00', async () => {
      await runSeed();
      const customer = await customerRepo.findOneBy({
        email: 'charles.morris@grabmart.com.my',
      });
      expect(Number(customer!.premiumPaid)).toBe(700.0);
    });

    it('should set Tobias Funke premiumPaid to 95.55', async () => {
      await runSeed();
      const customer = await customerRepo.findOneBy({
        email: 'tobias.funke@docomo.co.jp',
      });
      expect(Number(customer!.premiumPaid)).toBe(95.55);
    });

    it('should set George Edwards premiumPaid to 105.90', async () => {
      await runSeed();
      const customer = await customerRepo.findOneBy({
        email: 'george.edwards@yahoo.co.id',
      });
      expect(Number(customer!.premiumPaid)).toBe(105.9);
    });
  });

  describe('idempotency', () => {
    it('should not duplicate data when run twice', async () => {
      await runSeed();
      const productCount1 = await productRepo.count();
      const customerCount1 = await customerRepo.count();
      const policyCount1 = await policyRepo.count();

      await runSeed();
      const productCount2 = await productRepo.count();
      const customerCount2 = await customerRepo.count();
      const policyCount2 = await policyRepo.count();

      expect(productCount2).toBe(productCount1);
      expect(customerCount2).toBe(customerCount1);
      expect(policyCount2).toBe(policyCount1);

      expect(productCount2).toBe(2);
      expect(customerCount2).toBe(12);
      expect(policyCount2).toBe(12);
    });

    it('should clear and recreate data when run twice', async () => {
      await runSeed();
      const firstCustomers = await customerRepo.find({
        order: { email: 'ASC' },
      });

      await runSeed();
      const secondCustomers = await customerRepo.find({
        order: { email: 'ASC' },
      });

      expect(secondCustomers.length).toBe(firstCustomers.length);
      // Same emails should exist
      const firstEmails = firstCustomers.map((c) => c.email).sort();
      const secondEmails = secondCustomers.map((c) => c.email).sort();
      expect(firstEmails).toEqual(secondEmails);
    });
  });
});
