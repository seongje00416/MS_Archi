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

  getOrder(orderId: string): Promise<Order | null> {
    this.logger.log(`Searching for order with ID: ${orderId}`);

    // orders 배열에서 orderId와 일치하는 주문을 찾습니다
    const order = this.orders.find((order) => order.orderId === orderId);

    if (order) {
      this.logger.log(`Found order: ${JSON.stringify(order)}`);
      return Promise.resolve(order);
    } else {
      this.logger.log(`Order with ID ${orderId} not found`);
      return Promise.resolve(null);
    }
  }
}
