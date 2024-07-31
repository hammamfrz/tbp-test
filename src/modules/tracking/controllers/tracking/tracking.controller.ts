import { Controller, Get, Post, Req, Res } from '@nestjs/common';
import { TrackingService } from '../../services/tracking/tracking.service';
import { TrackingGateway } from '../../tracking.gateway';
import { Response } from 'express';
import { RequestWithUser } from '../../../../middlewares/jwt.middleware';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@Controller('tracking')
@ApiTags('tracking')
@ApiBearerAuth()
export class TrackingController {
  constructor(
    private readonly trackingService: TrackingService,
    private readonly trackingGateway: TrackingGateway
  ) {}

  @Post()
  async track(
    @Req() request: RequestWithUser,
    @Res() response: Response,
  ): Promise<void> {
    try {
      const { id } = request.user;
      const track = await this.trackingService.trackUser(id);
      if (!track) {
        throw new Error('Failed to track');
      }
      const userRedis = await this.trackingService.getUserFromRedis(id);
      if (!userRedis) {
        throw new Error('Failed to get user from redis');
      }
      const result = await this.trackingService.getTracking(userRedis.userProfile.id);
      this.trackingGateway.server.emit('trackingUpdate', result);
      response.status(200).json({
        status: 'OK',
        message: 'Successfully tracked',
        data: result,
      });
    } catch (error) {
      response.status(500).json({
        status: 'ERROR',
        message: 'Failed to track',
        data: error,
      });
    }
  }

  @Get()
  async getTracking(
    @Req() request: RequestWithUser,
    @Res() response: Response,
  ): Promise<void> {
    try {
      const { id } = request.user;
      const result = await this.trackingService.getTracking(id);
      response.status(200).json({
        status: 'OK',
        message: 'Successfully fetched tracking',
        data: result,
      });
    } catch (error) {
      response.status(500).json({
        status: 'ERROR',
        message: '`Failed to fetch tracking',
        data: error,
      });
    }
  }
}
