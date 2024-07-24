import { Module, MiddlewareConsumer, NestModule } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { User } from './modules/users/schemas/user.model';
import { UsersModule } from './modules/users/users.module';
import { AuthModule } from './modules/auth/auth.module';
import { JwtMiddleware } from './middlewares/jwt.middleware';
import { JwtModule } from '@nestjs/jwt';
import { TrackingModule } from './modules/tracking/tracking.module';
import { MongooseModule } from '@nestjs/mongoose';
import { redisProviders } from './database/redis.providers';

@Module({
  imports: [
    SequelizeModule.forRoot({
      dialect: 'postgres',
      host: process.env.DATABASE_HOST,
      port: parseInt(process.env.DATABASE_PORT),
      username: process.env.DATABASE_USER,
      password: process.env.DATABASE_PASSWORD,
      database: process.env.DATABASE_NAME,
      models: [User],
    }),
    MongooseModule.forRoot(process.env.MONGO_URI),
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '1d' },
    }),
    UsersModule,
    AuthModule,
    TrackingModule,
  ],
  controllers: [AppController],
  providers: [AppService, ...redisProviders],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(JwtMiddleware).forRoutes('/users');
    consumer.apply(JwtMiddleware).forRoutes('/users/profile');
    consumer.apply(JwtMiddleware).forRoutes('/tracking');
  }
}
