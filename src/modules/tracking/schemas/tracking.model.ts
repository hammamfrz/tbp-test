import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class Tracking extends Document {
  @Prop()
  trackingId: string;

  @Prop()
  userId: string;

  @Prop()
  latitude: number;

  @Prop()
  longitude: number;

  @Prop()
  timestamp: Date;

  @Prop({ type: Object, default: {} })
  userProfile?: Record<string, any>;
}

export const TrackingSchema = SchemaFactory.createForClass(Tracking);
