import { IsString, Length } from 'class-validator';

export class CreateUserDto {
  @IsString()
  @Length(5)
  username: string;

  @IsString()
  @Length(8)
  password: string;

  @IsString()
  @Length(8)
  retypePassword: string;

  @IsString()
  @Length(2)
  firstName: string;

  @IsString()
  @Length(2)
  lastName: string;

  @IsString()
  email: string;
}
