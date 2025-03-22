import { Module } from '@nestjs/common';
import { RabbitmqService } from './rabbitmq.service';
import { RabbitmqController } from './rabbitmq.controller';
import { RabbitMQProvider } from './rabbitmq.provider';

@Module({
  providers: [RabbitMQProvider, RabbitmqService],
  controllers: [RabbitmqController],
})
export class RabbitmqModule {}
