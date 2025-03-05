import { Entity, Column } from 'typeorm';
import { User } from '../../shared/entites/user.entity';

@Entity()
export class Client extends User {
  @Column({ nullable: true })
  phoneNumber?: string;

  @Column({ nullable: true })
  address?: string;

  @Column({ nullable: true })
  maritalStatus?: string;

}
