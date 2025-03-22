import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { KafkaService } from './kafka.service';
import { KafkaController } from './kafka.controller';

@Module({
  imports: [
    ClientsModule.registerAsync([
      {
        name: 'KAFKA_SERVICE',
        imports: [ConfigModule],
        useFactory: (configService: ConfigService) => {
          const clientId =
            configService.get('KAFKA_CLIENT_ID') || 'nestjs-consumer';
          const brokers = [
            configService.get('KAFKA_BROKER') || 'localhost:9092',
          ];
          const groupId =
            configService.get('KAFKA_GROUP_ID') || 'nestjs-consumer-group';

          return {
            transport: Transport.KAFKA,
            options: {
              client: {
                clientId,
                brokers,
              },
              consumer: {
                groupId,
                allowAutoTopicCreation: true,
              },
            },
          };
        },
        inject: [ConfigService],
      },
    ]),
  ],
  providers: [KafkaService],
  controllers: [KafkaController],
})
export class KafkaModule {}
