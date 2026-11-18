import {
  Alert,
  Badge,
  Button,
  Card,
  Container,
  Group,
  Loader,
  SimpleGrid,
  Stack,
  Text,
  Title,
} from '@mantine/core';
import { useHead } from '@unhead/react';
import { observer } from 'mobx-react-lite';
import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router';

import { StoreKey, useStores } from '@/app/store';

export const ResumesPage = observer(() => {
  useHead({ title: 'Мои резюме — Online Resume' });
  const { requests, errors, session, resumes } = useStores(
    StoreKey.Requests,
    StoreKey.Errors,
    StoreKey.Session,
    StoreKey.Resumes,
  );
  const navigate = useNavigate();

  useEffect(() => {
    if (session.ready && !session.user) {
      navigate('/auth/login');
      return;
    }
    if (!session.user) {
      return;
    }
    void resumes.load();
  }, [navigate, resumes, session.ready, session.user]);

  if (!session.ready || !session.user) {
    return (
      <Container size="lg" py="xl">
        <Group justify="center">
          <Loader size="sm" />
        </Group>
      </Container>
    );
  }

  return (
    <Container size="lg" py="xl">
      <Stack gap="xl">
        <Group justify="space-between" align="flex-end">
          <Stack gap={4}>
            <Text size="sm" c="dimmed">
              Ваши документы
            </Text>
            <Title order={1}>Мои резюме</Title>
          </Stack>
          <Group>
            <Button component={Link} to="/templates" variant="light">
              Выбрать шаблон
            </Button>
            <Button component={Link} to="/" variant="subtle">
              На главную
            </Button>
          </Group>
        </Group>

        {requests.latest('resumes.list')?.status === 'pending' ? (
          <Group justify="center">
            <Loader size="sm" />
          </Group>
        ) : null}
        {errors.forOperation('resumes.list') ? (
          <Alert color="red" title="Не удалось загрузить резюме">
            <Button variant="light" color="red" mt="sm" onClick={() => void resumes.reload()}>
              Повторить
            </Button>
          </Alert>
        ) : null}
        {requests.latest('resumes.list')?.status === 'success' && resumes.resumes.length === 0 ? (
          <Alert title="Резюме ещё нет">
            Выберите шаблон и заполните обязательные поля, чтобы создать первое резюме.
          </Alert>
        ) : null}

        {resumes.resumes.length > 0 ? (
          <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="lg">
            {resumes.resumes.map((resume) => (
              <Card key={resume.id} withBorder shadow="sm" radius="md">
                <Stack gap="sm">
                  <Group justify="space-between" align="flex-start">
                    <Stack gap={2}>
                      <Title order={3} size="h4">
                        {resume.title}
                      </Title>
                      <Text size="sm" c="dimmed">
                        {resume.firstName} {resume.lastName}
                      </Text>
                    </Stack>
                    <Badge variant="light">{resume.template.name}</Badge>
                  </Group>
                  <Text size="xs" c="dimmed">
                    Обновлено: {formatDate(resume.updatedAt)}
                  </Text>
                  <Group justify="flex-end">
                    <Button
                      variant="subtle"
                      color="red"
                      loading={requests.latest('resumes.remove')?.status === 'pending'}
                      onClick={() => void removeResume(resume.id, (id) => resumes.remove(id))}
                    >
                      Удалить
                    </Button>
                  </Group>
                </Stack>
              </Card>
            ))}
          </SimpleGrid>
        ) : null}
        {errors.forOperation('resumes.remove') ? (
          <Alert color="red">Не удалось удалить резюме. Попробуйте ещё раз.</Alert>
        ) : null}
      </Stack>
    </Container>
  );
});

async function removeResume(id: string, remove: (id: string) => Promise<boolean>) {
  if (!window.confirm('Удалить это резюме?')) {
    return;
  }
  await remove(id);
}

function formatDate(value: string): string {
  return new Intl.DateTimeFormat('ru-RU', {
    dateStyle: 'medium',
  }).format(new Date(value));
}
