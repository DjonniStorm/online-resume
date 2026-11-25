import { Alert, Button, Group, Modal, Stack, Text } from '@mantine/core';
import { observer } from 'mobx-react-lite';

import { StoreKey, useStores } from '@/app/store';
import { ApiOperation } from '@/shared/api';
import type { ResumeSummaryDto } from '@/shared/api/generated/types.gen';

type ResumeDeleteDialogProps = {
  resume: ResumeSummaryDto | null;
  onClose: () => void;
  onDeleted?: (immediate: boolean) => void;
};

export const ResumeDeleteDialog = observer(
  ({ resume, onClose, onDeleted }: ResumeDeleteDialogProps) => {
    const { requests, errors, resumes } = useStores(
      StoreKey.Requests,
      StoreKey.Errors,
      StoreKey.Resumes,
    );
    const pending =
      requests.latest(ApiOperation.ResumesRemove)?.status === 'pending' ||
      requests.latest(ApiOperation.ResumesScheduleDelete)?.status === 'pending' ||
      requests.latest(ApiOperation.ResumesCancelDelete)?.status === 'pending';

    const remove = async () => {
      if (resume && (await resumes.remove(resume.id))) {
        onClose();
        onDeleted?.(true);
      }
    };

    const schedule = async () => {
      if (resume && (await resumes.scheduleDelete(resume.id))) {
        onClose();
        onDeleted?.(false);
      }
    };

    const cancel = async () => {
      if (resume && (await resumes.cancelDelete(resume.id))) {
        onClose();
        onDeleted?.(false);
      }
    };

    return (
      <Modal opened={resume !== null} onClose={onClose} title="Удалить резюме?" centered>
        <Stack gap="md">
          <Text size="sm">
            {resume?.deletionScheduledAt
              ? `Удаление «${resume.title}» запланировано на ${new Intl.DateTimeFormat('ru-RU', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(resume.deletionScheduledAt))}. До этого срока публичная ссылка остаётся доступной.`
              : `«${resume?.title}» останется доступным ещё 3 дня. После этого ссылка отключится, а данные будут окончательно удалены через 30 дней.`}
          </Text>
          {resume?.isPublished ? (
            <Alert color="yellow">
              Вы можете заменить ссылку на внешних сайтах в течение 3 дней или отключить её сразу.
            </Alert>
          ) : null}
          {errors.forOperation(ApiOperation.ResumesRemove) ||
          errors.forOperation(ApiOperation.ResumesScheduleDelete) ||
          errors.forOperation(ApiOperation.ResumesCancelDelete) ? (
            <Alert color="red">Не удалось удалить резюме. Попробуйте ещё раз.</Alert>
          ) : null}
          <Group justify="flex-end">
            <Button variant="subtle" disabled={pending} onClick={onClose}>
              Отмена
            </Button>
            {resume?.deletionScheduledAt ? (
              <Button variant="light" onClick={() => void cancel()}>
                Отменить удаление
              </Button>
            ) : (
              <Button color="red" variant="light" loading={pending} onClick={() => void schedule()}>
                Удалить через 3 дня
              </Button>
            )}
            <Button color="red" loading={pending} onClick={() => void remove()}>
              Удалить сейчас
            </Button>
          </Group>
        </Stack>
      </Modal>
    );
  },
);
