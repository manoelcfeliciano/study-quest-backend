export abstract class HashingService {
  abstract hash(data: string | Buffer): Promise<string>;
  abstract compare(input: string | Buffer, hashed: string): Promise<boolean>;
}
