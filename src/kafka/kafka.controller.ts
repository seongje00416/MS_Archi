import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { Order } from '../order/order.entity';
import { KafkaService } from './kafka.service';

@Controller('messages')
export class KafkaController {
  constructor(private readonly messagesService: KafkaService) {}

  @MessagePattern('messages-topic')
  async consumeMessage(@Payload() message: any) {
    const value = message.value as Order;
    return this.messagesService.handleMessage(value);
  }
}
