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

  getOrder(orderId: string): Promise<Order | null> {
    this.logger.log(`Searching for order with ID: ${orderId}`);

    // messages 배열에서 orderId와 일치하는 주문을 찾습니다
    const order = this.messages.find((message) => message.orderId === orderId);

    if (order) {
      this.logger.log(`Found order: ${JSON.stringify(order)}`);
      return Promise.resolve(order);
    } else {
      this.logger.log(`Order with ID ${orderId} not found`);
      return Promise.resolve(null);
    }
  }
}
