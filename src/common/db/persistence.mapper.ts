export abstract class PersistenceMapper<D, P, I = unknown, R = unknown> {
  abstract toDomain(persistanceObject: P): D;
  abstract toInputDto(persistanceObject: D): I;
  abstract toResponseDto(persistanceObject: D): R;
}
