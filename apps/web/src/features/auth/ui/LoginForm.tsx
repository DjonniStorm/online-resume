import { Alert, Button, PasswordInput, TextInput } from '@mantine/core';
import { useForm } from '@mantine/form';
import { observer } from 'mobx-react-lite';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router';

import type { SessionStore } from '@/entities/session/model/session-store';
import { zLoginDto } from '@/shared/api/generated/zod.gen';

import { validateEmail, validatePassword } from '../model/validation';
import classes from './AuthForm.module.css';

type LoginFields = {
  email: string;
  password: string;
};

export const LoginForm = observer(({ sessionStore }: { sessionStore: SessionStore }) => {
  const navigate = useNavigate();
  const [validationError, setValidationError] = useState<string | null>(null);
  const form = useForm<LoginFields>({
    initialValues: { email: '', password: '' },
    validateInputOnBlur: true,
    validate: {
      email: validateEmail,
      password: validatePassword,
    },
  });

  const onSubmit = async (fields: LoginFields) => {
    setValidationError(null);
    const parsed = zLoginDto.safeParse({
      email: fields.email.trim().toLowerCase(),
      password: fields.password,
    });
    if (!parsed.success) {
      setValidationError('Проверьте введённые данные');
      return;
    }

    const success = await sessionStore.login(parsed.data);
    if (success) {
      void navigate('/', { replace: true });
    }
  };

  return (
    <>
      <h1 className={classes.heading}>С возвращением</h1>
      <p className={classes.subtitle}>Войдите, чтобы продолжить работу над резюме.</p>

      <form className={classes.form} onSubmit={form.onSubmit(onSubmit)} noValidate>
        <TextInput
          label="Email"
          type="email"
          autoComplete="email"
          placeholder="name@example.com"
          error={form.errors.email}
          {...form.getInputProps('email')}
        />
        <PasswordInput
          label="Пароль"
          autoComplete="current-password"
          error={form.errors.password}
          {...form.getInputProps('password')}
        />
        {validationError || sessionStore.loginError ? (
          <Alert color="red" role="alert">
            {validationError ?? sessionStore.loginError}
          </Alert>
        ) : null}
        <Button
          className={classes.submit}
          type="submit"
          size="md"
          loading={sessionStore.loginLoading}
          disabled={!sessionStore.ready}
          fullWidth
        >
          Войти
        </Button>
      </form>

      <p className={classes.switch}>
        Нет аккаунта? <Link to="/auth/register">Зарегистрироваться</Link>
      </p>
    </>
  );
});
