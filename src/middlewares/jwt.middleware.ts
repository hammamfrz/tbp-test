import {
  Injectable,
  NestMiddleware,
  UnauthorizedException,
} from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { JwtService } from '@nestjs/jwt';
import { User } from 'src/modules/users/schemas/user.model';
import { AuthService } from 'src/modules/auth/services/auth/auth.service';

export interface RequestWithUser extends Request {
  user: User;
}

@Injectable()
export class JwtMiddleware implements NestMiddleware {
  constructor(
    private readonly jwtService: JwtService,
    private readonly authService: AuthService,
  ) {}

  async use(req: RequestWithUser, res: Response, next: NextFunction) {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      throw new UnauthorizedException('Authorization header is required');
    }

    const token = authHeader && authHeader.replace('Bearer ', '');

    if (!token) {
      throw new UnauthorizedException('Token is required');
    }

    if (await this.authService.isTokenBlacklisted(token)) {
      throw new UnauthorizedException('Token is blacklisted');
    }

    try {
      const secret = process.env.JWT_SECRET;
      const decoded = this.jwtService.verify(token, { secret });
      const user = await User.findByPk(decoded.id);

      if (!user) {
        throw new UnauthorizedException('User not found');
      }

      (req as RequestWithUser).user = user;
      next();
    } catch (error) {
      throw new UnauthorizedException('Unauthorized');
    }
  }
}
