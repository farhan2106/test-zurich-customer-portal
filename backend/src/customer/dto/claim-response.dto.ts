import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Claim } from '../../entities/claim.entity';
import { ClaimType, ClaimStatus } from '../../entities/enums';

export class ClaimResponseDto {
  @ApiProperty({ description: 'Claim UUID' })
  id: string;

  @ApiProperty({ description: 'Claim number', example: 'CLM-20260510-0001' })
  claimNumber: string;

  @ApiProperty({ description: 'Policy UUID' })
  policyId: string;

  @ApiProperty({ description: 'Customer UUID' })
  customerId: string;

  @ApiProperty({ enum: ClaimType })
  type: ClaimType;

  @ApiProperty({ description: 'Claim description' })
  description: string;

  @ApiProperty({ description: 'Incident date' })
  incidentDate: Date;

  @ApiPropertyOptional({ description: 'Incident location' })
  incidentLocation?: string;

  @ApiProperty({ enum: ClaimStatus })
  status: ClaimStatus;

  @ApiPropertyOptional({ description: 'Denormalized policy number' })
  policyNumber?: string;

  static fromEntity(claim: Claim): ClaimResponseDto {
    const dto = new ClaimResponseDto();
    dto.id = claim.id;
    dto.claimNumber = claim.claimNumber;
    dto.policyId = claim.policyId;
    dto.customerId = claim.customerId;
    dto.type = claim.type;
    dto.description = claim.description;
    dto.incidentDate = claim.incidentDate;
    dto.incidentLocation = claim.incidentLocation ?? undefined;
    dto.status = claim.status;
    if (claim.policy) {
      dto.policyNumber = claim.policy.policyNumber;
    }
    return dto;
  }
}
