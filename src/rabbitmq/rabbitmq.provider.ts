import { Provider } from '@nestjs/common';
import { connect, Connection } from 'amqplib';

export const RABBITMQ_CLIENT = 'RABBITMQ_CLIENT';

export const RabbitMQProvider: Provider = {
  provide: RABBITMQ_CLIENT,
  useFactory: async (): Promise<Connection> => {
    const host = process.env.RABBITMQ_HOST || 'localhost';
    const port = process.env.RABBITMQ_PORT || '5672';
    const username = process.env.RABBITMQ_USERNAME || 'guest';
    const password = process.env.RABBITMQ_PASSWORD || 'guest';

    const url = `amqp://${username}:${password}@${host}:${port}`;

    try {
      return await connect(url);
    } catch (error) {
      console.error('RabbitMQ 연결 실패:', error);
      throw error;
    }
  },
};
