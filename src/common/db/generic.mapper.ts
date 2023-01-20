export abstract class Mapper<D, P> {
  abstract toDomain(persistanceObject: P): D;
  abstract toPersistence(domainObject: D): P;
}
