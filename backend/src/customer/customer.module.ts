import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from '../entities/product.entity';
import { Policy } from '../entities/policy.entity';
import { Customer } from '../entities/customer.entity';
import { Claim } from '../entities/claim.entity';
import {
  CustomerController,
  PolicyController,
  ClaimsController,
  AdminCustomerController,
} from './customer.controller';
import { CustomerService } from './customer.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';

@Module({
  imports: [TypeOrmModule.forFeature([Product, Policy, Customer, Claim])],
  controllers: [CustomerController, PolicyController, ClaimsController, AdminCustomerController],
  providers: [CustomerService, JwtAuthGuard, RolesGuard],
})
export class CustomerModule {}
