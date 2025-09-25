import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { CreateRoleDto } from './dto/create-role.dto';
import { GetAllRolesDto } from './dto/get-all-roles.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { RolesService } from './roles.service';

@Controller('roles')
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @Post()
  async create(@Body() createRoleDto: CreateRoleDto) {
    const data = await this.rolesService.create(createRoleDto);
    return { status: true, message: 'Role Created Successfully', data };
  }

  @Get()
  async findAll(@Query() getAllRolesDto: GetAllRolesDto) {
    const data = await this.rolesService.findAll(getAllRolesDto);
    return { status: true, message: 'Roles Found Successfully', data };
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const data = await this.rolesService.findOne(+id);
    return { status: true, message: 'Role Found Successfully', data };
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateRoleDto: UpdateRoleDto) {
    const data = await this.rolesService.update(+id, updateRoleDto);
    return { status: true, message: 'Role Updated Successfully', data };
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    await this.rolesService.remove(+id);
    return { status: true, message: 'Role Deleted Successfully', data: null };
  }
}
