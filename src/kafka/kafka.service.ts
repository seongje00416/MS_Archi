import { Inject, Injectable, Logger } from '@nestjs/common';
import { Order } from '../order/order.entity';
import { Consumer, EachMessagePayload, Kafka } from 'kafkajs';
import { KAFKA_CLIENT } from './kafka.provider';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Injectable()
export class KafkaService {
  private readonly logger = new Logger(KafkaService.name);
  private messages: Order[] = [];
  private consumer: Consumer;

  // Kafka 설정
  private readonly TOPIC_NAME = "orders";
  private readonly CONSUMER_GROUP = 'order-service-group';

  constructor(
    @Inject(KAFKA_CLIENT) private readonly kafka: Kafka,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async onModuleInit() {
    await this.setupConsumer();
  }

  async onModuleDestroy() {
    await this.disconnectConsumer();
  }

  private async setupConsumer() {
    try {
      this.logger.log('Setting up Kafka consumer...');
      this.consumer = this.kafka.consumer({ groupId: this.CONSUMER_GROUP });

      await this.consumer.connect();
      this.logger.log('Connected to Kafka');

      // 토픽 구독
      await this.consumer.subscribe({
        topic: this.TOPIC_NAME,
        fromBeginning: false,
      });

      this.logger.log(`Subscribed to Kafka topic: ${this.TOPIC_NAME}`);

      // 메시지 소비 설정
      await this.consumer.run({
        eachMessage: async (payload: EachMessagePayload) => {
          await this.processMessage(payload);
        },
      });
    } catch (error) {
      this.logger.error(`Failed to setup Kafka consumer: ${error.message}`);
      // 재시도 로직
      setTimeout(() => this.setupConsumer(), 5000);
    }
  }

  private async processMessage(payload: EachMessagePayload) {
    const { topic, partition, message } = payload;
    const prefix = `${topic}[${partition} | ${message.offset}] / ${message.timestamp}`;

    try {
      // 메시지 처리
      if (message.value) {
        const content = message.value.toString();
        this.logger.log(`[Kafka] 새 메시지 수신: ${content}`);

        // 메타데이터 로깅
        const messageMetadata = {
          topic,
          partition,
          offset: message.offset,
          timestamp: message.timestamp,
          headers: message.headers,
        };

        this.logger.log(
          `[Kafka] 메시지 속성: ${JSON.stringify(messageMetadata)}`,
        );

        const order = JSON.parse(content) as Order;
        this.handleMessage(order);

        // 이벤트 발생
        this.eventEmitter.emit('kafka.message.received', {
          payload: order,
          metadata: messageMetadata,
        });
      }
    } catch (error) {
      this.logger.error(`${prefix} Error processing message: ${error.message}`);
      // 에러 이벤트 발생
      this.eventEmitter.emit('kafka.message.error', {
        error: error.message,
        rawMessage: message.value ? message.value.toString() : '',
        metadata: {
          topic,
          partition,
          offset: message.offset,
        },
      });
    }
  }

  private async disconnectConsumer() {
    try {
      if (this.consumer) {
        await this.consumer.disconnect();
        this.logger.log('Disconnected from Kafka');
      }
    } catch (error) {
      this.logger.error(`Error disconnecting from Kafka: ${error.message}`);
    }
  }

  handleMessage(message: Order): Order {
    this.logger.log(`Processed message: ${JSON.stringify(message)}`);
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

  /**
   * 저장된 모든 메시지를 반환합니다
   */
  getAllMessages(): Order[] {
    return [...this.messages];
  }

  /**
   * 로컬에 저장된 메시지만 초기화합니다
   */
  clearLocalMessages(): void {
    const count = this.messages.length;
    this.messages = [];
    this.logger.log(`로컬 메시지 저장소 초기화: ${count}개 메시지 제거됨`);
    return;
  }

  /**
   * 메시지 발행 (Producer 역할)
   */
  async sendMessage(order: Order): Promise<void> {
    try {
      const producer = this.kafka.producer();
      await producer.connect();

      this.logger.log(`메시지 발행: ${JSON.stringify(order)}`);

      await producer.send({
        topic: this.TOPIC_NAME,
        messages: [
          {
            value: JSON.stringify(order),
            headers: {
              source: 'order-service',
              timestamp: Date.now().toString(),
            },
          },
        ],
      });

      await producer.disconnect();
      this.logger.log('메시지 발행 완료');
    } catch (error) {
      this.logger.error(`메시지 발행 실패: ${error.message}`);
      throw error;
    }
  }
}
