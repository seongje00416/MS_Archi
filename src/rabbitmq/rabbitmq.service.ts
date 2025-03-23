import { Order } from '../order/order.entity';
import { Injectable, Logger, OnModuleInit, OnModuleDestroy, Inject } from '@nestjs/common';
import { Connection, Channel, ConsumeMessage } from 'amqplib';
import { RABBITMQ_CLIENT } from './rabbitmq.provider';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Injectable()
export class RabbitmqService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(RabbitmqService.name);
  private messages: Order[] = [];
  private channel: Channel;

  // RabbitMQ 설정
  private readonly QUEUE_NAME = 'order_queue';

  constructor(
    @Inject(RABBITMQ_CLIENT) private readonly rabbitMQConnection: Connection,
    private readonly eventEmitter: EventEmitter2
  ) {}

  async onModuleInit() {
    await this.setupChannel();
  }

  async onModuleDestroy() {
    await this.closeChannel();
  }

  private async setupChannel() {
    try {
      this.logger.log('Setting up RabbitMQ channel...');
      this.channel = await this.rabbitMQConnection.createChannel();

      // Queue 선언
      await this.channel.assertQueue(this.QUEUE_NAME, {
        durable: true, // 서버 재시작해도 큐가 유지됩니다
      });

      this.logger.log(`Connected to RabbitMQ and listening to ${this.QUEUE_NAME}`);

      // 메시지 소비 설정
      await this.channel.consume(
        this.QUEUE_NAME,
        (message: ConsumeMessage) => {
          if (message) {
            this.processMessage(message);
          }
        },
        {
          noAck: false, // 메시지 수신 확인 모드 활성화
        }
      );
    } catch (error) {
      this.logger.error(`Failed to setup RabbitMQ channel: ${error.message}`);
      // 채널 설정 실패시 재시도 로직을 구현할 수 있습니다
      setTimeout(() => this.setupChannel(), 5000);
    }
  }

  private processMessage(message: ConsumeMessage) {
    try {
      const content = message.content.toString();
      this.logger.log(`[RabbitMQ] 새 메시지 수신: ${content}`);

      // 추가 메타데이터 로깅
      const messageMetadata = {
        routingKey: message.fields.routingKey,
        exchange: message.fields.exchange,
        timestamp: new Date().toISOString(),
        headers: message.properties.headers
      };

      this.logger.log(`[RabbitMQ] 메시지 속성: ${JSON.stringify(messageMetadata)}`);

      const order = JSON.parse(content) as Order;
      this.handleMessage(order);

      // 이벤트 발생: 메시지 수신 이벤트
      this.eventEmitter.emit('rabbitmq.message.received', {
        payload: order,
        metadata: messageMetadata
      });

      // 메시지 처리 완료를 알림
      this.channel.ack(message);
    } catch (error) {
      this.logger.error(`Error processing message: ${error.message}`);
      // 에러 발생 또한 이벤트로 발행
      this.eventEmitter.emit('rabbitmq.message.error', {
        error: error.message,
        rawMessage: message.content.toString()
      });
      // 에러 발생 시 메시지를 다시 큐에 넣을지 여부
      this.channel.nack(message, false, false);
    }
  }

  private async closeChannel() {
    try {
      if (this.channel) {
        await this.channel.close();
        this.logger.log('RabbitMQ channel closed');
      }
    } catch (error) {
      this.logger.error(`Error closing RabbitMQ channel: ${error.message}`);
    }
  }

  handleMessage(message: Order): Order {
    //this.logger.log(`Received message: ${JSON.stringify(message)}`);
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