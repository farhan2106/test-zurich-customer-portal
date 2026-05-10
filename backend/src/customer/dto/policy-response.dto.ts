import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Policy } from '../../entities/policy.entity';
import { ProductResponseDto } from './product-response.dto';
import { PolicyStatus, CustomerLocation } from '../../entities/enums';

export class PolicyResponseDto {
  @ApiProperty({ description: 'Policy UUID', example: 'pol_abc123' })
  id: string;

  @ApiProperty({ description: 'Policy number', example: 'POL-20260101-1234' })
  policyNumber: string;

  @ApiProperty({ description: 'Customer UUID', example: 'usr_abc123' })
  customerId: string;

  @ApiProperty({ description: 'Product UUID', example: 'prod_abc123' })
  productId: string;

  @ApiProperty({ enum: PolicyStatus, example: PolicyStatus.ACTIVE })
  status: PolicyStatus;

  @ApiProperty({ description: 'Policy start date' })
  startDate: Date;

  @ApiProperty({ description: 'Policy end date (12 months from start)' })
  endDate: Date;

  @ApiProperty({ description: 'Premium amount in MYR', example: 500.00 })
  premiumAmount: number;

  @ApiProperty({ enum: CustomerLocation, example: CustomerLocation.WEST_MALAYSIA })
  location: CustomerLocation;

  @ApiPropertyOptional({ description: 'Nested product details', type: () => ProductResponseDto })
  product?: ProductResponseDto;

  @ApiPropertyOptional({ description: 'Nested claims', isArray: true })
  claims?: any[];

  static fromEntity(policy: Policy): PolicyResponseDto {
    const dto = new PolicyResponseDto();
    dto.id = policy.id;
    dto.policyNumber = policy.policyNumber;
    dto.customerId = policy.customerId;
    dto.productId = policy.productId;
    dto.status = policy.status;
    dto.startDate = policy.startDate;
    dto.endDate = policy.endDate;
    dto.premiumAmount = Number(policy.premiumAmount);
    dto.location = policy.location;

    if (policy.product) {
      dto.product = ProductResponseDto.fromEntity(policy.product);
    }

    if (policy.claims) {
      dto.claims = policy.claims;
    } else {
      dto.claims = [];
    }

    return dto;
  }
}
