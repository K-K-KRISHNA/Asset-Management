import {
  IsDateString,
  IsEmail,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsPositive,
  Min,
} from 'class-validator';

export class CreateEmploymentInfoDto {
  @IsInt()
  @IsPositive()
  empId: number;

  @IsInt()
  @IsNotEmpty()
  designationId: number;

  @IsInt()
  @Min(0)
  @IsNotEmpty()
  noticePeriod: number;

  @IsEmail()
  @IsOptional()
  email?: string;

  @IsDateString()
  @IsOptional()
  joiningDate?: Date;

  @IsInt()
  @IsOptional()
  expYears?: number;

  @IsInt()
  @IsOptional()
  expMonths?: number;

  @IsInt()
  @IsOptional()
  expDays?: number;
}
