import { PaginatedResponse } from './../common/pagination/paginated-response';
// users.service.ts
import {
  ConflictException,
  forwardRef,
  Inject,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, FindOptionsWhere } from 'typeorm';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { PersonalInfo } from './entities/personal-info.entity';
import { EmploymentInfo } from './entities/employment-info.entity';
import { Role } from '../roles/entities/role.entity';
import { plainToInstance } from 'class-transformer';
import { UpdateUserDto } from './dto/update-user.dto';
import { PaginationService } from 'src/common/pagination/pagination.service';
import { GetAllUsersDto } from './dto/get-all-users.dto';
import { HashingProvider } from 'src/auth/provider/hashing.provider';

@Injectable()
export class UserService {
  constructor(
    private readonly pagiantionService: PaginationService,
    private readonly dataSource: DataSource,
    @InjectRepository(User) private readonly usersRepo: Repository<User>,
    @InjectRepository(PersonalInfo)
    private readonly personalRepo: Repository<PersonalInfo>,
    @InjectRepository(EmploymentInfo)
    private readonly employmentRepo: Repository<EmploymentInfo>,
    @InjectRepository(Role) private readonly rolesRepo: Repository<Role>,

    @Inject(forwardRef(() => HashingProvider))
    private readonly hashingProvider: HashingProvider,
  ) {}

