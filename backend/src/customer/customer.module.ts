import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from '../entities/product.entity';
import { CustomerController } from './customer.controller';
import { CustomerService } from './customer.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Module({
  imports: [TypeOrmModule.forFeature([Product])],
  controllers: [CustomerController],
  providers: [CustomerService, JwtAuthGuard],
})
export class CustomerModule {}
