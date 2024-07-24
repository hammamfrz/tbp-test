import { IsEmail, IsString } from 'class-validator';

export class LoginUserDto {
  @IsString()
  name: string;

  @IsEmail()
  email: string;

  @IsString()
  password: string;
}
