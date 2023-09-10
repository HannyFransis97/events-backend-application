import { IsDate, IsString, Length } from 'class-validator';

export class CreateEventDto {
  @IsString()
  @Length(5, 255, { message: 'The name length is wrong' })
  name: string;

  @Length(5, 255)
  description: string;

  @IsDate()
  when: string;

  @IsString()
  // @Length(5, 255, { groups: ['create'] })
  // @Length(10, 30, { groups: ['update'] })
  @Length(5, 255)
  address: string;
}
