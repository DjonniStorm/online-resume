import { Loader } from '@mantine/core';
import { useHead } from '@unhead/react';
import { observer } from 'mobx-react-lite';

import { StoreKey, useStore } from '@/app/store';

import classes from './HomePage.module.css';
import { LandingContent } from './LandingContent';

export const HomePage = observer(() => {
  useHead({ title: 'Online Resume' });
  const sessionStore = useStore(StoreKey.Session);
  return (
    <main className={classes.page}>
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
        </section>
      ) : (
        <LandingContent />
      )}
    </main>
  );
});
