import { Controller, Get, Post, Param, Body, UseGuards, Req } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CustomerService } from './customer.service';
import { ProductResponseDto } from './dto/product-response.dto';
import { CreatePolicyDto } from './dto/create-policy.dto';
import { PolicyResponseDto } from './dto/policy-response.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import type { Request } from 'express';
import { JwtUser } from '../auth/jwt.strategy';

@ApiTags('Products')
@Controller('api/products')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
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
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
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
