import { BadRequestException, Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from './dto/create-user.dto';
import { User } from './user.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

@Controller('users')
export class UserController {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly authService: AuthService,
  ) {}

  @Post()
  async create(@Body() createUserDto: CreateUserDto) {
    const { username, email, firstName, lastName, password, retypePassword } =
      createUserDto;

    const user = new User();

    if (password !== retypePassword) {
      throw new BadRequestException(['Passwords are not identical']);
    }
    const existingUser = await this.userRepository.findOne({
      where: [
        {
          username,
        },
        {
          email,
        },
      ],
    });

    if (existingUser) {
      throw new BadRequestException(['Username or password is already taken']);
    }
    user.username = username;
    user.email = email;
    user.password = await this.authService.hashPassword(password);
    user.firstName = firstName;
    user.lastName = lastName;

    return {
      ...(await this.userRepository.save(user)),
      token: this.authService.getTokenForUser(user),
    };
  }
}
