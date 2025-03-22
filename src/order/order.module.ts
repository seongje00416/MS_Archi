import { Module } from '@nestjs/common';
import { RedisModule } from '../redis/redis.module';
import { OrdersController } from './order.controller';
import { OrdersService } from './order.service';

@Module({
  imports: [RedisModule],
  controllers: [OrdersController],
  providers: [OrdersService],
  exports: [OrdersService],
})
export class OrdersModule {}
