import { Provider } from '@nestjs/common';
import { Kafka, KafkaConfig } from 'kafkajs';

export const KAFKA_CLIENT = 'KAFKA_CLIENT';

export const KafkaProvider: Provider = {
  provide: KAFKA_CLIENT,
  useFactory: async (): Promise<Kafka> => {
    const host = process.env.KAFKA_BROKER || 'localhost:9092';
    const username = process.env.KAFKA_USERNAME;
    const password = process.env.KAFKA_PASSWORD;

    const config: KafkaConfig = {
      clientId: 'nest-consumer-service',
      brokers: [host],
    };

    // SASL 인증이 필요한 경우 추가
    if (username && password) {
      config.sasl = {
        mechanism: 'plain',
        username,
        password,
      };
      config.ssl = true;
    }

    try {
      return new Kafka(config);
    } catch (error) {
      console.error('Kafka 연결 실패:', error);
      throw error;
    }
  },
};
