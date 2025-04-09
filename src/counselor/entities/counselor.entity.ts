import { Entity, Column, OneToMany } from 'typeorm';
import { User } from '../../auth/entity/user.entity';
import { AccountVerification } from 'src/auth/entity/account-verification.entity';

@Entity()
export class Counselor extends User {
  @Column({ type: 'boolean', default: false })
  isApproved: boolean;

  @Column({ nullable: true })
  qualification?: string;

  @Column({ type: 'text', array: true, nullable: true })
  license?: string[];

  @Column({ nullable: true })
  yearsOfExperience?: number;

  @Column({ type: 'text', nullable: true })
  bio?: string;

  @Column({ type: 'text', array: true, nullable: true })
  languagesSpoken?: string[];

  @Column({ nullable: true })
  preferredPaymentMethod?: string; // e.g., PayPal, Bank Transfer

  @Column({ nullable: true })
  bankAccount?: string;

  @Column({ nullable: true })
  timeZone?: string;

  @Column({ type: 'timestamp', nullable: true })
  approvedAt?: Date;
}
