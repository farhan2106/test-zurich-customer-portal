import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, OneToMany } from 'typeorm';
import { Policy } from './policy.entity';
import { ProductStatus } from './enums';

@Entity('products')
export class Product {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true, type: 'int' })
  productCode: number;

  @Column({ length: 200 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'text', nullable: true })
  coverageDetails: string;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
  })
  basePremium: number;

  @Column({
    type: 'enum',
    enum: ProductStatus,
    default: ProductStatus.ACTIVE,
  })
  status: ProductStatus;

  @CreateDateColumn()
  createdAt: Date;

  @OneToMany(() => Policy, (policy) => policy.product)
  policies: Policy[];
}
