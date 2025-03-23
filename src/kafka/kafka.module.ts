import { Module } from '@nestjs/common';
import { KafkaService } from './kafka.service';
import { KafkaController } from './kafka.controller';
import { KafkaProvider } from './kafka.provider';
import { KafkaEventListeners } from './kafka.listener';

@Module({
  providers: [KafkaProvider, KafkaService, KafkaEventListeners],
  controllers: [KafkaController],
  exports: [KafkaService],
})
export class KafkaModule {}
