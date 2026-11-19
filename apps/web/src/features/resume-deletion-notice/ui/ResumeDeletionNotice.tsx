import { Alert, Container, Text } from '@mantine/core';
import { observer } from 'mobx-react-lite';
import { useEffect } from 'react';

import { StoreKey, useStores } from '@/app/store';

export const ResumeDeletionNotice = observer(() => {
  const { resumes, session } = useStores(StoreKey.Resumes, StoreKey.Session);

  useEffect(() => {
    resumes.clearDeletionNotices();
    if (session.user) {
      void resumes.loadDeletionNotices();
    }
  }, [resumes, session.user?.id]);

  if (!session.user || resumes.deletionNotices.length === 0) {
    return null;
  }

  return (
    <Container size="xl" mt="md">
      <Alert
        color="yellow"
        title="Публичные ссылки больше не работают"
        withCloseButton
        onClose={() => void resumes.dismissDeletionNotices()}
      >
        <Text size="sm">
          Удалённые опубликованные резюме недоступны по прежним ссылкам. Замените ссылки во внешних
          ресурсах. Данные будут окончательно удалены через 30 дней.
        </Text>
        <Text size="sm" mt="xs">
          {resumes.deletionNotices.map((notice) => notice.title).join(', ')}
        </Text>
      </Alert>
    </Container>
  );
});
