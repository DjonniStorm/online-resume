import { Loader } from '@mantine/core';
import { useHead } from '@unhead/react';
import { observer } from 'mobx-react-lite';
import { useEffect, useState } from 'react';

import { StoreKey, useStore, useStores } from '@/app/store';
import { ResumeDeleteDialog } from '@/features/resume-delete';
import type { ResumeSummaryDto } from '@/shared/api/generated/types.gen';

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
  const [selectedForDeletion, setSelectedForDeletion] = useState<ResumeSummaryDto | null>(null);

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
          onDelete={setSelectedForDeletion}
          deleteDisabled={requests.latest('resumes.remove')?.status === 'pending'}
        />
      ) : (
        <LandingContent />
      )}
      <ResumeDeleteDialog
        resume={selectedForDeletion}
        onClose={() => setSelectedForDeletion(null)}
        onDeleted={() => void resumes.loadOverview()}
      />
    </main>
  );
});
