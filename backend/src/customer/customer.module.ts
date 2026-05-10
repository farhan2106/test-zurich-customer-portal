import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from '../entities/product.entity';
import { Policy } from '../entities/policy.entity';
import { Customer } from '../entities/customer.entity';
import { CustomerController, PolicyController } from './customer.controller';
import { CustomerService } from './customer.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Module({
  imports: [TypeOrmModule.forFeature([Product, Policy, Customer])],
  controllers: [CustomerController, PolicyController],
  providers: [CustomerService, JwtAuthGuard],
})
export class CustomerModule {}
