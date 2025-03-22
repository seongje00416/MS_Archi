import { Module } from '@nestjs/common';
import { RedisModule } from '../redis/redis.module';
import { OrdersModule } from '../order/order.module';
import { EventsService } from './event.service';
import { OrderListener } from '../order/order.listener';

@Module({
  imports: [RedisModule, OrdersModule],
  providers: [EventsService, OrderListener],
})
export class EventsModule {}
