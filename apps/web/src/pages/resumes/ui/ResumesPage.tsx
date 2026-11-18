import {
  ActionIcon,
  Alert,
  Badge,
  Button,
  Card,
  Container,
  Group,
  Loader,
  Menu,
  Pagination,
  Select,
  SimpleGrid,
  Stack,
  Text,
  TextInput,
  Title,
} from '@mantine/core';
import { useHead } from '@unhead/react';
import { observer } from 'mobx-react-lite';
import { useEffect, useState } from 'react';
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
  const [search, setSearch] = useState('');

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
    <Container size="xl" py={{ base: 'lg', sm: 'xl' }}>
      <Stack gap="xl">
        <Group justify="space-between" align="flex-end" gap="md">
          <Stack gap={2}>
            <Title order={1}>Мои резюме</Title>
            {requests.latest('resumes.list')?.status === 'success' ? (
              <Text size="sm" c="dimmed">
                Всего: {resumes.total}
              </Text>
            ) : null}
          </Stack>
          <Button component={Link} to="/templates">
            Создать резюме
          </Button>
        </Group>

        <Group
          component="form"
          gap="xs"
          maw={480}
          onSubmit={(event) => {
            event.preventDefault();
            void resumes.searchFor(search);
          }}
        >
          <TextInput
            style={{ flex: 1 }}
            aria-label="Поиск резюме"
            placeholder="Поиск по названию и имени"
            value={search}
            onChange={(event) => setSearch(event.currentTarget.value)}
          />
          <Button type="submit" variant="light">
            Найти
          </Button>
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
          <Alert title={resumes.search ? 'Ничего не найдено' : 'Резюме ещё нет'}>
            {resumes.search
              ? 'Попробуйте другой запрос.'
              : 'Выберите шаблон, чтобы создать первое резюме.'}
          </Alert>
        ) : null}

        {resumes.resumes.length > 0 ? (
          <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="lg">
            {resumes.resumes.map((resume) => (
              <Card
                key={resume.id}
                withBorder
                shadow="sm"
                radius="md"
                style={{ position: 'relative' }}
              >
                <Link
                  to={`/resumes/${resume.id}/edit`}
                  aria-label={`Открыть резюме ${resume.title}`}
                  style={{ position: 'absolute', inset: 0, zIndex: 1 }}
                />
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
                    <Menu position="bottom-end" withinPortal>
                      <Menu.Target>
                        <ActionIcon
                          variant="subtle"
                          aria-label={`Действия с резюме ${resume.title}`}
                          style={{ position: 'relative', zIndex: 2 }}
                        >
                          ⋯
                        </ActionIcon>
                      </Menu.Target>
                      <Menu.Dropdown>
                        <Menu.Item component={Link} to={`/resumes/${resume.id}/edit`}>
                          Открыть
                        </Menu.Item>
                        <Menu.Item component={Link} to={`/resumes/${resume.id}/preview`}>
                          Предпросмотр
                        </Menu.Item>
                        <Menu.Item component={Link} to={`/resumes/${resume.id}/preview?print=1`}>
                          Сохранить как PDF
                        </Menu.Item>
                        <Menu.Divider />
                        <Menu.Item
                          color="red"
                          disabled={requests.latest('resumes.remove')?.status === 'pending'}
                          onClick={() => void removeResume(resume.id, (id) => resumes.remove(id))}
                        >
                          Удалить
                        </Menu.Item>
                      </Menu.Dropdown>
                    </Menu>
                  </Group>
                </Stack>
              </Card>
            ))}
          </SimpleGrid>
        ) : null}
        {resumes.total > 0 ? (
          <Group justify="space-between" wrap="wrap">
            <Group gap="xs">
              <Text size="sm" c="dimmed">
                На странице
              </Text>
              <Select
                aria-label="Резюме на странице"
                size="xs"
                w={75}
                data={['2', '4', '8', '10']}
                value={String(resumes.limit)}
                onChange={(value) => void resumes.setPageSize(Number(value ?? 10))}
              />
              <Text size="sm" c="dimmed">
                из {resumes.total}
              </Text>
            </Group>
            {resumes.total > resumes.limit ? (
              <Pagination
                total={Math.ceil(resumes.total / resumes.limit)}
                value={resumes.page}
                onChange={(page) => void resumes.load(page)}
              />
            ) : null}
          </Group>
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
