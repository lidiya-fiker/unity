import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

import {
  AccountVerificationStatusEnum,
  AccountVerificationTypeEnum,
} from '../enums';
import { Client } from 'src/client/entities/client.entity';

@Entity('account_verifications')
export class AccountVerification {
  @PrimaryGeneratedColumn('uuid')
  public id!: string;

  @Column({ type: 'text' })
  public otp: string;

  @Column({
    type: 'enum',
    enum: AccountVerificationStatusEnum,
    default: AccountVerificationStatusEnum.NEW,
  })
  public status: string;

  @Column({
    type: 'enum',
    enum: AccountVerificationTypeEnum,
    default: AccountVerificationTypeEnum.EMAIL_VERIFICATION,
  })
  public otpType: string;

  @Column({ type: 'text' })
  public clientId: string;

  @ManyToOne(() => Client, (client) => client.accountVerifications)
  @JoinColumn({ name: 'accountId' })
  public client: Client;

  @Column({ type: 'text', nullable: true })
  public userId: string;
}
