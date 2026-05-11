import { Controller, Get, Post, Patch, Param, Body, UseGuards, Req, Query } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
  ApiQuery,
} from '@nestjs/swagger';
import { CustomerService } from './customer.service';
import { ProductResponseDto } from './dto/product-response.dto';
import { CreatePolicyDto } from './dto/create-policy.dto';
import { PolicyResponseDto } from './dto/policy-response.dto';
import { CreateClaimDto } from './dto/create-claim.dto';
import { ClaimResponseDto } from './dto/claim-response.dto';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CustomerResponseDto } from './dto/customer-response.dto';
import { AdminCustomerDetailDto } from './dto/admin-customer-detail.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import { CustomerLocation } from '../entities/enums';
import type { Request } from 'express';
import { JwtUser } from '../auth/jwt.strategy';

@ApiTags('Products')
@Controller('api/products')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
export class CustomerController {
  constructor(private readonly customerService: CustomerService) {}

  @Get()
  @ApiOperation({ summary: 'List all active products' })
  @ApiResponse({ status: 200, description: 'Active products returned', type: [ProductResponseDto] })
  async getProducts(): Promise<ProductResponseDto[]> {
    const products = await this.customerService.findAllActiveProducts();
    return products.map(ProductResponseDto.fromEntity);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get product by ID' })
  @ApiParam({ name: 'id', description: 'Product UUID', example: 'prod_abc123' })
  @ApiResponse({ status: 200, description: 'Product found', type: ProductResponseDto })
  @ApiResponse({ status: 404, description: 'Product not found' })
  async getProductById(@Param('id') id: string): Promise<ProductResponseDto> {
    const product = await this.customerService.findProductById(id);
    return ProductResponseDto.fromEntity(product);
  }
}

@ApiTags('Policies')
@Controller('api/policies')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
export class PolicyController {
  constructor(private readonly customerService: CustomerService) {}

  @Post()
  @ApiOperation({ summary: 'Purchase a new insurance policy' })
  @ApiResponse({ status: 201, description: 'Policy purchased', type: PolicyResponseDto })
  @ApiResponse({ status: 400, description: 'Invalid product' })
  @ApiResponse({ status: 409, description: 'Duplicate active policy' })
  async purchase(@Req() req: Request, @Body() dto: CreatePolicyDto): Promise<PolicyResponseDto> {
    const user = req.user as JwtUser;
    const policy = await this.customerService.purchasePolicy(user.sub, dto.productId);
    return PolicyResponseDto.fromEntity(policy);
  }

  @Get()
  @ApiOperation({ summary: 'List my insurance policies' })
  @ApiResponse({ status: 200, description: 'Policies returned', type: [PolicyResponseDto] })
  async list(@Req() req: Request): Promise<PolicyResponseDto[]> {
    const user = req.user as JwtUser;
    const policies = await this.customerService.findPoliciesByCustomerId(user.sub);
    return policies.map(PolicyResponseDto.fromEntity);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get policy by ID' })
  @ApiParam({ name: 'id', description: 'Policy UUID', example: 'pol_abc123' })
  @ApiResponse({ status: 200, description: 'Policy found', type: PolicyResponseDto })
  @ApiResponse({ status: 403, description: 'Access denied' })
  @ApiResponse({ status: 404, description: 'Policy not found' })
  async detail(@Req() req: Request, @Param('id') id: string): Promise<PolicyResponseDto> {
    const user = req.user as JwtUser;
    const policy = await this.customerService.findPolicyById(id, user.sub);
    return PolicyResponseDto.fromEntity(policy);
  }

  @Post(':id/renew')
  @ApiOperation({ summary: 'Renew an existing policy' })
  @ApiParam({ name: 'id', description: 'Policy UUID', example: 'pol_abc123' })
  @ApiResponse({ status: 200, description: 'Policy renewed', type: PolicyResponseDto })
  @ApiResponse({ status: 400, description: 'Policy not renewable' })
  @ApiResponse({ status: 403, description: 'Access denied' })
  @ApiResponse({ status: 404, description: 'Policy not found' })
  async renew(@Req() req: Request, @Param('id') id: string): Promise<PolicyResponseDto> {
    const user = req.user as JwtUser;
    const policy = await this.customerService.renewPolicy(id, user.sub);
    return PolicyResponseDto.fromEntity(policy);
  }
}

@ApiTags('Claims')
@Controller('api/claims')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
export class ClaimsController {
  constructor(private readonly customerService: CustomerService) {}

