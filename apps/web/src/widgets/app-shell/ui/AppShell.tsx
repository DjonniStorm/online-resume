import { Alert, Button, Container, Group } from '@mantine/core';
import { observer } from 'mobx-react-lite';
import { Link, NavLink, Outlet } from 'react-router';

import { StoreKey, useStores } from '@/app/store';
import { ResumeDeletionNotice } from '@/features/resume-deletion-notice';
import { ApiOperation } from '@/shared/api';

import styles from './AppShell.module.css';

export const AppShell = observer(() => {
  const { errors, requests, session } = useStores(
    StoreKey.Errors,
    StoreKey.Requests,
    StoreKey.Session,
  );
  const loggingOut = requests.latest(ApiOperation.SessionLogout)?.status === 'pending';
  const logoutError = errors.forOperation(ApiOperation.SessionLogout);

  const logout = async () => {
    try {
      await session.logout();
      window.location.reload();
    } catch {
      return;
    }
  };

  return (
    <div className={styles.shell}>
      <header className={styles.header}>
        <Container size="xl" className={styles.headerInner}>
          <Link className={styles.brand} to="/" aria-label="На главную">
            <img src="/rsbuild-logo.svg" alt="" width="36" height="36" />
          </Link>
          <nav className={styles.navigation} aria-label="Основная навигация">
            <NavLink
              to="/templates"
              className={({ isActive }) => (isActive ? styles.active : styles.link)}
            >
              Шаблоны
            </NavLink>
            {session.user ? (
              <NavLink
                to="/resumes"
                className={({ isActive }) => (isActive ? styles.active : styles.link)}
              >
                Мои резюме
              </NavLink>
            ) : null}
          </nav>
          <Group gap="xs" className={styles.actions}>
            {session.user ? (
              <Button variant="subtle" size="sm" loading={loggingOut} onClick={() => void logout()}>
                Выйти
              </Button>
            ) : (
              <>
                <Button component={Link} to="/auth/login" variant="subtle" size="sm">
                  Войти
                </Button>
                <Button component={Link} to="/auth/register" size="sm">
                  Регистрация
                </Button>
              </>
            )}
          </Group>
        </Container>
      </header>
      {logoutError ? (
        <Container size="xl" mt="sm">
          <Alert color="red" role="alert">
            Не удалось выйти. Попробуйте ещё раз.
          </Alert>
        </Container>
      ) : null}
      <ResumeDeletionNotice />
      <Outlet />
    </div>
  );
});
