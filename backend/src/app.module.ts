import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { CustomerModule } from './customer/customer.module';
import { Customer } from './entities/customer.entity';
import { Policy } from './entities/policy.entity';
import { Claim } from './entities/claim.entity';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST ?? 'localhost',
      port: parseInt(process.env.DB_PORT ?? '5432', 10),
      username: process.env.DB_USERNAME ?? 'zurich',
      password: process.env.DB_PASSWORD ?? 'zurich_pass',
      database: process.env.DB_DATABASE ?? 'CUSTOMER_BILLING_PORTAL',
      autoLoadEntities: true,
      synchronize: true,
    }),
    TypeOrmModule.forFeature([Customer, Policy, Claim]),
    AuthModule,
    CustomerModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
