import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { Repository } from 'typeorm';
import { Role } from './entities/role.entity';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class RolesService {
  constructor(
    @InjectRepository(Role)
    private readonly rolesRepo: Repository<Role>,
  ) {}

  /**
   * Creates a new role in the database.
   *
   * @param {CreateRoleDto} createRoleDto - The DTO containing role details.
   * @returns {Promise<Role>} The newly created role entity.
   * @throws {ConflictException} If the role already exists (unique constraint violation).
   * @throws {InternalServerErrorException} If a database or unexpected error occurs.
   */
  async create(createRoleDto: CreateRoleDto): Promise<Role> {
    try {
      const role = this.rolesRepo.create(createRoleDto);
      return await this.rolesRepo.save(role);
    } catch (error) {
      if (error.code === '23505') {
        // 23505 → unique_violation in PostgreSQL
        throw new ConflictException('This role already exists');
      }
      throw new InternalServerErrorException(
        `Failed to create role: ${error.message}`,
      );
    }
  }

  /**
   * Retrieves all roles from the database.
   *
   * @returns {Promise<Role[]>} A list of role entities.
   * @throws {InternalServerErrorException} If a database error occurs while fetching roles.
   */
  async findAll(): Promise<Role[]> {
    try {
      return await this.rolesRepo.find();
    } catch (error) {
      throw new InternalServerErrorException(
        `Failed to retrieve roles: ${error.message}`,
      );
    }
  }

  /**
   * Finds a role by its ID.
   *
   * @param {number} id - The ID of the role to find.
   * @returns {Promise<Role>} The role entity if found.
   * @throws {NotFoundException} If no role is found with the given ID.
   * @throws {InternalServerErrorException} If a database error occurs.
   */
  async findOne(id: number) {
    try {
      const role = await this.rolesRepo.findOne({ where: { id } });

      if (!role) {
        throw new NotFoundException(`Role not found with the id ${id}`);
      }

      return role;
    } catch (error) {
      // Known error (NotFoundException) → just rethrow
      if (error instanceof NotFoundException) {
        throw error;
      }

      // Unknown DB or runtime error → wrap in 500
      throw new InternalServerErrorException(
        `Failed to retrieve role with id ${id}: ${error.message}`,
      );
    }
  }

  /**
   * Updates an existing role in the database.
   *
   * @param {number} id - The ID of the role to update.
   * @param {UpdateRoleDto} updateRoleDto - The data transfer object containing updated role details.
   * @returns {Promise<Role>} - The updated role entity after saving changes.
   *
   * @throws {NotFoundException} If no role is found with the given ID.
   * @throws {ConflictException} If a database conflict occurs (e.g., duplicate role name).
   * @throws {InternalServerErrorException} For unexpected errors during the update process.
   */
  async update(id: number, updateRoleDto: UpdateRoleDto) {
    try {
      // ✅ Use findOne instead of find (find returns an array)
      const role = await this.rolesRepo.findOne({ where: { id } });

      if (!role) {
        throw new NotFoundException(`Role not found with id: ${id}`);
      }

      // ✅ Merge new data into existing entity
      const updatedRole = this.rolesRepo.merge(role, updateRoleDto);

      // ✅ Save the updated entity
      return await this.rolesRepo.save(updatedRole);
    } catch (err: any) {
      // ✅ Known NestJS exceptions → rethrow
      if (err instanceof NotFoundException) {
        throw err;
      }

      // ✅ Handle database conflicts (e.g., unique constraint violation)
      if (err.code === '23505') {
        throw new ConflictException('Role with this name already exists');
      }

      // ✅ Fallback for unexpected errors
      throw new InternalServerErrorException(
        err.message || 'Unexpected error occurred',
      );
    }
  }

  /**
   * Soft deletes a role by its ID.
   *
   * @param {number} id - The ID of the role to soft delete.
   * @returns {Promise<{ message: string }>} A confirmation message.
   * @throws {NotFoundException} If no role exists with the given ID.
   * @throws {InternalServerErrorException} If a database or unexpected error occurs.
   */
  async remove(id: number): Promise<{ message: string }> {
    try {
      const role = await this.rolesRepo.findOne({ where: { id } });

      if (!role) {
        throw new NotFoundException(`Role not found with id: ${id}`);
      }

      await this.rolesRepo.softDelete(id);
      return {
        message: `Role with id ${id} has been deleted successfully`,
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException(
        `Failed to soft delete role with id ${id}: ${error.message}`,
      );
    }
  }
}
