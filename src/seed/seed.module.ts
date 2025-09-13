import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Role } from 'src/roles/entities/role.entity';
import { EmploymentInfo } from 'src/user/entities/employment-info.entity';
import { PersonalInfo } from 'src/user/entities/personal-info.entity';
import { User } from 'src/user/entities/user.entity';
import { SeedService } from './seed.service';

@Module({
  providers: [SeedService],
  imports: [
    TypeOrmModule.forFeature([User, PersonalInfo, EmploymentInfo, Role]),
  ],
})
export class SeedModule {
  constructor() {}
}
