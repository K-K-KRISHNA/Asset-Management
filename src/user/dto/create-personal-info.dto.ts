import {
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  Length,
} from 'class-validator';
import { BLOOD_GROUPS } from '../enums/blood-groups.enum';

export class CreatePersonalInfoDto {
  @IsString()
  @IsNotEmpty()
  firstName: string;

  @IsString()
  @IsNotEmpty()
  lastName: string;

  @IsString()
  @Length(10, 10)
  mobile: string;

  @IsDateString()
  @IsOptional()
  dateOfBirth?: Date;

  @IsString()
  @IsOptional()
  email?: string;

  @IsEnum(BLOOD_GROUPS)
  @IsOptional()
  bloodGroup?: BLOOD_GROUPS;

  @IsString()
  @IsOptional()
  address?: string;
}
