import { ApiProperty } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';

export class CreatePolicyDto {
  @ApiProperty({ description: 'Product UUID to purchase', example: 'prod_abc123' })
  @IsUUID('4')
  productId: string;
}
