import { randomUUID } from 'node:crypto';

import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';

import { createHttpTestingApp } from '../../../../test/create-http-testing-app';
import type { CreateUserDto } from '../../../users/dto/create-user.dto';
import { createRegistrationFixture } from './registration.fixture';

let app: Awaited<ReturnType<typeof createHttpTestingApp>>;
let fixture: Awaited<ReturnType<typeof createRegistrationFixture>>;

beforeAll(async () => {
  app = await createHttpTestingApp();
});

beforeEach(async () => {
  fixture = await createRegistrationFixture(app);
  return fixture.cleanup;
});

afterAll(async () => {
  await app?.close();
});

describe('Ожидаемое поведение', () => {
  it('сохраняет аккаунт и позволяет войти', async () => {
    // Arrange
    const { input, register, login, findUser } = fixture;

    // Act
    const registration = await register(input);
    const session = await login();
    const user = await findUser(input.email);

    // Assert
    expect(registration.status).toBe(201);
    expect(session.status).toBe(200);
    expect(user).toMatchObject({
      email: input.email,
      firstName: input.firstName,
      lastName: input.lastName,
    });
    expect(await registration.json()).toMatchObject({ user });
    expect(await session.json()).toMatchObject({ user });
  });
});

describe('Попытки сломать регистрацию', () => {
  it('отклоняет email без домена и принимает исправление', async () => {
    // Arrange
    const { input, invalidEmail, register, findUser } = fixture;
    const invalidInput: CreateUserDto = { ...input, email: invalidEmail };

    // Act
    const rejected = await register(invalidInput);
    const rejectedUser = await findUser(invalidEmail);
    const accepted = await register(input);

    // Assert
    expect(rejected.status).toBe(400);
    expect(rejectedUser).toBeNull();
    expect(accepted.status).toBe(201);
  });

  it('отклоняет повторный email и сохраняет исходный аккаунт', async () => {
    // Arrange
    const { input, register, login } = fixture;
    const firstRegistration = await register(input);
    expect(firstRegistration.status).toBe(201);
    const duplicate: CreateUserDto = { ...input, firstName: 'Мария', password: randomUUID() };

    // Act
    const rejected = await register(duplicate);
    const session = await login();

    // Assert
    expect(rejected.status).toBe(409);
    expect(session.status).toBe(200);
    expect(await session.json()).toMatchObject({
      user: { email: input.email, firstName: input.firstName },
    });
  });
});
