export abstract class Repository<I, O> {
  abstract create(data: unknown): Promise<O>;
  abstract update(id: string, item: unknown): Promise<O>;
  abstract delete(id: string): Promise<void>;
  abstract findOne(id: string): Promise<O>;
  abstract findOneBy(options: {
    [P in keyof I]: I[P];
  }): Promise<O>;
}
