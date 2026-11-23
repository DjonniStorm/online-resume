import { Alert, Button, Group, Modal, Stack, Text } from '@mantine/core';
import { observer } from 'mobx-react-lite';

import { StoreKey, useStores } from '@/app/store';
import type { ResumeSummaryDto } from '@/shared/api/generated/types.gen';

type ResumeDeleteDialogProps = {
  resume: ResumeSummaryDto | null;
  onClose: () => void;
  onDeleted?: () => void;
};

export const ResumeDeleteDialog = observer(
  ({ resume, onClose, onDeleted }: ResumeDeleteDialogProps) => {
    const { requests, errors, resumes } = useStores(
      StoreKey.Requests,
      StoreKey.Errors,
      StoreKey.Resumes,
    );
    const pending = requests.latest('resumes.remove')?.status === 'pending';

    const remove = async () => {
      if (resume && (await resumes.remove(resume.id))) {
        onClose();
        onDeleted?.();
      }
    };

    return (
      <Modal opened={resume !== null} onClose={onClose} title="Удалить резюме?" centered>
        <Stack gap="md">
          <Text size="sm">
            «{resume?.title}» исчезнет из списка и будет окончательно удалено через 30 дней.
          </Text>
          {resume?.isPublished ? (
            <Alert color="yellow">
              Публичная ссылка перестанет работать сразу. Если вы разместили её на других сайтах,
              замените или удалите её там.
            </Alert>
          ) : null}
          {errors.forOperation('resumes.remove') ? (
            <Alert color="red">Не удалось удалить резюме. Попробуйте ещё раз.</Alert>
          ) : null}
          <Group justify="flex-end">
            <Button variant="subtle" disabled={pending} onClick={onClose}>
              Отмена
            </Button>
            <Button color="red" loading={pending} onClick={() => void remove()}>
              Удалить резюме
            </Button>
          </Group>
        </Stack>
      </Modal>
    );
  },
);
