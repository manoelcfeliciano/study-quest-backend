import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { HashingService } from '../../hashing.service';

@Injectable()
export class BcryptService implements HashingService {
  hash(data: string | Buffer): Promise<string> {
    const salt = 12;
    return bcrypt.hash(data, salt);
  }
  compare(input: string | Buffer, hashed: string): Promise<boolean> {
    return bcrypt.compare(input, hashed);
  }
}
