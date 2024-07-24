import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { User } from '../../schemas/user.model';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User)
    private readonly userModel: typeof User,
  ) {}

  async findAllUsers(): Promise<User[]> {
    const users = await this.userModel.findAll();

    return users;
  }

  async getProfile(id: number): Promise<User> {
    const user = await this.userModel.findByPk(id, {
      attributes: ['id', 'name', 'email', 'createdAt', 'updatedAt'],
    });

    if (!user) {
      throw new Error('User not found');
    }

    return user;
  }
}
