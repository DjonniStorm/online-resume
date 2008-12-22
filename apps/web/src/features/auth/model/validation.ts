import { zCreateUserDto, zLoginDto } from '@/shared/api/generated/zod.gen';

export function validateEmail(value: string): string | null {
  if (!value.trim()) {
    return 'Введите email';
  }
  return zLoginDto.shape.email.safeParse(value.trim()).success ? null : 'Введите корректный email';
}

export function validatePassword(value: string): string | null {
  if (!value) {
    return 'Введите пароль';
  }
  return zLoginDto.shape.password.safeParse(value).success
    ? null
    : 'Пароль должен содержать от 8 до 128 символов';
}

export function validateName(value: string): string | null {
  if (!value.trim()) {
    return 'Заполните поле';
  }
  return zCreateUserDto.shape.firstName.safeParse(value.trim()).success
    ? null
    : 'Не более 100 символов';
}
