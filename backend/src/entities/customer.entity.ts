import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { Policy } from './policy.entity';
import { Claim } from './claim.entity';
import { CustomerLocation, CustomerRole } from './enums';

@Entity('customers')
export class Customer {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true, length: 320 })
  email: string;

  @Column({ length: 100 })
  firstName: string;

  @Column({ length: 100 })
  lastName: string;

  @Column({ nullable: true, length: 500 })
  photoUrl: string;

  @Column({
    type: 'enum',
    enum: CustomerLocation,
  })
  location: CustomerLocation;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    default: 0.0,
  })
  premiumPaid: number;

  @Column({
    type: 'enum',
    enum: CustomerRole,
    default: CustomerRole.CUSTOMER,
  })
  role: CustomerRole;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => Policy, (policy) => policy.customer)
  policies: Policy[];

  @OneToMany(() => Claim, (claim) => claim.customer)
  claims: Claim[];
}
