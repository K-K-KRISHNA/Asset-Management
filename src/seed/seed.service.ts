import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Role } from 'src/roles/entities/role.entity';
import { EmploymentInfo } from 'src/user/entities/employment-info.entity';
import { PersonalInfo } from 'src/user/entities/personal-info.entity';
import { User } from 'src/user/entities/user.entity';
import * as bcrypt from 'bcrypt';
import { CreatePersonalInfoDto } from 'src/user/dto/create-personal-info.dto';

@Injectable()
export class SeedService implements OnApplicationBootstrap {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    @InjectRepository(Role)
    private readonly rolesRepo: Repository<Role>,
    @InjectRepository(EmploymentInfo)
    private readonly employmentInfoRepo: Repository<EmploymentInfo>,
    @InjectRepository(PersonalInfo)
    private readonly personalInfoRepo: Repository<PersonalInfo>,
  ) {}

  async onApplicationBootstrap() {
    // Only seed in development environment
    if (process.env.NODE_ENV === 'development') {
      await this.seedSuperAdmin();
    }
  }

  async seedSuperAdmin() {
    try {
      console.log('Starting super admin seeding...');

      // Ensure Super Admin role exists
      let superAdminRole = await this.rolesRepo.findOne({
        where: { name: 'Super Admin' },
      });

      if (!superAdminRole) {
        superAdminRole = this.rolesRepo.create({ name: 'Super Admin' });
        await this.rolesRepo.save(superAdminRole);
        console.log('Super Admin role created');
      }

      // Check if super admin user already exists
      const existingUser = await this.userRepo.findOne({
        where: { employmentInfo: { designation: { name: 'Super Admin' } } },
        relations: ['employmentInfo', 'employmentInfo.designation'],
      });

      if (existingUser) {
        console.log(existingUser, 'existing user');
        console.log('Super Admin user already exists');
        return;
      }

      // Create super admin user
      const hashedPassword = await bcrypt.hash('1234', 10);

      const employmentInfoBody = {
        email: 'superadmin@company.com',
        designation: superAdminRole,
        empId: 1,
        noticePeriod: 60,
      };

      const personalInfoBody: CreatePersonalInfoDto = {
        firstName: 'Krishna',
        lastName: 'Keerti',
        mobile: '7720988899',
      };

      const employmentInfo = this.employmentInfoRepo.create(employmentInfoBody);
      await this.employmentInfoRepo.save(employmentInfo);

      const personalInfo = this.personalInfoRepo.create(personalInfoBody);
      await this.personalInfoRepo.save(personalInfo);

      const userInfo = this.userRepo.create({
        employmentInfo,
        personalInfo,
        password: hashedPassword,
      });

      await this.userRepo.save(userInfo);

      console.log('Super Admin user created successfully');
    } catch (error) {
      console.error('Error seeding super admin:', error);
    }
  }
}
