import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  TableInheritance,
  OneToOne,
} from 'typeorm';
import { AccountStatusEnum } from '../enums/account-status.enum';

@Entity()
@TableInheritance({ column: { type: 'varchar', name: 'role' } })
export class User {
  @PrimaryGeneratedColumn('uuid')
  userID: string;

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
}
