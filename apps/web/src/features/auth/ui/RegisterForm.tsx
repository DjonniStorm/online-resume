import { Alert, Button, PasswordInput, TextInput } from '@mantine/core';
import { useForm } from '@mantine/form';
import { observer } from 'mobx-react-lite';
import { useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router';

import type { SessionStore } from '@/entities/session/model/session-store';
import { zCreateUserDto } from '@/shared/api/generated/zod.gen';

import { validateEmail, validateName, validatePassword } from '../model/validation';
import classes from './AuthForm.module.css';

type RegisterFields = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
};

export const RegisterForm = observer(({ sessionStore }: { sessionStore: SessionStore }) => {
  const navigate = useNavigate();
  const [validationError, setValidationError] = useState<string | null>(null);
  const attemptedEmail = useRef<string | null>(null);
  const form = useForm<RegisterFields>({
    initialValues: {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
    validateInputOnBlur: true,
    validate: {
      firstName: validateName,
      lastName: validateName,
      email: validateEmail,
      password: validatePassword,
      confirmPassword: (value, values) =>
        value === values.password ? null : 'Пароли не совпадают',
    },
  });

  const onSubmit = async (fields: RegisterFields) => {
    setValidationError(null);
    const parsed = zCreateUserDto.safeParse({
      firstName: fields.firstName.trim(),
      lastName: fields.lastName.trim(),
      email: fields.email.trim().toLowerCase(),
      password: fields.password,
    });
    if (!parsed.success) {
      setValidationError('Проверьте введённые данные');
      return;
    }

    attemptedEmail.current = parsed.data.email;
    const success = await sessionStore.register(parsed.data);
    if (success) {
      void navigate('/', { replace: true });
    }
  };

  const email = form.values.email;
  const hasDuplicateEmail =
    sessionStore.registerStatus === 409 && attemptedEmail.current === email.trim().toLowerCase();

  return (
    <>
      <h1 className={classes.heading}>Создать аккаунт</h1>
      <p className={classes.subtitle}>Укажите данные для входа. Имя появится в вашем профиле.</p>

      <form className={classes.form} onSubmit={form.onSubmit(onSubmit)} noValidate>
        <div className={classes.nameRow}>
          <TextInput
            label="Имя"
            autoComplete="given-name"
            error={form.errors.firstName}
            {...form.getInputProps('firstName')}
          />
          <TextInput
            label="Фамилия"
            autoComplete="family-name"
            error={form.errors.lastName}
            {...form.getInputProps('lastName')}
          />
        </div>
        <TextInput
          label="Email"
          type="email"
          autoComplete="email"
          placeholder="name@example.com"
          {...form.getInputProps('email')}
          error={
            form.errors.email ??
            (hasDuplicateEmail ? 'Аккаунт с таким email уже существует' : undefined)
          }
        />
        <PasswordInput
          label="Пароль"
          description="От 8 до 128 символов"
          autoComplete="new-password"
          error={form.errors.password}
          {...form.getInputProps('password')}
        />
        <PasswordInput
          label="Повторите пароль"
          autoComplete="new-password"
          error={form.errors.confirmPassword}
          {...form.getInputProps('confirmPassword')}
        />
        {validationError || sessionStore.registerError ? (
          <Alert color="red" role="alert">
            {validationError ?? sessionStore.registerError}
          </Alert>
        ) : null}
        <Button
          className={classes.submit}
          type="submit"
          size="md"
          loading={sessionStore.registerLoading}
          disabled={!sessionStore.ready}
          fullWidth
        >
          Создать аккаунт
        </Button>
      </form>

      <p className={classes.switch}>
        Уже есть аккаунт? <Link to="/auth/login">Войти</Link>
      </p>
    </>
  );
});
