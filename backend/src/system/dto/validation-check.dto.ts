import { IsEmail, IsIn, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class ValidationCheckDto {
  @IsString()
  @MinLength(2)
  @MaxLength(80)
  displayName!: string;

  @IsEmail()
  email!: string;

  @IsOptional()
  @IsIn(['user', 'partner', 'admin'])
  role?: 'user' | 'partner' | 'admin';
}