  /**
   * Creates a new User along with associated PersonalInfo and EmploymentInfo
   * within a database transaction.
   *
   * @async
   * @function create
   * @param {CreateUserDto} createUserDto - DTO containing all required user details:
   *   - `password` (string): Password of the user
   *   - `personalInfo` (Partial<PersonalInfo>): Personal information object
   *   - `employmentInfo` (Partial<EmploymentInfo>): Employment information object including designationId
   *
   * @returns {Promise<User>} The created User entity (with relations).
   *
   * @throws {NotFoundException} If the provided designation (role) ID does not exist.
   * @throws {ConflictException} If a duplicate entry violation occurs (Postgres error `23505`).
   * @throws {InternalServerErrorException} If any other unexpected error occurs.
   *
   * @description
   * This method:
   *  1. Starts a TypeORM transaction using QueryRunner.
   *  2. Validates the `designationId` provided in employmentInfo by checking Role existence.
   *  3. Creates and persists `PersonalInfo`.
   *  4. Creates and persists `EmploymentInfo` linked with the Role.
   *  5. Creates and persists the `User` entity linked with personalInfo & employmentInfo.
   *  6. Commits the transaction if all steps succeed.
   *  7. Rolls back the transaction if any step fails and throws appropriate exceptions.
   *
   * The method uses `plainToInstance` from `class-transformer` to ensure
   * proper transformation of the returned User object.
   */
  async create(createUserDto: CreateUserDto): Promise<User> {
    const { password, personalInfo, employmentInfo } = createUserDto;

    // ✅ Start a transaction
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // ✅ Validate Role
      const role = await queryRunner.manager.findOne(Role, {
        where: { id: employmentInfo.designationId },
      });
      if (!role) {
        throw new NotFoundException(
          `Role not found with id: ${employmentInfo.designationId}`,
        );
      }

      // ✅ Create PersonalInfo
      const personal = queryRunner.manager.create(PersonalInfo, personalInfo);
      await queryRunner.manager.save(personal);

      // ✅ Create EmploymentInfo
      const employment = queryRunner.manager.create(EmploymentInfo, {
        ...employmentInfo,
        designation: role,
      });
      await queryRunner.manager.save(employment);

      // ✅ Create User
      const hashedPassword = await this.hashingProvider.hashPassword(password);
      const user = queryRunner.manager.create(User, {
        password: hashedPassword,
        personalInfo: personal,
        employmentInfo: employment,
      });
      await queryRunner.manager.save(user);

      // ✅ Commit transaction if everything is successful
      await queryRunner.commitTransaction();

      return plainToInstance(User, user, { excludeExtraneousValues: false });
    } catch (error) {
      // ❌ Rollback if anything fails
      await queryRunner.rollbackTransaction();

      if (error.code === '23505') {
        throw new ConflictException('Duplicate entry: ' + error.detail);
      }
      if (error instanceof NotFoundException) {
        throw error;
      }

      throw new InternalServerErrorException(
        `Failed to create user. Reason: ${error.message}`,
      );
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * Updates an existing user and their related entities (PersonalInfo, EmploymentInfo) in a transactional manner.
   *
   * - Updates the user's password if provided.
   * - Updates the user's personal information if provided.
   * - Updates the user's employment information if provided, including validating and updating the designation (role) if changed.
   * - All updates are performed within a database transaction to ensure atomicity.
   * - Throws a NotFoundException if the user or the specified role (designation) does not exist.
   * - Throws a ConflictException if a duplicate entry is detected (e.g., unique constraint violation).
   * - Throws an InternalServerErrorException for any other errors encountered during the update process.
   *
   * @param id - The unique identifier of the user to update.
   * @param updateUserDto - The data transfer object containing the fields to update.
   * @returns A Promise that resolves to the updated User entity.
   * @throws {NotFoundException} If the user or specified role is not found.
   * @throws {ConflictException} If a duplicate entry is detected.
   * @throws {InternalServerErrorException} For any other errors during the update.
   */
  async update(id: number, updateUserDto: UpdateUserDto): Promise<User> {
    const { password, personalInfo, employmentInfo } = updateUserDto;

    // ✅ Start a transaction
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // ✅ Find the existing user with relations
      const user = await queryRunner.manager.findOne(User, {
        where: { id },
        relations: ['personalInfo', 'employmentInfo'],
      });

      if (!user) {
        throw new NotFoundException(`User not found with id: ${id}`);
      }

      // ✅ Update password if provided
      if (password) {
        user.password = password;
      }

      // ✅ Update PersonalInfo if provided
      if (personalInfo) {
        queryRunner.manager.merge(
          PersonalInfo,
          user.personalInfo,
          personalInfo,
        );
        await queryRunner.manager.save(user.personalInfo);
      }

      // ✅ Update EmploymentInfo if provided
      if (employmentInfo) {
        // If roleId (designationId) changed, validate it
        if (employmentInfo.designationId) {
          const role = await queryRunner.manager.findOne(Role, {
            where: { id: employmentInfo.designationId },
          });
          if (!role) {
            throw new NotFoundException(
              `Role not found with id: ${employmentInfo.designationId}`,
            );
          }
          user.employmentInfo.designation = role;
        }

        queryRunner.manager.merge(
          EmploymentInfo,
          user.employmentInfo,
          employmentInfo,
        );
        await queryRunner.manager.save(user.employmentInfo);
      }

      // ✅ Save user updates
      await queryRunner.manager.save(user);

      // ✅ Commit transaction
      await queryRunner.commitTransaction();

      return plainToInstance(User, user, { excludeExtraneousValues: false });
    } catch (error) {
      // ❌ Rollback if anything fails
      await queryRunner.rollbackTransaction();

      if (error.code === '23505') {
        throw new ConflictException('Duplicate entry: ' + error.detail);
      }
      if (error instanceof NotFoundException) {
        throw error;
      }

      throw new InternalServerErrorException(
        `Failed to update user. Reason: ${error.message}`,
      );
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * Fetch all users along with their related entities:
   * - personalInfo
   * - employmentInfo
   * - designation under employmentInfo
   *
   * @returns {Promise<User[]>} List of users with relations
   * @throws {NotFoundException} If no users are found
   * @throws {InternalServerErrorException} If DB query fails
   */
  async findAll(
    getAllUsersDto: GetAllUsersDto,
  ): Promise<PaginatedResponse<User>> {
    const {
      // pageNumber = 1,
      // perPage = 5,
      // sendAll = false,
      roleId,
    } = getAllUsersDto;
    let where: FindOptionsWhere<User> = {};
    if (roleId) {
      where = {
        ...where,
        employmentInfo: {
          designation: { id: roleId },
        },
      };
    }
    try {
      const users = await this.pagiantionService.paginateQuery(
        getAllUsersDto,
        this.usersRepo,
        where,
      );

      if (!users.data || users.data.length === 0) {
        throw new NotFoundException('No users found');
      }

      return users;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException(
        `Failed to fetch users: ${error.message}`,
      );
    }
  }

  /**
   * Fetch a single user by ID, including eager-loaded relations.
   *
   * @param {number} id - The ID of the user to retrieve.
   * @returns {Promise<User>} The user entity if found.
   *
   * @throws {NotFoundException} If no user with the given ID exists.
   * @throws {InternalServerErrorException} If any database error occurs.
   */
  async findById(id: number): Promise<User> {
    console.log(id, 'id');
    try {
      const user = await this.usersRepo.findOneBy({ id });

      if (!user) {
        throw new NotFoundException(`User not found with id: ${id}`);
      }

      return user;
    } catch (error) {
      throw new InternalServerErrorException(
        `Failed to fetch user with id ${id}: ${error.message}`,
      );
    }
  }

  /**
   * Deletes a user and their associated entities (EmploymentInfo, PersonalInfo)
   * inside a transaction to ensure data consistency.
   *
   * @async
   * @function deleteUser
   * @param {number} userId - The unique identifier of the user to delete.
   * @returns {Promise<{ message: string }>} - A success message if deletion is completed.
   *
   * @throws {NotFoundException} - If the user with the given ID is not found.
   * @throws {InternalServerErrorException} - If the deletion process fails unexpectedly.
   *
   */
  async deleteUser(userId: number): Promise<{ message: string }> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // ✅ Load user with relations
      const user = await queryRunner.manager.findOne(User, {
        where: { id: userId },
        relations: ['personalInfo', 'employmentInfo'],
      });

      if (!user) {
        throw new NotFoundException(`User not found with id: ${userId}`);
      }

      // ✅ Delete child entities first
      if (user.employmentInfo) {
        await queryRunner.manager.delete(
          EmploymentInfo,
          user.employmentInfo.id,
        );
      }

      if (user.personalInfo) {
        await queryRunner.manager.delete(PersonalInfo, user.personalInfo.id);
      }

      // ✅ Delete user
      await queryRunner.manager.delete(User, userId);

      // ✅ Commit transaction
      await queryRunner.commitTransaction();

      return { message: `User with id ${userId} deleted successfully.` };
    } catch (error) {
      // ❌ Rollback if anything fails
      await queryRunner.rollbackTransaction();

      if (error instanceof NotFoundException) {
        throw error;
      }

      throw new InternalServerErrorException(
        `Failed to delete user. Reason: ${error.message}`,
      );
    } finally {
      await queryRunner.release();
    }
  }
}
