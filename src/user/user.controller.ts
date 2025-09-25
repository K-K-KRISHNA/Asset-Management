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
import { CreateUserDto } from './dto/create-user.dto';
import { GetAllUsersDto } from './dto/get-all-users.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserService } from './user.service';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  async create(@Body() createUserDto: CreateUserDto) {
    const data = await this.userService.create(createUserDto);
    return { status: true, message: 'User Crated Successfully', data };
  }

  @Get()
  async findAll(@Query() getAllUserDto: GetAllUsersDto) {
    const data = await this.userService.findAll(getAllUserDto);
    return { status: true, message: 'Users found successfully', data };
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const data = await this.userService.findById(+id);
    return { status: true, message: 'User found successfully', data };
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    const data = await this.userService.update(+id, updateUserDto);
    return { status: true, message: 'User updated successfully', data };
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    await this.userService.deleteUser(+id);
    return { status: true, message: 'User deleted successfully', data: null };
  }
}
