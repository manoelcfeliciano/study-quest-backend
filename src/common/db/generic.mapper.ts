export abstract class Mapper<D, P, T = unknown> {
  abstract toDomain(persistanceObject: P): D;
  abstract toDto(persistanceObject: D): T;
  abstract toPersistence(domainObject: D): P;
}
