import { Expose } from 'class-transformer';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { EmploymentInfo } from './employment-info.entity';
import { PersonalInfo } from './personal-info.entity';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  password: string;

  @OneToOne(() => PersonalInfo, (personalInfo) => personalInfo.user, {
    // cascade: ['insert', 'update'],
    eager: true,
  })
  personalInfo: PersonalInfo;

  @OneToOne(() => EmploymentInfo, (employmentInfo) => employmentInfo.user, {
    // cascade: ['insert', 'update'],
    eager: true,
  })
  employmentInfo: EmploymentInfo;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;

  @Expose()
  get fullName(): string {
    return `${this.personalInfo.firstName} ${this.personalInfo.lastName}`;
  }
}
