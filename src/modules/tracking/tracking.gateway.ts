import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway()
export class TrackingGateway {
  @WebSocketServer()
  server: Server;

  handleConnection(client: Socket) {
    console.log('Client connected:', client.id);
  }

  handleDisconnect(client: Socket) {
    console.log('Client disconnected:', client.id);
  }

  @SubscribeMessage('track')
  handleTracking(@MessageBody() data: any) {
    console.log('Received tracking data:', data);
    this.server.emit('trackingUpdate', data);
  }
}
