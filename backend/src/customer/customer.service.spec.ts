import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { CustomerService } from './customer.service';
import { Product } from '../entities/product.entity';
import { ProductStatus } from '../entities/enums';

describe('CustomerService', () => {
  let service: CustomerService;
  let productRepository: jest.Mocked<Repository<Product>>;

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

  const mockInactiveProduct: Product = {
    ...mockProduct,
    id: 'prod_inactive',
    status: ProductStatus.INACTIVE,
  };

  beforeEach(async () => {
    const mockRepo = {
      find: jest.fn(),
      findOne: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CustomerService,
        {
          provide: getRepositoryToken(Product),
          useValue: mockRepo,
        },
      ],
    }).compile();

    service = module.get<CustomerService>(CustomerService);
    productRepository = module.get(getRepositoryToken(Product));
  });

  describe('findAllActiveProducts()', () => {
    it('should return only products with status active', async () => {
      productRepository.find.mockResolvedValue([mockProduct]);

      const result = await service.findAllActiveProducts();

      expect(productRepository.find).toHaveBeenCalledWith({
        where: { status: ProductStatus.ACTIVE },
      });
      expect(result).toEqual([mockProduct]);
    });

    it('should return empty array when no active products exist', async () => {
      productRepository.find.mockResolvedValue([]);

      const result = await service.findAllActiveProducts();

      expect(productRepository.find).toHaveBeenCalledWith({
        where: { status: ProductStatus.ACTIVE },
      });
      expect(result).toEqual([]);
    });

    it('should exclude inactive products', async () => {
      productRepository.find.mockResolvedValue([mockProduct]);

      await service.findAllActiveProducts();

      // Verify the query filters by ACTIVE status only
      expect(productRepository.find).toHaveBeenCalledWith({
        where: { status: ProductStatus.ACTIVE },
      });

      // The inactive product should never appear in results
      const callArgs = (productRepository.find as jest.Mock).mock.calls[0][0];
      expect(callArgs.where.status).toBe(ProductStatus.ACTIVE);
      expect(callArgs.where.status).not.toBe(ProductStatus.INACTIVE);
    });
  });

  describe('findProductById()', () => {
    it('should return product when found and active', async () => {
      productRepository.findOne.mockResolvedValue(mockProduct);

      const result = await service.findProductById('prod_abc123');

      expect(productRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'prod_abc123' },
      });
      expect(result).toEqual(mockProduct);
    });

    it('should throw NotFoundException when product is not found', async () => {
      productRepository.findOne.mockResolvedValue(null);

      await expect(service.findProductById('nonexistent_id')).rejects.toThrow(
        NotFoundException,
      );

      expect(productRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'nonexistent_id' },
      });
    });

    it('should throw NotFoundException when product is inactive', async () => {
      productRepository.findOne.mockResolvedValue(mockInactiveProduct);

      await expect(service.findProductById('prod_inactive')).rejects.toThrow(
        NotFoundException,
      );

      expect(productRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'prod_inactive' },
      });
    });
  });
});
