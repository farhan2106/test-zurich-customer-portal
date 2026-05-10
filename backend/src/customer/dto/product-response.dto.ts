import { ApiProperty } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import { Product } from '../../entities/product.entity';
import { ProductStatus } from '../../entities/enums';

export class ProductResponseDto {
  @ApiProperty({ description: 'Product UUID', example: 'prod_abc123' })
  @Expose()
  id: string;

  @ApiProperty({ description: 'Zurich product code', example: 4000 })
  @Expose()
  productCode: number;

  @ApiProperty({ description: 'Product display name', example: 'Auto Insurance' })
  @Expose()
  name: string;

  @ApiProperty({ description: 'Product description', example: 'Comprehensive auto coverage' })
  @Expose()
  description: string;

  @ApiProperty({ description: 'Coverage details as key-value pairs', example: { liability: 'Up to $1M', collision: 'Included' } })
  @Expose()
  @Type(() => Object)
  coverageDetails: Record<string, string>;

  @ApiProperty({ description: 'Base premium in MYR', example: 500.00 })
  @Expose()
  basePremium: number;

  @ApiProperty({ description: 'Product status', enum: ProductStatus, example: ProductStatus.ACTIVE })
  @Expose()
  status: ProductStatus;

  static fromEntity(entity: Product): ProductResponseDto {
    const dto = new ProductResponseDto();
    dto.id = entity.id;
    dto.productCode = entity.productCode;
    dto.name = entity.name;
    dto.description = entity.description;
    dto.basePremium = Number(entity.basePremium);
    dto.status = entity.status;

    // Parse coverageDetails from JSON string
    if (entity.coverageDetails && entity.coverageDetails !== '') {
      try {
        dto.coverageDetails = JSON.parse(entity.coverageDetails);
      } catch {
        dto.coverageDetails = {};
      }
    } else {
      dto.coverageDetails = {};
    }

    return dto;
  }
}
