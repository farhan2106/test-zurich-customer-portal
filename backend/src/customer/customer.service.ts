import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from '../entities/product.entity';
import { Policy } from '../entities/policy.entity';
import { Customer } from '../entities/customer.entity';
import { ProductStatus, PolicyStatus, CustomerLocation } from '../entities/enums';

@Injectable()
export class CustomerService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @InjectRepository(Policy)
    private readonly policyRepository: Repository<Policy>,
    @InjectRepository(Customer)
    private readonly customerRepository: Repository<Customer>,
  ) {}

  async findAllActiveProducts(): Promise<Product[]> {
    return this.productRepository.find({
      where: { status: ProductStatus.ACTIVE },
    });
  }

  async findProductById(id: string): Promise<Product> {
    const product = await this.productRepository.findOne({
      where: { id },
    });

    if (!product || product.status !== ProductStatus.ACTIVE) {
      throw new NotFoundException(`Product with ID "${id}" not found`);
    }

    return product;
  }

  async purchasePolicy(customerId: string, productId: string): Promise<Policy> {
    // 1. Validate product exists and is active
    const product = await this.productRepository.findOne({ where: { id: productId } });
    if (!product || product.status !== ProductStatus.ACTIVE) {
      throw new BadRequestException('Product not found or inactive');
    }

    // 2. Check for duplicate active policy
    const existingPolicy = await this.policyRepository.findOne({
      where: {
        customerId,
        productId,
        status: PolicyStatus.ACTIVE,
      },
    });
    if (existingPolicy) {
      throw new ConflictException('Customer already has an active policy for this product');
    }

    // 3. Get customer for location
    const customer = await this.customerRepository.findOne({ where: { id: customerId } });
    if (!customer) {
      throw new BadRequestException('Customer not found');
    }

    // 4. Generate policy number
    const today = new Date();
    const datePart = today.toISOString().slice(0, 10).replace(/-/g, '');
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    const policyNumber = `POL-${datePart}-${randomNum}`;

    // 5. Create policy
    const policy = this.policyRepository.create({
      customerId,
      productId,
      policyNumber,
      status: PolicyStatus.ACTIVE,
      startDate: today,
      endDate: new Date(today.getTime() + 365 * 24 * 60 * 60 * 1000),
      premiumAmount: Number(product.basePremium),
      location: customer.location,
    });

    return this.policyRepository.save(policy);
  }
}
