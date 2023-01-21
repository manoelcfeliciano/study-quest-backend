import { faker } from '@faker-js/faker';
import { UserEntity } from 'src/users/entities/user.entity';

export const makeFakeUser = (payload?: Partial<UserEntity>): UserEntity => {
  return {
    name: faker.name.fullName(),
    email: faker.internet.email(),
    password: faker.internet.password(),
    loginAttempts: faker.datatype.number(),
    role: faker.helpers.arrayElement(['student', 'teacher']),
    createdAt: faker.date.past(),
    updatedAt: faker.date.recent(),
    ...payload,
  };
};
