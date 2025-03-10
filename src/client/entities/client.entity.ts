import { Entity, Column, OneToMany } from 'typeorm';
import { User } from '../../shared/entities/user.entity';
import { AccountVerification } from './account-verification.entity';

@Entity()
export class Client extends User {
  @Column({ nullable: true })
  phoneNumber?: string;

  @Column({ nullable: true })
  address?: string;

  @Column({ nullable: true })
  maritalStatus?: string;

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
