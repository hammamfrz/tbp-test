import { Controller, Post, Res, Req, Body } from '@nestjs/common';
import { RequestWithUser } from '../../../../middlewares/jwt.middleware';
import { Response } from 'express';
import { AuthService } from '../../services/auth/auth.service';
import { RegisterUserDto } from '../../dto/create-user.dto';
import { LoginUserDto } from '../../dto/login-user.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@Controller('auth')
@ApiTags('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('/register')
  async register(
    @Res() response: Response,
    @Body() registerUserDto: RegisterUserDto,
  ): Promise<void> {
    try {
      const result = await this.authService.createUser(registerUserDto);
      response.status(200).json({
        status: 'OK',
        message: 'Successfully registered',
        data: result,
      });
    } catch (error) {
      response.status(500).json({
        status: 'ERROR',
        message: 'Failed to register',
        data: error,
      });
    }
  }

  @Post('/login')
  async login(
    @Res() response: Response,
    @Body() loginUserDto: LoginUserDto,
  ): Promise<void> {
    try {
      const result = await this.authService.loginUser(loginUserDto);
      response.status(200).json({
        status: 'OK',
        message: 'Successfully logged in',
        data: result,
      });
    } catch (error) {
      response.status(500).json({
        status: 'ERROR',
        message: 'Failed to login',
        data: error,
      });
    }
  }

  @Post('/logout')
  @ApiBearerAuth()
  async logout(
    @Req() request: RequestWithUser,
    @Res() response: Response,
  ): Promise<void> {
    try {
      const token = request.headers.authorization.replace('Bearer ', '');
      const tokenBlacklisted = await this.authService.isTokenBlacklisted(token);
      if (tokenBlacklisted) {
        response.status(400).json({
          status: 'ERROR',
          message: 'Token already blacklisted',
        });
        return;
      }
      response.status(200).json({
        status: 'OK',
        message: 'Successfully logged out',
      });
    } catch (error) {
      response.status(500).json({
        status: 'ERROR',
        message: 'Failed to logout',
        data: error,
      });
    }
  }
}
