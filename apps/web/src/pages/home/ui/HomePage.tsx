import { Loader } from '@mantine/core';
import { useHead } from '@unhead/react';
import { observer } from 'mobx-react-lite';
import { useEffect } from 'react';

import { StoreKey, useStore, useStores } from '@/app/store';

import { HomeOverview } from './HomeOverview';
import classes from './HomePage.module.css';
import { LandingContent } from './LandingContent';

export const HomePage = observer(() => {
  useHead({ title: 'Online Resume' });
  const sessionStore = useStore(StoreKey.Session);
  const { errors, requests, resumes } = useStores(
    StoreKey.Errors,
    StoreKey.Requests,
    StoreKey.Resumes,
  );

  useEffect(() => {
    if (sessionStore.ready && sessionStore.user) {
      void resumes.loadOverview();
    }
  }, [resumes, sessionStore.ready, sessionStore.user]);

  return (
    <main className={classes.page}>
      {!sessionStore.ready ? (
        <section className={classes.content}>
          <div className={classes.loading} role="status">
            <Loader size="sm" /> Проверяем вход…
          </div>
        </section>
      ) : sessionStore.user ? (
        <HomeOverview
          error={errors.forOperation('resumes.overview') ? 'Не удалось загрузить резюме.' : null}
          loading={!resumes.overview || requests.latest('resumes.overview')?.status === 'pending'}
          overview={resumes.overview}
        />
      ) : (
        <LandingContent />
      )}
    </main>
  );
});
