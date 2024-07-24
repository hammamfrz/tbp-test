import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { JwtModule } from '@nestjs/jwt';
import { RedisModule } from '@nestjs-modules/ioredis';
import { AuthService } from './services/auth/auth.service';
import { AuthController } from './controllers/auth/auth.controller';
import { User } from '../users/schemas/user.model';
import { redisProviders } from '../../database/redis.providers';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    SequelizeModule.forFeature([User]),
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '1d' },
    }),
    RedisModule.forRoot({
      type: 'single',
      url: `redis://${process.env.REDIS_HOST}:${process.env.REDIS_PORT}`,
    }),
    UsersModule,
  ],
  controllers: [AuthController],
  providers: [AuthService, ...redisProviders],
  exports: [AuthService],
})
export class AuthModule {}
