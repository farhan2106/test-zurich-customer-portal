import { BadRequestException, ConflictException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { Product } from '../entities/product.entity';
import { Policy } from '../entities/policy.entity';
import { Customer } from '../entities/customer.entity';
import { Claim } from '../entities/claim.entity';
import { ProductStatus, PolicyStatus, CustomerLocation, ClaimType, ClaimStatus } from '../entities/enums';
import { CreateClaimDto } from './dto/create-claim.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';

@Injectable()
export class CustomerService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @InjectRepository(Policy)
    private readonly policyRepository: Repository<Policy>,
    @InjectRepository(Customer)
    private readonly customerRepository: Repository<Customer>,
    @InjectRepository(Claim)
    private readonly claimRepository: Repository<Claim>,
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

  async findPoliciesByCustomerId(customerId: string): Promise<Policy[]> {
    return this.policyRepository.find({
      where: { customerId },
      relations: ['product'],
    });
  }

  async findPolicyById(id: string, customerId: string): Promise<Policy> {
    const policy = await this.policyRepository.findOne({
      where: { id },
      relations: ['product', 'claims'],
    });

    if (!policy) {
      throw new NotFoundException('Policy not found');
    }

    if (policy.customerId !== customerId) {
      throw new ForbiddenException('You do not have access to this policy');
    }

    return policy;
  }

  async renewPolicy(policyId: string, customerId: string): Promise<Policy> {
    const policy = await this.policyRepository.findOne({
      where: { id: policyId },
    });

    if (!policy) {
      throw new NotFoundException('Policy not found');
    }

    if (policy.customerId !== customerId) {
      throw new ForbiddenException('You do not have access to this policy');
    }

    if (policy.status !== PolicyStatus.ACTIVE) {
      throw new BadRequestException('Only active policies can be renewed');
    }

    const now = new Date();
    const endDate = new Date(policy.endDate);
    const daysUntilExpiry = Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    if (daysUntilExpiry > 30) {
      throw new BadRequestException('Policy can only be renewed within 30 days of expiry');
    }

    policy.endDate = new Date(endDate.getTime() + 365 * 24 * 60 * 60 * 1000);

    return this.policyRepository.save(policy);
  }

  async submitClaim(customerId: string, dto: CreateClaimDto): Promise<Claim> {
    const policy = await this.policyRepository.findOne({
      where: { id: dto.policyId },
    });

    if (!policy) {
      throw new NotFoundException('Policy not found');
    }

    if (policy.customerId !== customerId) {
      throw new ForbiddenException('Policy does not belong to this customer');
    }

    if (policy.status !== PolicyStatus.ACTIVE) {
      throw new BadRequestException('Claims can only be submitted against active policies');
    }

    // Generate claim number
    const today = new Date();
    const datePart = today.toISOString().slice(0, 10).replace(/-/g, '');
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    const claimNumber = `CLM-${datePart}-${randomNum}`;

    const claim = this.claimRepository.create({
      claimNumber,
      customerId,
      policyId: dto.policyId,
      type: dto.type,
      description: dto.description,
      incidentDate: new Date(dto.incidentDate),
      incidentLocation: dto.incidentLocation || null,
      status: ClaimStatus.SUBMITTED,
    });

    return this.claimRepository.save(claim);
  }

  async findClaimsByCustomerId(customerId: string): Promise<Claim[]> {
    return this.claimRepository.find({
      where: { customerId },
      relations: ['policy'],
      order: { createdAt: 'DESC' },
    });
  }

  async findAllCustomers(filters?: { search?: string; location?: string }): Promise<Customer[]> {
    const where: any = {};

    if (filters?.location) {
      where.location = filters.location;
    }

    if (filters?.search) {
      return this.customerRepository.find({
        where: [
          { ...where, firstName: Like(`%${filters.search}%`) },
          { ...where, lastName: Like(`%${filters.search}%`) },
          { ...where, email: Like(`%${filters.search}%`) },
        ],
      });
    }

    return this.customerRepository.find({
      where,
    });
  }

  async findCustomerById(id: string): Promise<Customer> {
    const customer = await this.customerRepository.findOne({
      where: { id },
      relations: ['policies', 'policies.product', 'claims'],
    });

    if (!customer) {
      throw new NotFoundException('Customer not found');
    }

    return customer;
  }

  async updateCustomer(id: string, dto: UpdateCustomerDto): Promise<Customer> {
    const customer = await this.customerRepository.findOne({
      where: { id },
    });

    if (!customer) {
      throw new NotFoundException('Customer not found');
    }

    // Partial update: only apply provided fields
    if (dto.firstName !== undefined) customer.firstName = dto.firstName;
    if (dto.lastName !== undefined) customer.lastName = dto.lastName;
    if (dto.photoUrl !== undefined) customer.photoUrl = dto.photoUrl;
    if (dto.location !== undefined) customer.location = dto.location;
    if (dto.premiumPaid !== undefined) customer.premiumPaid = dto.premiumPaid;
    // Email is intentionally NOT updated (immutable)

    return this.customerRepository.save(customer);
  }

  async findClaimById(id: string, customerId: string): Promise<Claim> {
    const claim = await this.claimRepository.findOne({
      where: { id },
      relations: ['policy'],
    });

    if (!claim) {
      throw new NotFoundException('Claim not found');
    }

    if (claim.customerId !== customerId) {
      throw new ForbiddenException('You do not have access to this claim');
    }

    return claim;
  }
}
