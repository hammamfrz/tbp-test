import { Injectable, Inject } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { Op } from 'sequelize';
import { InjectModel } from '@nestjs/sequelize';
import { JwtService } from '@nestjs/jwt';
import { User } from '../../../users/schemas/user.model';
import { RegisterUserDto } from '../../dto/create-user.dto';
import { LoginUserDto } from '../../dto/login-user.dto';
import { Redis } from 'ioredis';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User)
    private readonly userModel: typeof User,
    private jwtService: JwtService,
    @Inject('REDIS') private redisClient: Redis,
  ) {}

  async createUser(registerUserDto: RegisterUserDto) {
    const { name, email, password } = registerUserDto;
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    try {
      const isExist = await this.userModel.findOne({
        where: {
          [Op.or]: [
            {
              email: email,
            },
            {
              name: name,
            },
          ],
        },
      });
      if (isExist) {
        throw new Error('User already exists');
      }

      await this.userModel.create({
        name: name,
        email: email,
        password: hashedPassword,
      });

      return {
        user: {
          name,
          email,
        },
        access_token: this.jwtService.sign({ name, email }),
      };
    } catch (error) {
      throw new Error(error.message);
    }
  }

  async loginUser(loginUserDto: LoginUserDto) {
    const { email, password } = loginUserDto;
    try {
      const user = await this.userModel.findOne({
        where: {
          email: email,
        },
      });
      if (!user) {
        throw new Error('User not found');
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        throw new Error('Invalid credentials');
      }

      const payload = {
        id: user.id,
        name: user.name,
        email: user.email,
      };

      return {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
        },
        access_token: this.jwtService.sign(payload),
      };
    } catch (error) {
      throw new Error(error.message);
    }
  }

  async logoutUser(token: string) {
    try {
      const expiration = this.jwtService.decode(token)['exp'];
      const expiresIn = expiration
        ? expiration - Math.floor(Date.now() / 1000)
        : 3600;
      await this.redisClient.set(`blacklist:${token}`, 'true', 'EX', expiresIn);
      console.log('Token added to blacklist');
    } catch (error) {
      throw new Error(error.message);
    }
  }

  async isTokenBlacklisted(token: string) {
    try {
      const isBlacklisted = await this.redisClient.get(`blacklist:${token}`);
      return isBlacklisted ? true : false;
    } catch (error) {
      throw new Error(error.message);
    }
  }
}
