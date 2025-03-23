import { Inject, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import Redis from 'ioredis';
import { REDIS_CLIENT } from './redis-client.provider';
import { Order } from '../order/order.entity';

@Injectable()
export class RedisService implements OnModuleInit {
  private readonly logger = new Logger(RedisService.name);
  private readonly ORDER_KEY_PREFIX = 'order:';
  private readonly ORDER_CHANNEL = 'order_events';
  private subscriber: Redis;

  constructor(@Inject(REDIS_CLIENT) private readonly redisClient: Redis) {}

  async onModuleInit() {
    // 구독 전용 Redis 클라이언트 생성
    this.subscriber = await this.createRedisSubscriber();

    // 주문 이벤트 채널 구독
    await this.subscriber.subscribe(this.ORDER_CHANNEL);

    // 메시지 핸들러 설정
    this.subscriber.on('message', (channel, message) => {
      if (channel === this.ORDER_CHANNEL) {
        try {
          const orderData = JSON.parse(message) as Order;
          this.handleMessage(orderData);
        } catch (error) {
          this.logger.error(`메시지 처리 오류: ${error.message}`, error.stack);
        }
      }
    });
  }

  private handleMessage(data: any): void {
    const { eventType, order } = data;
    this.logger.log(`이벤트 수신: ${eventType} - 주문 ID: ${order.orderId}`);

    // 이벤트 유형에 따른 처리 로직
    switch (eventType) {
      case 'created':
        this.processOrderCreated(order);
        break;
      default:
        this.logger.warn(`알 수 없는 이벤트 유형: ${eventType}`);
    }
  }

  private async processOrderCreated(order: Order): Promise<void> {
    try {
      // 주문 생성 이벤트 처리 로직
      await this.setOrder(order);
      this.logger.log(`주문 생성 처리 완료: ${order.orderId}`);
    } catch (error) {
      this.logger.error(`주문 생성 처리 오류: ${error.message}`, error.stack);
    }
  }

  async getOrder(orderId: string): Promise<Order | null> {
    try {
      const key = `${this.ORDER_KEY_PREFIX}${orderId}`;
      const orderData = await this.redisClient.get(key);

      if (!orderData) {
        return null;
      }

      return JSON.parse(orderData);
    } catch (error) {
      this.logger.error(`Error getting order: ${error.message}`, error.stack);
      throw error;
    }
  }

  async setOrder(order: Order): Promise<void> {
    try {
      const key = `${this.ORDER_KEY_PREFIX}${order.orderId}`;
      await this.redisClient.set(key, JSON.stringify(order));
      this.logger.log(`Order saved: ${key}`);
    } catch (error) {
      this.logger.error(`Error saving order: ${error.message}`, error.stack);
      throw error;
    }
  }

  async createRedisSubscriber(): Promise<Redis> {
    // Create a duplicate connection for subscription
    const subscriber = new Redis({
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379', 10),
    });

    return subscriber;
  }
}
