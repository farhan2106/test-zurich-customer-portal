import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { CustomerController } from './customer.controller';
import { CustomerService } from './customer.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ProductResponseDto } from './dto/product-response.dto';
import { Product } from '../entities/product.entity';
import { ProductStatus } from '../entities/enums';

describe('CustomerController', () => {
  let controller: CustomerController;
  let customerService: jest.Mocked<CustomerService>;

  const mockProduct: Product = {
    id: 'prod_abc123',
    productCode: 4000,
    name: 'Auto Insurance',
    description: 'Comprehensive auto coverage',
    coverageDetails: JSON.stringify({ liability: 'Up to $1M', collision: 'Included' }),
    basePremium: 500.0,
    status: ProductStatus.ACTIVE,
    createdAt: new Date('2025-01-01'),
    policies: [],
  };

  const mockProductDto: ProductResponseDto = {
    id: 'prod_abc123',
    productCode: 4000,
    name: 'Auto Insurance',
    description: 'Comprehensive auto coverage',
    coverageDetails: {
      liability: 'Up to $1M',
      collision: 'Included',
    },
    basePremium: 500.0,
    status: ProductStatus.ACTIVE,
  };

  beforeEach(async () => {
    const mockService = {
      findAllActiveProducts: jest.fn(),
      findProductById: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [CustomerController],
      providers: [
        {
          provide: CustomerService,
          useValue: mockService,
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: jest.fn(() => true) })
      .compile();

    controller = module.get<CustomerController>(CustomerController);
    customerService = module.get(CustomerService);
  });

  describe('GET /api/products', () => {
    it('should return ProductResponseDto[] mapped from service result', async () => {
      customerService.findAllActiveProducts.mockResolvedValue([mockProduct]);

      const result = await controller.getProducts();

      expect(customerService.findAllActiveProducts).toHaveBeenCalled();
      expect(result).toBeInstanceOf(Array);
      expect(result.length).toBe(1);
      expect(result[0]).toBeInstanceOf(ProductResponseDto);
      expect(result[0]).toEqual(mockProductDto);
    });

    it('should return empty array when service returns empty', async () => {
      customerService.findAllActiveProducts.mockResolvedValue([]);

      const result = await controller.getProducts();

      expect(customerService.findAllActiveProducts).toHaveBeenCalled();
      expect(result).toEqual([]);
    });

    it('should have JwtAuthGuard applied (class-level guard inherited by all methods)', () => {
      // Class-level @UseGuards(JwtAuthGuard) stores on the class constructor
      const classGuards: any[] | undefined = Reflect.getMetadata(
        '__guards__',
        CustomerController,
      );
      const methodGuards: any[] | undefined = Reflect.getMetadata(
        '__guards__',
        CustomerController.prototype.getProducts,
      );

      const allGuards = [...(classGuards || []), ...(methodGuards || [])];

      expect(allGuards.length).toBeGreaterThan(0);
      const hasJwtGuard = allGuards.some(
        (g: any) => g === JwtAuthGuard || (g instanceof JwtAuthGuard),
      );
      expect(hasJwtGuard).toBe(true);
    });

    it('should have @ApiOperation decorator', () => {
      const metadata = Reflect.getMetadata(
        'swagger/apiOperation',
        CustomerController.prototype.getProducts,
      );
      expect(metadata).toBeDefined();
    });

    it('should have @ApiResponse decorator', () => {
      const metadata = Reflect.getMetadata(
        'swagger/apiResponse',
        CustomerController.prototype.getProducts,
      );
      expect(metadata).toBeDefined();
    });

    it('should have @ApiBearerAuth decorator applied', () => {
      // @ApiBearerAuth() is applied at class level (line 10 of controller)
      // It stores metadata under 'swagger/apiSecurity' via nestjs/swagger
      const classMetadata = Reflect.getMetadata('swagger/apiSecurity', CustomerController);
      const methodMetadata = Reflect.getMetadata('swagger/apiSecurity', CustomerController.prototype.getProducts);
      
      // At least one of class or method should have the security metadata
      const hasApiBearerAuth = classMetadata !== undefined || methodMetadata !== undefined;
      expect(hasApiBearerAuth).toBe(true);
    });
  });

  describe('GET /api/products/:id', () => {
    it('should return ProductResponseDto for the found product', async () => {
      customerService.findProductById.mockResolvedValue(mockProduct);

      const result = await controller.getProductById('prod_abc123');

      expect(customerService.findProductById).toHaveBeenCalledWith('prod_abc123');
      expect(result).toBeInstanceOf(ProductResponseDto);
      expect(result).toEqual(mockProductDto);
    });

    it('should have JwtAuthGuard applied to getProductById (class-level guard inherited)', () => {
      const classGuards: any[] | undefined = Reflect.getMetadata(
        '__guards__',
        CustomerController,
      );
      const methodGuards: any[] | undefined = Reflect.getMetadata(
        '__guards__',
        CustomerController.prototype.getProductById,
      );

      const allGuards = [...(classGuards || []), ...(methodGuards || [])];

      expect(allGuards.length).toBeGreaterThan(0);
      const hasJwtGuard = allGuards.some(
        (g: any) => g === JwtAuthGuard || (g instanceof JwtAuthGuard),
      );
      expect(hasJwtGuard).toBe(true);
    });

    it('should propagate NotFoundException from service (404)', async () => {
      customerService.findProductById.mockRejectedValue(
        new NotFoundException('Product not found'),
      );

      await expect(controller.getProductById('nonexistent_id')).rejects.toThrow(
        NotFoundException,
      );

      expect(customerService.findProductById).toHaveBeenCalledWith('nonexistent_id');
    });

    it('should have @ApiParam decorator for id parameter', () => {
      const metadata = Reflect.getMetadata(
        'swagger/apiParameters',
        CustomerController.prototype.getProductById,
      );
      expect(metadata).toBeDefined();
      expect(Array.isArray(metadata)).toBe(true);

      const hasIdParam = metadata!.some(
        (param: any) => param.name === 'id' || param.in === 'path',
      );
      expect(hasIdParam).toBe(true);
    });
  });
});
