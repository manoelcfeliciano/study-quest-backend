export type FindOneByOptions<T> = { [P in keyof T]: T[P] };
