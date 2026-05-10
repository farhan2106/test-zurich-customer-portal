import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsUUID, IsEnum, IsString, MinLength, MaxLength, IsOptional, IsISO8601 } from 'class-validator';
import { ClaimType } from '../../entities/enums';
import { IsNotFutureDate } from '../../common/validators/is-not-future-date.validator';

export class CreateClaimDto {
  @ApiProperty({ description: 'Policy UUID', example: 'pol_abc123' })
  @IsUUID('4')
  policyId: string;

  @ApiProperty({ enum: ClaimType, example: ClaimType.ACCIDENT })
  @IsEnum(ClaimType)
  type: ClaimType;

  @ApiProperty({ description: 'Claim description', example: 'Car accident on highway', minLength: 10, maxLength: 2000 })
  @IsString()
  @MinLength(10)
  @MaxLength(2000)
  description: string;

  @ApiProperty({ description: 'Date of incident', example: '2026-05-01' })
  @IsISO8601()
  @IsNotFutureDate()
  incidentDate: string;

  @ApiPropertyOptional({ description: 'Location of incident', example: 'Kuala Lumpur', maxLength: 500 })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  incidentLocation?: string;
}
