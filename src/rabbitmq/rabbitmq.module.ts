import { Module } from '@nestjs/common';
import { RabbitmqService } from './rabbitmq.service';
import { RabbitmqController } from './rabbitmq.controller';
import { RabbitMQProvider } from './rabbitmq.provider';
import { RabbitmqEventListeners } from './rabbitmq.listener';

@Module({
  providers: [RabbitMQProvider, RabbitmqService, RabbitmqEventListeners],
  exports: [RabbitMQProvider, RabbitmqService],
  controllers: [RabbitmqController],
})
export class RabbitmqModule {}
