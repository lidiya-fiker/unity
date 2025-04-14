import { Column, Entity, JoinColumn, OneToOne } from 'typeorm';
import { User } from '../../auth/entity/user.entity';
import { Gender, MaritalStatus } from 'src/shared/enums';

@Entity()
export class Client {
  @Column({ primary: true })
  userId: string;

  @Column({ nullable: true })
  phoneNumber?: string;

  @Column({ nullable: true })
  addres?: string;

  @Column({ nullable: true })
  profilePicture?: string;

  @Column({ type: 'enum', enum: Gender, nullable: true })
  gender?: Gender;

  @Column({ type: 'enum', enum: MaritalStatus, nullable: true })
  maritalStatus?: MaritalStatus;

  @Column({ type: 'date', nullable: true })
  dateOfBirth?: Date;

  @OneToOne(() => User, (user) => user.client, {
    cascade: true,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'userId' })
  user: User;
}
