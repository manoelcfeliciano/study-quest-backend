export abstract class GenericRepository<T> {
  abstract create(data: T): Promise<T>;
  abstract update(id: string, item: Partial<T>): Promise<T>;
  abstract delete(id: string): void;
  abstract findOne(id: string): Promise<T>;
  abstract findOneBy(options: {
    [P in keyof T]: T[P];
  }): Promise<T>;
}
