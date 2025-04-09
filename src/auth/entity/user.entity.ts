import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { AccountStatusEnum } from '../../shared/enums/account-status.enum';
import { AccountVerification } from './account-verification.entity';

@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column({ nullable: true })
  password?: string;

  @Column({ unique: true, nullable: true })
  email?: string;

  @Column({ nullable: true })
  phoneNumber?: string;

  @Column({ nullable: true })
  addres?: string;

  @Column({ nullable: true })
  profilePicture?: string;

  @Column({ nullable: true })
  gender?: string;

  @Column({ type: 'enum', enum: ['CLIENT', 'COUNSELOR'] })
  role: 'CLIENT' | 'COUNSELOR';

  @Column({
    type: 'enum',
    enum: AccountStatusEnum,
    default: AccountStatusEnum.PENDING,
  })
  status: string;

  @Column({ nullable: true })
  googleId?: string;

  @OneToMany(
    () => AccountVerification,
    (accountVerification) => accountVerification.user,
    {
      cascade: true,
      onDelete: 'CASCADE',
    },
  )
  accountVerifications: AccountVerification[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
