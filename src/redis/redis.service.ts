import { Inject, Injectable, Logger } from '@nestjs/common';
import Redis from 'ioredis';
import { REDIS_CLIENT } from './redis-client.provider';
import {Order} from "../order/order.entity";

@Injectable()
export class RedisService {
    private readonly logger = new Logger(RedisService.name);
    private readonly ORDER_KEY_PREFIX = 'order:';
    private readonly ORDER_QUEUE = 'order_queue';

    constructor(
        @Inject(REDIS_CLIENT) private readonly redisClient: Redis,
    ) {}

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

    async popFromOrderQueue(timeout = 5): Promise<string | null> {
        try {
            const result = await this.redisClient.brpop(this.ORDER_QUEUE, timeout);

            if (!result) {
                return null;
            }

            // BRPOP returns [key, value]
            return result[1];
        } catch (error) {
            this.logger.error(`Error popping from queue: ${error.message}`, error.stack);
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