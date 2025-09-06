import { Role } from 'src/roles/entities/role.entity';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from './user.entity';

@Entity()
export class EmploymentInfo {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Role, (role) => role.name, { eager: true })
  designation: Role;

  @Column({
    type: 'int',
    unique: true,
  })
  empId: number;

  @OneToOne(() => User, (user) => user.employmentInfo, {
    // onDelete: 'CASCADE',
  })
  @JoinColumn()
  user: User;

  @Column({ nullable: true })
  email?: string;

  @Column({
    type: 'date',
    nullable: true,
  })
  joiningDate?: Date;

  @Column({ type: 'int', nullable: true })
  expYears?: number;

  @Column({ type: 'int', nullable: true })
  expMonths?: number;

  @Column({ type: 'int', nullable: true })
  expDays?: number;

  @Column({ type: 'int' })
  noticePeriod: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;
}
