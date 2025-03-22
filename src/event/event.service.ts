import {
  Injectable,
  Logger,
  OnModuleInit,
  OnModuleDestroy,
} from '@nestjs/common';
import Redis from 'ioredis';
import { RedisService } from '../redis/redis.service';

@Injectable()
export class EventsService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(EventsService.name);
  private subscriber: Redis;

  constructor(private readonly redisService: RedisService) {}

  async onModuleInit() {
    await this.setupRedisSubscriber();
  }

  async onModuleDestroy() {
    if (this.subscriber) {
      this.subscriber.disconnect();
    }
  }

  private async setupRedisSubscriber() {
    try {
      this.subscriber = await this.redisService.createRedisSubscriber();

      // 주문 채널 구독
      await this.subscriber.subscribe('order_channel');

      this.logger.log('Subscribed to order_channel');

      // 메시지 수신 처리
      this.subscriber.on('message', (channel, message) => {
        this.handleMessage(channel, message);
      });
    } catch (error) {
      this.logger.error(
        `Error setting up Redis subscriber: ${error.message}`,
        error.stack,
      );
    }
  }

  private handleMessage(channel: string, message: string) {
    try {
      this.logger.log(`Received message on channel ${channel}`);

      if (channel === 'order_channel') {
        const event = JSON.parse(message);
        this.logger.log(`Processing event: ${event.eventType}`);

        // 이벤트 발생
        this.emitEvent(event.eventType, event);
      }
    } catch (error) {
      this.logger.error(
        `Error handling message: ${error.message}`,
        error.stack,
      );
    }
  }

  private emitEvent(eventType: string, eventData: any) {
    try {
      // 이벤트 리스너에게 이벤트 전달
      const listeners = this.getListenersForEvent(eventType);

      for (const listener of listeners) {
        listener.handleEvent(eventData);
      }
    } catch (error) {
      this.logger.error(`Error emitting event: ${error.message}`, error.stack);
    }
  }

  private getListenersForEvent(eventType: string): any[] {
    // 실제 구현에서는 이벤트 타입에 따라 리스너 목록을 반환
    // 이 예제에서는 간단히 하기 위해 모든 이벤트를 OrderListener로 라우팅
    return []; // 여기서는 빈 배열 반환, 실제 구현은 OrderListener.ts에서 직접 처리
  }
}
