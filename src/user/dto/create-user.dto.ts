import { Type } from 'class-transformer';
import { ValidateNested, IsNotEmpty, IsString } from 'class-validator';
import { CreatePersonalInfoDto } from './create-personal-info.dto';
import { CreateEmploymentInfoDto } from './create-employment-info.dto';

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  password: string;

  @ValidateNested()
  @Type(() => CreatePersonalInfoDto)
  personalInfo: CreatePersonalInfoDto;

  @ValidateNested()
  @Type(() => CreateEmploymentInfoDto)
  employmentInfo: CreateEmploymentInfoDto;
}
