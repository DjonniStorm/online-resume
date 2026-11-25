import {
  Alert,
  Button,
  Card,
  Container,
  Group,
  Loader,
  Pagination,
  Select,
  SimpleGrid,
  Skeleton,
  Stack,
  Text,
  Title,
} from '@mantine/core';
import { useHead } from '@unhead/react';
import { observer } from 'mobx-react-lite';
import { useQueryStates } from 'nuqs';
import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router';

import { StoreKey, useStores } from '@/app/store';
import { RESUME_PAGE_SIZES, ResumeCard } from '@/entities/resume';
import { ResumeDeleteDialog } from '@/features/resume-delete';
import { ApiOperation } from '@/shared/api';
import type { ResumeSummaryDto } from '@/shared/api/generated/types.gen';
import { listQueryParsers } from '@/shared/lib/list-query';
import { SearchFormDraft } from '@/shared/ui/SearchForm';

export const ResumesPage = observer(() => {
  useHead({ title: 'Мои резюме — Online Resume' });
  const { requests, errors, session, resumes } = useStores(
    StoreKey.Requests,
    StoreKey.Errors,
    StoreKey.Session,
    StoreKey.Resumes,
  );
  const navigate = useNavigate();
  const [{ q, page }, setListQuery] = useQueryStates(listQueryParsers);
  const [selectedForDeletion, setSelectedForDeletion] = useState<ResumeSummaryDto | null>(null);
  const limit = resumes.limit;

  useEffect(() => {
    if (session.ready && !session.user) {
      navigate('/auth/login');
      return;
    }
    if (!session.user) {
      return;
    }
    void resumes.load(Math.max(1, page), q, (resolvedPage) => {
      if (resolvedPage !== page) {
        void setListQuery({ page: resolvedPage }, { history: 'replace' });
      }
    });
  }, [navigate, resumes, session.ready, session.user, q, page, limit, setListQuery]);

  const listRequest = requests.latest(ApiOperation.ResumesList);
  const listLoading = !listRequest || listRequest.status === 'pending';
  const listReady = listRequest?.status === 'success';

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
          <Title order={1} size="h3" fw={600}>
            Мои резюме
          </Title>
          <Button component={Link} to="/templates">
            Создать резюме
          </Button>
        </Group>

        <SearchFormDraft
          key={q}
          label="Поиск резюме"
          placeholder="Поиск по названию и имени"
          initialValue={q}
          onSearch={(value) => void setListQuery({ q: value, page: 1 }, { history: 'push' })}
        />

        {!listLoading && errors.forOperation(ApiOperation.ResumesList) ? (
          <Alert color="red" title="Не удалось загрузить резюме">
            <Button variant="light" color="red" mt="sm" onClick={() => void resumes.reload()}>
              Повторить
            </Button>
          </Alert>
        ) : null}
        {listReady && !listLoading && resumes.resumes.length === 0 ? (
          <Alert title={resumes.search ? 'Ничего не найдено' : 'Резюме ещё нет'}>
            {resumes.search
              ? 'Попробуйте другой запрос.'
              : 'Выберите шаблон, чтобы создать первое резюме.'}
          </Alert>
        ) : null}

        {listLoading ? (
          <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="lg" aria-busy>
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
        {listReady && resumes.resumes.length > 0 ? (
          <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="lg">
            {resumes.resumes.map((resume) => (
              <ResumeCard
                key={resume.id}
                resume={resume}
                onDelete={setSelectedForDeletion}
                deleteDisabled={requests.latest(ApiOperation.ResumesRemove)?.status === 'pending'}
              />
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
                data={RESUME_PAGE_SIZES.map(String)}
                value={String(resumes.limit)}
                disabled={listLoading}
                onChange={(value) => {
                  resumes.setPageSize(Number(value ?? limit));
                  void setListQuery({ page: 1 }, { history: 'replace' });
                }}
              />
              <Text size="sm" c="dimmed">
                Показано {resumes.resumes.length} из {resumes.total}
              </Text>
            </Group>
            {resumes.total > resumes.limit ? (
              <Pagination
                total={Math.ceil(resumes.total / resumes.limit)}
                value={resumes.page}
                disabled={listLoading}
                onChange={(nextPage) => void setListQuery({ page: nextPage }, { history: 'push' })}
              />
            ) : null}
          </Group>
        ) : null}
        <ResumeDeleteDialog
          resume={selectedForDeletion}
          onClose={() => setSelectedForDeletion(null)}
        />
      </Stack>
    </Container>
  );
});
