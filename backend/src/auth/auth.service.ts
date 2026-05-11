import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Customer } from '../entities/customer.entity';
import { CustomerLocation, CustomerRole } from '../entities/enums';

export interface GoogleProfile {
  email: string;
  firstName: string;
  lastName: string;
  photoUrl: string;
}

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(Customer)
    private readonly customerRepository: Repository<Customer>,
    private readonly jwtService: JwtService,
  ) {}

  signToken(customer: Customer): string {
    const payload = {
      sub: customer.id,
      email: customer.email,
      firstName: customer.firstName,
      lastName: customer.lastName,
      photoUrl: customer.photoUrl,
      role: customer.role,
    };
    return this.jwtService.sign(payload, { expiresIn: '24h' });
  }

  async validateOrCreateUser(profile: GoogleProfile): Promise<Customer> {
    let customer = await this.customerRepository.findOne({
      where: { email: profile.email },
    });

    if (!customer) {
      customer = this.customerRepository.create({
        email: profile.email,
        firstName: profile.firstName,
        lastName: profile.lastName,
        photoUrl: profile.photoUrl,
        location: CustomerLocation.WEST_MALAYSIA,
        role: CustomerRole.ADMIN, // just for demo purposes
      });
      await this.customerRepository.save(customer);
    }

    return customer;
  }

  async findByEmail(email: string): Promise<Customer | null> {
    return this.customerRepository.findOne({ where: { email } });
  }

  async validateGoogleUser(profile: GoogleProfile): Promise<Customer> {
    return this.validateOrCreateUser(profile);
  }
}
