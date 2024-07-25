import { Controller, Get, Post, Req, Res } from '@nestjs/common';
import { TrackingService } from '../../services/tracking/tracking.service';
import { Response } from 'express';
import { RequestWithUser } from '../../../../middlewares/jwt.middleware';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@Controller('tracking')
@ApiTags('tracking')
@ApiBearerAuth()
export class TrackingController {
  constructor(private readonly trackingService: TrackingService) {}

  @Post()
  async track(
    @Req() request: RequestWithUser,
    @Res() response: Response,
  ): Promise<void> {
    try {
      const { id } = request.user;
      const result = await this.trackingService.trackUser(id);
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

  @Get('/redis')
  async getUserIdFromToken(
    @Req() req: Request,
    @Res() res: Response,
  ): Promise<void> {
    try {
      const authHeader = req.headers['authorization'];
      if (!authHeader) {
        throw new Error('Authorization header not found');
      }

      const token = authHeader.replace('Bearer ', '');
      const userId = await this.trackingService.getUserIdFromRedis(token);

      res.status(200).json({
        status: 'OK',
        message: 'Successfully fetched user ID from token',
        data: { userId },
      });
    } catch (error) {
      res.status(500).json({
        status: 'ERROR',
        message: 'Failed to fetch user ID from token',
        data: { error: error.message },
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
