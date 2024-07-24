import { Controller, Get, Req, Res } from '@nestjs/common';
import { Response } from 'express';
import { UsersService } from '../../services/users/users.service';
import { RequestWithUser } from '../../../../middlewares/jwt.middleware';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@Controller('users')
@ApiTags('users')
@ApiBearerAuth()
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  async findAllUsers(@Res() response: Response): Promise<void> {
    try {
      const result = await this.usersService.findAllUsers();
      response.status(200).json({
        status: 'OK',
        message: 'Successfully fetched all users',
        data: result,
      });
    } catch (error) {
      response.status(500).json({
        status: 'ERROR',
        message: 'Failed to fetch all users',
        data: error,
      });
    }
  }

  @Get('/profile')
  async findProfile(
    @Req() request: RequestWithUser,
    @Res() response: Response,
  ): Promise<void> {
    try {
      const { id } = request.user;
      const user = await this.usersService.getProfile(id);
      response.status(200).json({
        status: 'OK',
        message: 'Successfully fetched profile',
        data: user,
      });
    } catch (error) {
      response.status(500).json({
        status: 'ERROR',
        message: 'Failed to fetch profile',
        data: error,
      });
    }
  }
}
