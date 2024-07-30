import { Injectable, Inject } from '@nestjs/common';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { InjectModel as InjectSequelizeModel } from '@nestjs/sequelize';
import { JwtService } from '@nestjs/jwt';
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
    private jwtService: JwtService,
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
      userId: id,
      latitude: location.data.latitude,
      longitude: location.data.longitude,
      userProfile: userProfile.toJSON(),
    });

    await tracking.save();

    await this.redisClient.set(
      `tracking:${id}`,
      JSON.stringify({
        userProfile,
        latitude: location.data.latitude,
        longitude: location.data.longitude,
      }),
    );

    return tracking;
  }

  async getUserIdFromRedis(token: string) {
    try {
      const decoded = this.jwtService.verify(token, {
        secret: process.env.JWT_SECRET,
      });
      const trackingData = await this.redisClient.get(`tracking:${decoded.id}`);
      if (trackingData) {
        const parsedTrackingData = JSON.parse(trackingData);
        console.log('Tracking data retrieved from Redis:', parsedTrackingData);
        const userId = parsedTrackingData.userProfile.id;
        return userId;
      } else {
        console.log('No tracking data found for id:', decoded.id);
        return null;
      }
    } catch (error) {
      console.error('Error retrieving tracking data from Redis:', error);
      throw new Error(error.message);
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
