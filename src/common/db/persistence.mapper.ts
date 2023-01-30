export abstract class PersistenceMapper<D, P, I = unknown, R = unknown> {
  abstract toDomain(persistanceObject: P): D;
  abstract toInputDto(persistanceObject: P): I;
  abstract toResponseDto(persistanceObject: P): R;
}
