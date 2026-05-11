import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Policy } from './policy.entity';
import { Customer } from './customer.entity';
import { ClaimType, ClaimStatus } from './enums';

@Entity('claims')
export class Claim {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  claimNumber: string;

  @Column({ type: 'uuid' })
  policyId: string;

  @Column({ type: 'uuid' })
  customerId: string;

  @Column({
    type: 'enum',
    enum: ClaimType,
  })
  type: ClaimType;

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'text' })
  description2: string;

  @Column({ type: 'text' })
  description3: string;

  @Column({ type: 'timestamp' })
  incidentDate: Date;

  @Column({ nullable: true, length: 500 })
  incidentLocation: string;

  @Column({
    type: 'enum',
    enum: ClaimStatus,
    default: ClaimStatus.SUBMITTED,
  })
  status: ClaimStatus;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => Policy, (policy) => policy.claims, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'policyId' })
  policy: Policy;

  @ManyToOne(() => Customer, (customer) => customer.claims, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'customerId' })
  customer: Customer;
}
