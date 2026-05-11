import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength, IsEnum, IsNumber, Min, IsIn } from 'class-validator';
import { CustomerLocation } from '../../entities/enums';

export class UpdateCustomerDto {
  @ApiPropertyOptional({ description: 'Customer first name', example: 'Ahmad', maxLength: 100 })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  firstName?: string;

  @ApiPropertyOptional({
    description: 'Customer last name',
    example: 'bin Abdullah',
    maxLength: 100,
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  lastName?: string;

  @ApiPropertyOptional({
    description: 'Google profile photo URL',
    example: 'https://...',
    maxLength: 500,
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  photoUrl?: string;

  @ApiPropertyOptional({
    description: 'Customer location',
    enum: CustomerLocation,
    example: 'West Malaysia',
  })
  @IsOptional()
  @IsEnum(CustomerLocation)
  location?: CustomerLocation;

  @ApiPropertyOptional({ description: 'Total premium paid (MYR)', example: 2500.0, minimum: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  premiumPaid?: number;

  // Email is immutable — this property exists so that attempts to update it produce a validation error
  @ApiPropertyOptional({ description: 'Customer email (immutable - cannot be updated)' })
  @IsOptional()
  @IsIn([], { message: 'Email cannot be updated' })
  email?: string;
}
