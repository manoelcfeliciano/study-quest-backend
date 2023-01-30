import { createMock } from '@golevelup/ts-jest';
import { Test, TestingModule } from '@nestjs/testing';
import { RedisModule } from 'src/common/db/redis/redis.module';
import { RedisService } from 'src/common/db/redis/redis.service';
import { InvalidatedRefreshTokenError } from '../errors/invalidated-refresh-token.error';
import { RefreshTokensIdsStorage } from './refresh-tokens-ids.storage';

describe('RefreshTokensIdsStorage', () => {
  let sut: RefreshTokensIdsStorage;
  let redisService: RedisService;

  beforeEach(async () => {
    redisService = createMock<RedisService>();
    const module: TestingModule = await Test.createTestingModule({
      imports: [RedisModule],
      providers: [
        { provide: RedisService, useValue: redisService },
        RefreshTokensIdsStorage,
      ],
    }).compile();

    sut = module.get<RefreshTokensIdsStorage>(RefreshTokensIdsStorage);
  });

  it('should be defined', () => {
    expect(sut).toBeDefined();
  });

  describe('insert()', () => {
    it('should be able to insert a token', async () => {
      const fakeUserId = '1';
      const fakeToken = 'token';

      const insertSpy = jest.spyOn(redisService, 'insert');

      await sut.insert(fakeUserId, fakeToken);

      expect(insertSpy).toHaveBeenCalledWith(`user-${fakeUserId}`, fakeToken);
    });
  });

  describe('invalidate()', () => {
    it('should be able to remove a token', async () => {
      const fakeUserId = '1';

      const deleteSpy = jest.spyOn(redisService, 'delete');

      await sut.invalidate(fakeUserId);

      expect(deleteSpy).toHaveBeenCalledWith(`user-${fakeUserId}`);
    });
  });

  describe('validate()', () => {
    it('should return true when stored token is equal to received one', async () => {
      jest.spyOn(redisService, 'get').mockResolvedValue('token');

      const response = await sut.validate('1', 'token');

      expect(response).toBe(true);
    });

    it('should throw an error when stored token is different from received one', async () => {
      jest.spyOn(redisService, 'get').mockResolvedValue('token');

      const promise = sut.validate('1', 'token2');

      expect(promise).rejects.toThrowError(new InvalidatedRefreshTokenError());
    });
  });
});
