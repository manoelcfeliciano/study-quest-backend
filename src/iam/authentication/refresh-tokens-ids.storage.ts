import { Injectable } from '@nestjs/common';
import { RedisService } from 'src/common/db/redis/redis.service';
import { InvalidatedRefreshTokenError } from '../errors/invalidated-refresh-token.error';

@Injectable()
export class RefreshTokensIdsStorage {
  constructor(private readonly redisService: RedisService) {}

  async insert(userId: string, tokenId: string): Promise<void> {
    await this.redisService.insert(this.getKey(userId), tokenId);
  }

  async validate(userId: string, tokenId: string): Promise<boolean> {
    const storedTokenId = await this.redisService.get(this.getKey(userId));

    if (storedTokenId !== tokenId) {
      throw new InvalidatedRefreshTokenError();
    }

    return storedTokenId === tokenId;
  }

  async invalidate(userId: string): Promise<void> {
    await this.redisService.delete(this.getKey(userId));
  }

  private getKey(userId: string): string {
    return `user-${userId}`;
  }
}
