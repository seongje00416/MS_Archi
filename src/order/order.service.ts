import { Injectable, Logger } from '@nestjs/common';
import { RedisService } from '../redis/redis.service';
import { Order } from './order.entity';

@Injectable()
export class OrdersService {
  private readonly logger = new Logger(OrdersService.name);

  constructor(private readonly redisService: RedisService) {}

  async getOrder(orderId: string): Promise<Order | null> {
    try {
      return await this.redisService.getOrder(orderId);
    } catch (error) {
      this.logger.error(`Error getting order: ${error.message}`, error.stack);
      throw error;
    }
  }

  async processNewOrder(order: Order): Promise<void> {
    try {
      this.logger.log(`Processing new order: ${order.orderId}`);

      // 비즈니스 로직 처리 (예: 재고 확인, 결제 처리 등)
      this.logger.log(`Performing business logic for order ${order.orderId}`);

      // 주문 상태 업데이트
      order.status = 'PROCESSING';

      // 업데이트된 주문 정보를 Redis에 저장
      await this.redisService.setOrder(order);

      this.logger.log(`Order ${order.orderId} processed successfully`);
    } catch (error) {
      this.logger.error(
        `Error processing order: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }
}
