import { ApiProperty } from '@nestjs/swagger';
import { Customer } from '../../entities/customer.entity';
import { CustomerResponseDto } from './customer-response.dto';
import { PolicyResponseDto } from './policy-response.dto';
import { ClaimResponseDto } from './claim-response.dto';

export class AdminCustomerDetailDto extends CustomerResponseDto {
  @ApiProperty({ description: 'Customer policies', type: [PolicyResponseDto] })
  policies: any[];

  @ApiProperty({ description: 'Customer claims', type: [ClaimResponseDto] })
  claims: any[];

  static fromEntity(entity: Customer): AdminCustomerDetailDto {
    const dto = new AdminCustomerDetailDto();
    // Copy base fields
    dto.id = entity.id;
    dto.email = entity.email;
    dto.firstName = entity.firstName;
    dto.lastName = entity.lastName;
    dto.photoUrl = entity.photoUrl;
    dto.location = entity.location;
    dto.premiumPaid = Number(entity.premiumPaid);
    dto.role = entity.role;
    dto.createdAt = entity.createdAt;
    dto.updatedAt = entity.updatedAt;
    // Add relations if loaded
    dto.policies = entity.policies || [];
    dto.claims = entity.claims || [];
    return dto;
  }
}