  @Post()
  @ApiOperation({ summary: 'Submit a new claim' })
  @ApiResponse({ status: 201, description: 'Claim submitted', type: ClaimResponseDto })
  @ApiResponse({ status: 400, description: 'Invalid request' })
  @ApiResponse({ status: 403, description: 'Policy does not belong to customer' })
  @ApiResponse({ status: 404, description: 'Policy not found' })
  async create(@Req() req: Request, @Body() dto: CreateClaimDto): Promise<ClaimResponseDto> {
    const user = req.user as JwtUser;
    const claim = await this.customerService.submitClaim(user.sub, dto);
    return ClaimResponseDto.fromEntity(claim);
  }

  @Get()
  @ApiOperation({ summary: 'List claims for authenticated user' })
  @ApiResponse({ status: 200, description: 'Claims retrieved', type: [ClaimResponseDto] })
  async list(@Req() req: Request): Promise<ClaimResponseDto[]> {
    const user = req.user as JwtUser;
    const claims = await this.customerService.findClaimsByCustomerId(user.sub);
    return claims.map(ClaimResponseDto.fromEntity);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get claim details' })
  @ApiParam({ name: 'id', description: 'Claim UUID', example: 'clm_abc123' })
  @ApiResponse({ status: 200, description: 'Claim details', type: ClaimResponseDto })
  @ApiResponse({ status: 403, description: 'Access denied' })
  @ApiResponse({ status: 404, description: 'Claim not found' })
  async detail(@Req() req: Request, @Param('id') id: string): Promise<ClaimResponseDto> {
    const user = req.user as JwtUser;
    const claim = await this.customerService.findClaimById(id, user.sub);
    return ClaimResponseDto.fromEntity(claim);
  }
}

@ApiTags('Admin Customers')
@Controller('api/customers')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
export class AdminCustomerController {
  constructor(private readonly customerService: CustomerService) {}

  @Get()
  @Roles('admin')
  @ApiOperation({ summary: 'List all customers (admin)' })
  @ApiQuery({
    name: 'search',
    required: false,
    description: 'Search by firstName, lastName, or email',
  })
  @ApiQuery({
    name: 'location',
    required: false,
    description: 'Filter by location',
    enum: CustomerLocation,
  })
  @ApiResponse({ status: 200, description: 'List of customers', type: [CustomerResponseDto] })
  @ApiResponse({ status: 403, description: 'Forbidden - requires admin role' })
  async listCustomers(
    @Query() filters: { search?: string; location?: string },
  ): Promise<CustomerResponseDto[]> {
    const customers = await this.customerService.findAllCustomers(filters);
    return customers.map((c) => CustomerResponseDto.fromEntity(c));
  }

  @Get(':id')
  @Roles('admin')
  @ApiOperation({ summary: 'Get customer details (admin)' })
  @ApiParam({ name: 'id', description: 'Customer UUID', example: 'usr_abc123' })
  @ApiResponse({ status: 200, description: 'Customer details', type: AdminCustomerDetailDto })
  @ApiResponse({ status: 403, description: 'Forbidden - requires admin role' })
  @ApiResponse({ status: 404, description: 'Customer not found' })
  async getCustomerById(@Param('id') id: string): Promise<AdminCustomerDetailDto> {
    const customer = await this.customerService.findCustomerById(id);
    return AdminCustomerDetailDto.fromEntity(customer);
  }

  @Patch(':id')
  @Roles('admin')
  @ApiOperation({ summary: 'Update customer details (admin)' })
  @ApiParam({ name: 'id', description: 'Customer UUID', example: 'usr_abc123' })
  @ApiResponse({ status: 200, description: 'Customer updated', type: CustomerResponseDto })
  @ApiResponse({ status: 400, description: 'Validation failed' })
  @ApiResponse({ status: 403, description: 'Forbidden - requires admin role' })
  @ApiResponse({ status: 404, description: 'Customer not found' })
  async updateCustomer(
    @Param('id') id: string,
    @Body() dto: UpdateCustomerDto,
  ): Promise<CustomerResponseDto> {
    const customer = await this.customerService.updateCustomer(id, dto);
    return CustomerResponseDto.fromEntity(customer);
  }
}
