import { Entity, Column} from 'typeorm';
import { User } from '../../auth/entity/user.entity';


@Entity()
export class Client extends User {
  @Column({ nullable: true })
  maritalStatus?: string;

  @Column({ type: 'date', nullable: true })
  dateOfBirth?: Date;
}
