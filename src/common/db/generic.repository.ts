export abstract class GenericRepository<I, O> {
  abstract create(data: I): Promise<O>;
  abstract update(id: string, item: Partial<I>): Promise<O>;
  abstract delete(id: string): Promise<void>;
  abstract findOne(id: string): Promise<O>;
  abstract findOneBy(options: {
    [P in keyof I]: I[P];
  }): Promise<O>;
}
