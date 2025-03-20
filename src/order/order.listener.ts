import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import Redis from 'ioredis';
import {RedisService} from "../redis/redis.service";
import {OrdersService} from "./order.service";
import {OrderEvent} from "./order.entity";

@Injectable()
export class OrderListener implements OnModuleInit {
    private readonly logger = new Logger(OrderListener.name);
    private subscriber: Redis;

    constructor(
        private readonly redisService: RedisService,
        private readonly ordersService: OrdersService,
    ) {}

    async onModuleInit() {
        await this.setupSubscriber();
    }

    private async setupSubscriber() {
        try {
            this.subscriber = await this.redisService.createRedisSubscriber();

            // 주문 채널 구독
            await this.subscriber.subscribe('order_channel');
            this.logger.log('OrderListener subscribed to order_channel');

            // 메시지 이벤트 핸들러 등록
            this.subscriber.on('message', (channel, message) => {
                if (channel === 'order_channel') {
                    this.handleOrderEvent(message);
                }
            });
        } catch (error) {
            this.logger.error(`Error setting up subscriber: ${error.message}`, error.stack);
        }
    }

    private handleOrderEvent(message: string) {
        try {
            const event: OrderEvent = JSON.parse(message);
            this.logger.log(`Received order event: ${event.eventType}`);

            if (event.eventType === 'ORDER_CREATED') {
                this.processOrderCreatedEvent(event);
            } else {
                this.logger.log(`Unhandled event type: ${event.eventType}`);
            }
        } catch (error) {
            this.logger.error(`Error handling order event: ${error.message}`, error.stack);
        }
    }

    private async processOrderCreatedEvent(event: OrderEvent) {
        try {
            this.logger.log(`Processing order created event for order: ${event.payload.orderId}`);

            // 주문 데이터 처리 로직 (실제 비즈니스 로직 호출)
            await this.ordersService.processNewOrder(event.payload);

        } catch (error) {
            this.logger.error(`Error processing order created event: ${error.message}`, error.stack);
        }
    }
}