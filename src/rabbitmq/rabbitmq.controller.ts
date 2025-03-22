import { Controller } from '@nestjs/common';
import { EventPattern } from '@nestjs/microservices';
import { RabbitmqService } from './rabbitmq.service';
import { Order } from '../order/order.entity';

@Controller('order')
export class RabbitmqController {
  constructor(private readonly rabbitmqService: RabbitmqService) {}

  @EventPattern('messages_routing_key')
  async handleMessageReceived(data: Order) {
    return this.rabbitmqService.handleMessage(data);
  }
}
