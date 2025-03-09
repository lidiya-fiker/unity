import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  TableInheritance,
  OneToMany,
} from 'typeorm';
import { AccountStatusEnum } from '../enums/account-status.enum';
import { AccountVerification } from 'src/client/entities/account-verification.entity';

@Entity()
@TableInheritance({ column: { type: 'varchar', name: 'role' } })
export class User {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column({ unique: true, nullable: true })
  email?: string;

  @Column({ unique: true, nullable: true })
  username?: string;

  @Column()
  password: string;

  @Column({ nullable: true })
  profilePicture: string;

  @Column()
  gender: string;

  @Column({
    type: 'enum',
    enum: AccountStatusEnum,
    default: AccountStatusEnum.PENDING,
  })
  status: string;

  @OneToMany(
    () => AccountVerification,
    (accountVerification) => accountVerification.client,
    {
      cascade: true,
      onDelete: 'CASCADE',
    },
  )
  accountVerifications: AccountVerification[];
}
