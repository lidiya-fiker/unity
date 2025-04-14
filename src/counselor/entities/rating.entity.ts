import { Client } from 'src/client/entities/client.entity';
import { Counselor } from './counselor.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class Rating {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Client, { onDelete: 'CASCADE' })
  client: Client;

  @ManyToOne(() => Counselor, { onDelete: 'CASCADE' })
  counselor: Counselor;

  @Column({ type: 'text', nullable: true })
  feedback?: string;

  @Column({ type: 'int' })
  score: number;

  @CreateDateColumn()
  createdAt: Date;
}
