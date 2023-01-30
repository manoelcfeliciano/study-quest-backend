import {
  Inject,
  Injectable,
  OnApplicationBootstrap,
  OnApplicationShutdown,
} from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { Redis } from 'ioredis';
import { CacheStorage } from '../interfaces/cache-storage.interface';
import redisConfig from './redis.config';

@Injectable()
export class RedisService
  implements CacheStorage, OnApplicationBootstrap, OnApplicationShutdown
{
  private redisClient: Redis;

  constructor(
    @Inject(redisConfig.KEY)
    private readonly redisConfiguration: ConfigType<typeof redisConfig>,
  ) {}

  onApplicationBootstrap() {
    this.redisClient = new Redis(this.redisConfiguration);
  }
  onApplicationShutdown() {
    this.redisClient.quit();
  }

  async insert(key: string, value: string): Promise<void> {
    await this.redisClient.set(key, value);
  }

  get(key: string): Promise<string> {
    return this.redisClient.get(key);
  }

  async delete(key: string): Promise<void> {
    await this.redisClient.del(key);
  }
}
