import { Injectable, Logger } from '@nestjs/common';
import { Order } from '../order/order.entity';

@Injectable()
export class RabbitmqService {
  private readonly logger = new Logger(RabbitmqService.name);
  private messages: Order[] = [];

  handleMessage(message: Order): Order {
    this.logger.log(`Received message: ${JSON.stringify(message)}`);
    this.messages.push(message);
    return message;
  }

  getAllMessages(): Order[] {
    return this.messages;
  }
}
