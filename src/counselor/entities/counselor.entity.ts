import {
  Column,
  Entity,
  JoinColumn,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from '../../auth/entity/user.entity';
import { PreferredPaymentMethod } from 'src/shared/enums';
import { Rating } from './rating.entity';

@Entity()
export class Counselor {
  @PrimaryGeneratedColumn('uuid')
  userId: string;

  @OneToOne(() => User, (user) => user.counselor, {
    cascade: true,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({ nullable: true })
  phoneNumber?: string;

  @Column({ nullable: true })
  addres?: string;

  @Column({ nullable: true })
  profilePicture?: string;

  @Column({ nullable: true })
  gender?: string;

  @Column({ type: 'boolean', default: false })
  isApproved: boolean;

  @Column({ nullable: true })
  specialization?: string;

  @Column({ type: 'text', array: true, nullable: true })
  cerificate?: string[];

  @Column({ type: 'text', nullable: true })
  bio?: string;

  @Column({ type: 'text', array: true, nullable: true })
  languagesSpoken?: string[];

  @Column({ type: 'enum', enum: PreferredPaymentMethod, nullable: true })
  preferredPaymentMethod?: PreferredPaymentMethod;

  @Column({ nullable: true })
  bankAccountOrPhone?: string;

  @Column({ type: 'timestamp', nullable: true })
  approvedAt?: Date;

  @OneToMany(() => Rating, (rating) => rating.counselor)
  ratings: Rating;
}
