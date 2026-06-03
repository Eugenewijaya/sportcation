import { IsString, Length, Matches } from 'class-validator';

export class VerifyOtpDto {
  @IsString()
  @Length(32, 32)
  otpSessionId!: string;

  @IsString()
  @Matches(/^\d{6}$/)
  otpCode!: string;
}
