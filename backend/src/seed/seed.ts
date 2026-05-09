import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AppModule } from '../app.module';
import { Customer } from '../entities/customer.entity';
import { Product } from '../entities/product.entity';
import { Policy } from '../entities/policy.entity';
import { CustomerLocation, CustomerRole, ProductStatus, PolicyStatus } from '../entities/enums';

interface SeedCustomer {
  email: string;
  firstName: string;
  lastName: string;
  photoUrl: string;
  productCode: number;
  location: CustomerLocation;
  premiumPaid: number;
}

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

const CUSTOMERS: SeedCustomer[] = [
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

function generatePolicyNumber(date: Date, index: number): string {
  const yyyy = date.getFullYear().toString();
  const mm = (date.getMonth() + 1).toString().padStart(2, '0');
  const dd = date.getDate().toString().padStart(2, '0');
  const nnnn = (index + 1).toString().padStart(4, '0');
  return `POL-${yyyy}${mm}${dd}-${nnnn}`;
}

async function seed(): Promise<void> {
  const app = await NestFactory.createApplicationContext(AppModule);

  const productRepo = app.get<Repository<Product>>(getRepositoryToken(Product));
  const customerRepo = app.get<Repository<Customer>>(getRepositoryToken(Customer));
  const policyRepo = app.get<Repository<Policy>>(getRepositoryToken(Policy));

  const existingProductCount = await productRepo.count();
  const existingCustomerCount = await customerRepo.count();

  if (existingProductCount > 0 || existingCustomerCount > 0) {
    console.log('Existing data found. Clearing and reseeding...');
    await policyRepo.createQueryBuilder().delete().execute();
    await customerRepo.createQueryBuilder().delete().execute();
    await productRepo.createQueryBuilder().delete().execute();
    console.log('Cleared existing data.');
  }

  console.log('Seeding products...');
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
    console.log(`  Product ${productData.productCode}: ${productData.name}`);
  }

  console.log('Seeding customers and policies...');
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

    console.log(
      `  ${c.firstName} ${c.lastName} (${c.email}) → Product ${c.productCode}, Policy ${policy.policyNumber}`,
    );
  }

  const finalProductCount = await productRepo.count();
  const finalCustomerCount = await customerRepo.count();
  const finalPolicyCount = await policyRepo.count();

  console.log(`\nSeeding complete.`);
  console.log(`  Products: ${finalProductCount}`);
  console.log(`  Customers: ${finalCustomerCount}`);
  console.log(`  Policies: ${finalPolicyCount}`);

  await app.close();
}

seed().catch((error) => {
  console.error('Seeding failed:', error);
  process.exit(1);
});
