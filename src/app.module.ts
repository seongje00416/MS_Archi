import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { RedisModule } from './redis/redis.module';
import { ConfigModule } from '@nestjs/config';
import { OrdersModule } from './order/order.module';
import { RabbitmqModule } from './rabbitmq/rabbitmq.module';
import { KafkaModule } from './kafka/kafka.module';
import { EventEmitterModule } from '@nestjs/event-emitter';

@Module({
  imports: [
    EventEmitterModule.forRoot(),
    OrdersModule,
    RedisModule,
    RabbitmqModule,
    KafkaModule,
    ConfigModule.forRoot({ isGlobal: true }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
