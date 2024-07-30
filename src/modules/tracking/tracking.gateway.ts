import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { TrackingService } from './services/tracking/tracking.service';

@WebSocketGateway()
export class TrackingGateway {
  @WebSocketServer()
  server: Server;

  constructor(private readonly trackingService: TrackingService) {}

  handleConnection(client: Socket) {
    console.log('Client connected:', client.id);
  }

  handleDisconnect(client: Socket) {
    console.log('Client disconnected:', client.id);
  }

  @SubscribeMessage('track')
  async handleTracking(@MessageBody() data: any) {
    console.log('Received tracking data:', data);
    try {
      const token = data.token.replace('Bearer ', '');
      const userId = await this.trackingService.getUserIdFromRedis(token);
      const tracking = await this.trackingService.getTracking(userId);
      this.server.emit('trackingUpdate', tracking);
    } catch (error) {
      console.error('Error tracking user:', error);
      this.server.emit('error', { message: error.message });
    }
  }
}
