import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SequelizeModule } from '@nestjs/sequelize';
import { RedisModule } from '@nestjs-modules/ioredis';
import { TrackingService } from './services/tracking/tracking.service';
import { TrackingController } from './controllers/tracking/tracking.controller';
import { Tracking, TrackingSchema } from './schemas/tracking.model';
import { AuthModule } from '../auth/auth.module';
import { UsersModule } from '../users/users.module';
import { TrackingGateway } from './tracking.gateway';
import { User } from '../users/schemas/user.model';
import { redisProviders } from 'src/database/redis.providers';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Tracking.name, schema: TrackingSchema },
    ]),
    SequelizeModule.forFeature([User]),
    RedisModule.forRoot({
      type: 'single',
      url: `redis://${process.env.REDIS_HOST}:${process.env.REDIS_PORT}`,
    }),
    AuthModule,
    UsersModule,
  ],
  controllers: [TrackingController],
  providers: [TrackingService, TrackingGateway, ...redisProviders],
})
export class TrackingModule {}
