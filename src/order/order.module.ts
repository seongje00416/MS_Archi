import { Module } from '@nestjs/common';
import { RedisModule } from '../redis/redis.module';
import { OrdersController } from './order.controller';
import { OrdersService } from './order.service';
import { RabbitmqModule } from '../rabbitmq/rabbitmq.module';
import { KafkaModule } from '../kafka/kafka.module';

@Module({
  imports: [RedisModule, RabbitmqModule, KafkaModule],
  controllers: [OrdersController],
  providers: [OrdersService],
  exports: [OrdersService],
})
export class OrdersModule {}
