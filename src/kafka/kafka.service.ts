import { Injectable, Logger } from '@nestjs/common';
import { Order } from '../order/order.entity';

@Injectable()
export class KafkaService {
  private readonly logger = new Logger(KafkaService.name);
  private orders: Order[] = [];

  handleMessage(order: Order): Order {
    this.logger.log(`Received message: ${JSON.stringify(order)}`);
    this.orders.push(order);
    return order;
  }

  getAllMessages(): Order[] {
    return this.orders;
  }
}
