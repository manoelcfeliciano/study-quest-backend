import * as bcrypt from 'bcrypt';
import { Test, TestingModule } from '@nestjs/testing';
import { BcryptService } from './bcrypt.service';

const salt = 12;

describe('BcryptService', () => {
  let sut: BcryptService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [BcryptService],
    }).compile();

    sut = module.get<BcryptService>(BcryptService);
  });

  it('should be defined', () => {
    expect(sut).toBeDefined();
  });

  describe('hash()', () => {
    it('should call hash with correct values', async () => {
      const hashSpy = jest.spyOn(bcrypt, 'hash');

      await sut.hash('any_value');

      expect(hashSpy).toHaveBeenCalledWith('any_value', salt);
    });

    it('should return a valid hash', async () => {
      jest.spyOn(bcrypt, 'hash').mockImplementation(() => {
        return Promise.resolve('hash');
      });

      const hash = await sut.hash('any_value');

      expect(hash).toBe('hash');
    });

    it('should throw if hash throws', async () => {
      jest.spyOn(bcrypt, 'hash').mockImplementation(() => {
        return Promise.reject(new Error());
      });

      const promise = sut.hash('any_value');

      expect(promise).rejects.toThrow();
    });
  });

  describe('compare()', () => {
    it('should call compare with correct values', async () => {
      const compareSpy = jest.spyOn(bcrypt, 'compare');

      await sut.compare('any_value', 'hashed_value');

      expect(compareSpy).toHaveBeenCalledWith('any_value', 'hashed_value');
    });

    it('should return true when succeeds', async () => {
      jest.spyOn(bcrypt, 'compare').mockImplementation(() => {
        return Promise.resolve(true);
      });

      const compare = await sut.compare('correct_value', 'hashed_value');

      expect(compare).toBe(true);
    });

    it('should return true when fails', async () => {
      jest.spyOn(bcrypt, 'compare').mockImplementation(() => {
        return Promise.resolve(false);
      });

      const compare = await sut.compare('wrong_value', 'hashed_value');

      expect(compare).toBe(false);
    });

    it('should throw if compare throws', async () => {
      jest.spyOn(bcrypt, 'compare').mockImplementation(() => {
        return Promise.reject(new Error());
      });

      const promise = sut.compare('any_value', 'hashed_value');

      expect(promise).rejects.toThrow();
    });
  });
});
