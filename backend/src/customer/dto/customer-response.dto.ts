import { ApiProperty } from '@nestjs/swagger';
import { Customer } from '../../entities/customer.entity';
import { CustomerLocation, CustomerRole } from '../../entities/enums';

export class CustomerResponseDto {
  @ApiProperty({ description: 'Customer unique ID', example: 'c123_abc...' })
  id: string;

  @ApiProperty({ description: 'Customer email address', example: 'ahmad@example.com' })
  email: string;

  @ApiProperty({ description: 'Customer first name', example: 'Ahmad' })
  firstName: string;

  @ApiProperty({ description: 'Customer last name', example: 'bin Abdullah' })
  lastName: string;

  @ApiProperty({ description: 'Google profile photo URL', example: 'https://...', nullable: true })
  photoUrl: string | null;

  @ApiProperty({ description: 'Customer location', enum: CustomerLocation, example: 'West Malaysia' })
  location: CustomerLocation;

  @ApiProperty({ description: 'Total premium paid (MYR)', example: 2500.00 })
  premiumPaid: number;

  @ApiProperty({ description: 'Customer role', enum: CustomerRole, example: 'customer' })
  role: CustomerRole;

  @ApiProperty({ description: 'Account creation date' })
  createdAt: Date;

  @ApiProperty({ description: 'Last update date' })
  updatedAt: Date;

  static fromEntity(entity: Customer): CustomerResponseDto {
    const dto = new CustomerResponseDto();
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
    return dto;
  }
}
