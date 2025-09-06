import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { PersonalInfo } from './entities/personal-info.entity';
import { EmploymentInfo } from './entities/employment-info.entity';
import { Role } from 'src/roles/entities/role.entity';
import { PaginationModule } from 'src/common/pagination/pagination.module';

@Module({
  controllers: [UserController],
  providers: [UserService],
  imports: [
    TypeOrmModule.forFeature([User, PersonalInfo, EmploymentInfo, Role]),
    PaginationModule,
  ],
})
export class UserModule {}
