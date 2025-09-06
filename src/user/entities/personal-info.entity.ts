import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { BLOOD_GROUPS } from '../enums/blood-groups.enum';
import { User } from './user.entity';

@Entity()
export class PersonalInfo {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'varchar',
  })
  firstName: string;

  @Column({
    type: 'varchar',
  })
  lastName: string;

  @Column({ type: 'varchar', length: 10, unique: true })
  mobile: string;

  @OneToOne(() => User, (user) => user.personalInfo, {
    // onDelete: 'CASCADE',
  })
  @JoinColumn()
  user: User;

  @Column({
    type: 'date',
    nullable: true,
  })
  dateOfBirth?: Date;

  @Column({ type: 'varchar', nullable: true, unique: true })
  email?: string;

  @Column({
    type: 'enum',
    enum: BLOOD_GROUPS,
    nullable: true,
  })
  bloodGroup?: string;

  @Column({ type: 'text', nullable: true })
  address?: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;
}
