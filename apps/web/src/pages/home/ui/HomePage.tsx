import { Loader } from '@mantine/core';
import { useHead } from '@unhead/react';
import { observer } from 'mobx-react-lite';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router';

import { StoreKey, useStore, useStores } from '@/app/store';
import { ResumeDeleteDialog } from '@/features/resume-delete';
import type { ResumeOverviewDto, ResumeSummaryDto } from '@/shared/api/generated/types.gen';

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
  const [scheduleError, setScheduleError] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedResumeId = searchParams.get('resumeId');
  const refreshOverview = () => void resumes.loadOverview(selectedResumeId);
  const cancelSchedule = async (item: ResumeOverviewDto['scheduledLinks'][number]) => {
    const changed =
      item.kind === 'unpublish'
        ? await resumes.cancelUnpublish(item.id)
        : await resumes.cancelDelete(item.id);
    if (changed) {
      setScheduleError(false);
      refreshOverview();
    } else setScheduleError(true);
  };
  const revokeLink = async (item: ResumeOverviewDto['scheduledLinks'][number]) => {
    if (await resumes.unpublish(item.id)) {
      setScheduleError(false);
      refreshOverview();
    } else setScheduleError(true);
  };

  const selectResume = (resumeId: string | null) => {
    setSearchParams((previous) => {
      const next = new URLSearchParams(previous);
      if (resumeId) {
        next.set('resumeId', resumeId);
      } else {
        next.delete('resumeId');
      }
      return next;
    });
  };

  useEffect(() => {
    if (sessionStore.ready && sessionStore.user) {
      void resumes.loadOverview(selectedResumeId);
    }
  }, [resumes, selectedResumeId, sessionStore.ready, sessionStore.user]);

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
          selectedResumeId={selectedResumeId}
          onSelectResume={selectResume}
          onDelete={setSelectedForDeletion}
          deleteDisabled={requests.latest('resumes.remove')?.status === 'pending'}
          onCancelSchedule={(item) => void cancelSchedule(item)}
          onRevokeLink={(item) => void revokeLink(item)}
          scheduleError={scheduleError}
        />
      ) : (
        <LandingContent />
      )}
      <ResumeDeleteDialog
        resume={selectedForDeletion}
        onClose={() => setSelectedForDeletion(null)}
        onDeleted={(immediate) => {
          if (immediate && selectedForDeletion?.id === selectedResumeId) {
            selectResume(null);
          } else {
            void resumes.loadOverview(selectedResumeId);
          }
        }}
      />
    </main>
  );
});
