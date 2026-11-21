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
  Modal,
  Pagination,
  Select,
  SimpleGrid,
  Skeleton,
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
import { ResumeCardPreview } from '@/entities/resume';
import type { ResumeSummaryDto } from '@/shared/api/generated/types.gen';

export const ResumesPage = observer(() => {
  useHead({ title: 'Мои резюме — Online Resume' });
  const { requests, errors, session, resumes } = useStores(
    StoreKey.Requests,
    StoreKey.Errors,
    StoreKey.Session,
    StoreKey.Resumes,
  );
  const navigate = useNavigate();
  const [search, setSearch] = useState(resumes.search);
  const [listLoaded, setListLoaded] = useState(false);
  const [selectedForDeletion, setSelectedForDeletion] = useState<ResumeSummaryDto | null>(null);

  const removeSelected = async () => {
    if (selectedForDeletion && (await resumes.remove(selectedForDeletion.id))) {
      setSelectedForDeletion(null);
    }
  };

  useEffect(() => {
    if (session.ready && !session.user) {
      navigate('/auth/login');
      return;
    }
    if (!session.user) {
      return;
    }
    let active = true;
    void resumes.load().finally(() => {
      if (active) {
        setListLoaded(true);
      }
    });
    return () => {
      active = false;
    };
  }, [navigate, resumes, session.ready, session.user]);

  const listRequest = requests.latest('resumes.list');
  const listLoading = !listLoaded || listRequest?.status === 'pending';
  const listReady = listLoaded && listRequest?.status === 'success';

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
            {listReady ? (
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

        {listLoading ? (
          <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="lg">
            {Array.from({ length: 2 }, (_, index) => (
              <Card key={index} withBorder radius="md">
                <Group align="stretch" wrap="nowrap" gap="lg">
                  <Skeleton width={140} height={198} />
                  <Stack gap="sm" style={{ flex: 1 }}>
                    <Skeleton height={24} width="70%" />
                    <Skeleton height={16} width="50%" />
                    <Skeleton height={16} width="60%" mt="auto" />
                  </Stack>
                </Group>
              </Card>
            ))}
          </SimpleGrid>
        ) : null}
        {!listLoading && errors.forOperation('resumes.list') ? (
          <Alert color="red" title="Не удалось загрузить резюме">
            <Button variant="light" color="red" mt="sm" onClick={() => void resumes.reload()}>
              Повторить
            </Button>
          </Alert>
        ) : null}
        {listReady && resumes.resumes.length === 0 ? (
          <Alert title={resumes.search ? 'Ничего не найдено' : 'Резюме ещё нет'}>
            {resumes.search
              ? 'Попробуйте другой запрос.'
              : 'Выберите шаблон, чтобы создать первое резюме.'}
          </Alert>
        ) : null}

        {listReady && resumes.resumes.length > 0 ? (
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
                <Group align="stretch" wrap="nowrap" gap="lg">
                  <ResumeCardPreview resume={resume} />
                  <Stack gap={6} style={{ flex: 1, minWidth: 0, paddingRight: 28 }}>
                    <Title order={3} size="h4" style={{ overflowWrap: 'anywhere' }}>
                      {resume.title}
                    </Title>
                    <Text size="sm" c="dimmed">
                      {resume.firstName} {resume.lastName}
                    </Text>
                    <Text size="xs" c="dimmed">
                      {resume.template.name}
                    </Text>
                    {resume.isPublished ? (
                      <Badge variant="light" size="sm" w="fit-content">
                        Опубликовано
                      </Badge>
                    ) : null}
                    <Text size="xs" c="dimmed" mt="auto">
                      Обновлено: {formatDate(resume.updatedAt)}
                    </Text>
                  </Stack>
                </Group>
                <Menu position="bottom-end" withinPortal>
                  <Menu.Target>
                    <ActionIcon
                      variant="subtle"
                      aria-label={`Действия с резюме ${resume.title}`}
                      style={{ position: 'absolute', top: 12, right: 12, zIndex: 2 }}
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
                      onClick={() => setSelectedForDeletion(resume)}
                    >
                      Удалить
                    </Menu.Item>
                  </Menu.Dropdown>
                </Menu>
              </Card>
            ))}
          </SimpleGrid>
        ) : null}
        {listReady && resumes.total > 0 ? (
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
        <Modal
          opened={selectedForDeletion !== null}
          onClose={() => setSelectedForDeletion(null)}
          title="Удалить резюме?"
          centered
        >
          <Stack gap="md">
            <Text size="sm">
              «{selectedForDeletion?.title}» исчезнет из списка и будет окончательно удалено через
              30 дней.
            </Text>
            {selectedForDeletion?.isPublished ? (
              <Alert color="yellow">
                Публичная ссылка перестанет работать сразу. Если вы разместили её на других сайтах,
                замените или удалите её там.
              </Alert>
            ) : null}
            {errors.forOperation('resumes.remove') ? (
              <Alert color="red">Не удалось удалить резюме. Попробуйте ещё раз.</Alert>
            ) : null}
            <Group justify="flex-end">
              <Button variant="subtle" onClick={() => setSelectedForDeletion(null)}>
                Отмена
              </Button>
              <Button
                color="red"
                loading={requests.latest('resumes.remove')?.status === 'pending'}
                onClick={() => void removeSelected()}
              >
                Удалить резюме
              </Button>
            </Group>
          </Stack>
        </Modal>
      </Stack>
    </Container>
  );
});

function formatDate(value: string): string {
  return new Intl.DateTimeFormat('ru-RU', {
    dateStyle: 'medium',
  }).format(new Date(value));
}
