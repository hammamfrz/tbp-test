import { Injectable, Inject } from '@nestjs/common';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { InjectModel as InjectSequelizeModel } from '@nestjs/sequelize';
import { Tracking } from '../../schemas/tracking.model';
import { Redis } from 'ioredis';
import { User } from '../../../users/schemas/user.model';
import axios from 'axios';

@Injectable()
export class TrackingService {
  constructor(
    @InjectModel(Tracking.name) private trackingModel: Model<Tracking>,
    @InjectSequelizeModel(User) private readonly userModel: typeof User,
    @Inject('REDIS') private redisClient: Redis,
  ) {}

  async trackUser(id: string) {
    const userProfile = await this.userModel.findByPk(id, {
      attributes: ['id', 'name', 'email'],
    });

    if (!userProfile) {
      throw new Error('User not found');
    }

    const location = await axios.get(
      `https://api.ipgeolocation.io/ipgeo?apiKey=${process.env.IP_API_KEY}`,
    );

    if (location.status !== 200) {
      throw new Error('Failed to get location');
    }

    const tracking = new this.trackingModel({
      userId: userProfile.id,
      latitude: location.data.latitude,
      longitude: location.data.longitude,
      userProfile: userProfile.toJSON(),
    });

    await tracking.save();

    const storeRedisIsExist = await this.redisClient.get(`tracking:${id}`);

    if (!storeRedisIsExist) {
      await this.redisClient.set(
        `tracking:${id}`,
        JSON.stringify({
          userProfile,
        }),
      );
    }

    return tracking;
  }

  async getUserFromRedis(id: string) {
    try {
      const trackingData = await this.redisClient.get(`tracking:${id}`);
      if (!trackingData) {
        throw new Error('Tracking data not found');
      }
      return JSON.parse(trackingData);
    } catch (error) {
      throw new Error('Failed to get tracking data');
    }
  }

  async getTracking(id: string) {
    const tracking = await this.trackingModel
      .findOne({ userId: id })
      .sort({ _id: -1 })
      .limit(1);
    if (!tracking) {
      throw new Error('Tracking not found');
    }
    return tracking;
  }
}
