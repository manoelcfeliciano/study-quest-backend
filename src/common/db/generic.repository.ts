export abstract class Repository<T> {
  abstract create(data: unknown): Promise<T>;
  abstract update(id: string, item: unknown): Promise<T>;
  abstract delete(id: string): Promise<void>;
  abstract findOne(id: string): Promise<T>;
  abstract findOneBy(
    options: Partial<{
      [P in keyof T]: T[P];
    }>,
  ): Promise<T>;
}
