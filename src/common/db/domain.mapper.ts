export abstract class DomainMapper<D, P, I = unknown, R = unknown> {
  abstract toInputDto(domainObject: D): I;
  abstract toResponseDto(domainObject: D): R;
  abstract toPersistence(domainObject: D): P;
}
