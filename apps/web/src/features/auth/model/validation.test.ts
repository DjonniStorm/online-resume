import { describe, expect, it } from 'vitest';

import { validateEmail } from './validation';

describe('Ожидаемое поведение', () => {
  it('принимает email с пробелами по краям', () => {
    // Arrange
    const email: string = '  anna@example.com  ';

    // Act
    const error = validateEmail(email);

    // Assert
    expect(error).toBeNull();
  });
});

describe('Попытки сломать валидацию', () => {
  it('отклоняет email без домена', () => {
    // Arrange
    const email: string = 'anna@';

    // Act
    const error = validateEmail(email);

    // Assert
    expect(error).toBe('Введите корректный email');
  });
});
