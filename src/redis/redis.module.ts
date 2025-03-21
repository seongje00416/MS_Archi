import { Module } from '@nestjs/common';
import { RedisService } from './redis.service';
import { redisClientProvider } from './redis-client.provider';

@Module({
  providers: [redisClientProvider, RedisService],
  exports: [RedisService],
})
export class RedisModule {}
