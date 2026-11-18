import { Alert, Button, Loader } from '@mantine/core';
import { useHead } from '@unhead/react';
import { observer } from 'mobx-react-lite';
import { useState } from 'react';
import { Link } from 'react-router';

import { StoreKey, useStore } from '@/app/store';

import classes from './HomePage.module.css';
import { LandingContent } from './LandingContent';

export const HomePage = observer(() => {
  useHead({ title: 'Online Resume' });
  const sessionStore = useStore(StoreKey.Session);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [logoutError, setLogoutError] = useState<string | null>(null);

  const logout = async () => {
    setIsLoggingOut(true);
    setLogoutError(null);
    try {
      await sessionStore.logout();
    } catch {
      setLogoutError('Не удалось выйти. Проверьте соединение и попробуйте ещё раз');
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <main className={classes.page}>
      <header className={classes.header}>
        <Link className={classes.brand} to="/" aria-label="Online Resume — на главную">
          <img src="/rsbuild-logo.svg" alt="" width="32" height="32" />
          Online Resume
        </Link>
        {sessionStore.user ? (
          <nav className={classes.navigation} aria-label="Навигация пользователя">
            <Link to="/templates">Шаблоны</Link>
            <Link to="/resumes">Мои резюме</Link>
            <Button variant="subtle" loading={isLoggingOut} onClick={() => void logout()}>
              Выйти
            </Button>
          </nav>
        ) : (
          <nav className={classes.navigation} aria-label="Основная навигация">
            <a className={classes.featuresLink} href="#features">
              Возможности
            </a>
            <Link to="/auth/login">Войти</Link>
            <Button component={Link} to="/auth/register" radius="sm">
              Создать аккаунт
            </Button>
          </nav>
        )}
      </header>

      {!sessionStore.ready ? (
        <section className={classes.content}>
          <div className={classes.loading} role="status">
            <Loader size="sm" /> Проверяем вход…
          </div>
        </section>
      ) : sessionStore.user ? (
        <section className={classes.content}>
          <p className={classes.eyebrow}>Ваш аккаунт</p>
          <h1>Здравствуйте, {sessionStore.user.firstName}</h1>
          <p className={classes.description}>Вы вошли как {sessionStore.user.email}.</p>
          {logoutError ? (
            <Alert color="red" role="alert">
              {logoutError}
            </Alert>
          ) : null}
        </section>
      ) : (
        <LandingContent />
      )}
    </main>
  );
});
