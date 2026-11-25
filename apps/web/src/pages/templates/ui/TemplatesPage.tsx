import {
  Alert,
  Box,
  Button,
  Card,
  Container,
  Group,
  Modal,
  Pagination,
  Select,
  Skeleton,
  Stack,
  Text,
  Title,
} from '@mantine/core';
import { useHead } from '@unhead/react';
import { observer } from 'mobx-react-lite';
import { useQueryStates } from 'nuqs';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';

import { StoreKey, useStores } from '@/app/store';
import { TEMPLATE_PAGE_SIZES, TemplateCard } from '@/entities/template';
import { CreateResumeModal } from '@/features/resume-create';
import { ApiOperation } from '@/shared/api';
import type { TemplateDto } from '@/shared/api/generated/types.gen';
import { listQueryParsers } from '@/shared/lib/list-query';
import { SearchFormDraft } from '@/shared/ui/SearchForm';
import { ResumeTemplatePreview } from '@/widgets/resume-template-preview';

import classes from './TemplatesPage.module.css';

export const TemplatesPage = observer(() => {
  useHead({ title: 'Шаблоны — Online Resume' });
  const { requests, errors, templates, session } = useStores(
    StoreKey.Requests,
    StoreKey.Errors,
    StoreKey.Templates,
    StoreKey.Session,
  );
  const [{ q, page }, setListQuery] = useQueryStates(listQueryParsers);
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateDto | null>(null);
  const [createModalOpened, setCreateModalOpened] = useState(false);
  const navigate = useNavigate();
  const limit = templates.limit;

  useEffect(() => {
    void templates.load(Math.max(1, page), q, (resolvedPage) => {
      if (resolvedPage !== page) {
        void setListQuery({ page: resolvedPage }, { history: 'replace' });
      }
    });
  }, [templates, q, page, limit, setListQuery]);

  const pageCount = Math.ceil(templates.total / templates.limit);
  const listRequest = requests.latest(ApiOperation.TemplatesList);
  const listError = errors.forOperation(ApiOperation.TemplatesList);
  const loading = !listRequest || listRequest.status === 'pending';
  const ready = listRequest?.status === 'success';

  const openCreateModal = () => {
    if (!session.user) {
      navigate('/auth/login');
      return;
    }
    setCreateModalOpened(true);
  };

  return (
    <main>
      <Container size="xl" py={{ base: 'lg', sm: 'xl' }}>
        <Stack gap="lg">
          <Group justify="space-between" align="center" gap="md">
            <div>
              <Title order={1} size="h3" fw={600}>
                Шаблоны
              </Title>
              <Text c="dimmed" size="sm">
                Выберите оформление для резюме
              </Text>
            </div>
            <Box w={{ base: '100%', sm: 420 }}>
              <SearchFormDraft
                key={q}
                label="Поиск шаблонов"
                placeholder="Поиск шаблонов"
                initialValue={q}
                onSearch={(value) => void setListQuery({ q: value, page: 1 }, { history: 'push' })}
              />
            </Box>
          </Group>

          {!loading && listError ? (
            <Alert color="red" title="Не удалось загрузить шаблоны">
              <Button variant="light" color="red" mt="sm" onClick={() => void templates.reload()}>
                Повторить
              </Button>
            </Alert>
          ) : null}
          {ready && !loading && templates.total === 0 ? (
            <Alert title={q ? 'Ничего не найдено' : 'Шаблонов пока нет'}>
              {q ? 'Попробуйте другой запрос.' : 'Активные шаблоны ещё не добавлены.'}
            </Alert>
          ) : null}

          {loading || (ready && templates.templates.length > 0) ? (
            <div className={classes.grid} aria-busy={loading}>
              {loading
                ? Array.from(
                    { length: Math.min(templates.limit, templates.total || templates.limit) },
                    (_, index) => (
                      <Card key={index} withBorder radius="md" padding="md">
                        <Skeleton height={320} />
                        <Skeleton height={24} width="70%" mt="md" />
                      </Card>
                    ),
                  )
                : templates.templates.map((template) => (
                    <TemplateCard
                      key={template.id}
                      template={template}
                      preview={<ResumeTemplatePreview template={template} />}
                      onSelect={setSelectedTemplate}
                    />
                  ))}
            </div>
          ) : null}

          {templates.total > 0 ? (
            <Group justify="space-between" wrap="wrap" gap="md">
              <Group gap="xs">
                <Text size="sm" c="dimmed">
                  На странице
                </Text>
                <Select
                  aria-label="Шаблонов на странице"
                  size="xs"
                  w={75}
                  data={TEMPLATE_PAGE_SIZES.map(String)}
                  value={String(templates.limit)}
                  disabled={loading}
                  onChange={(value) => {
                    templates.setPageSize(Number(value ?? limit));
                    void setListQuery({ page: 1 }, { history: 'replace' });
                  }}
                />
                <Text size="sm" c="dimmed">
                  из {templates.total}
                </Text>
              </Group>
              {pageCount > 1 ? (
                <Pagination
                  total={pageCount}
                  value={templates.page}
                  disabled={loading}
                  onChange={(nextPage) =>
                    void setListQuery({ page: nextPage }, { history: 'push' })
                  }
                />
              ) : null}
            </Group>
          ) : null}
        </Stack>
      </Container>

      <Modal
        opened={selectedTemplate !== null && !createModalOpened}
        onClose={() => setSelectedTemplate(null)}
        title={selectedTemplate?.name}
        size="xl"
        centered
      >
        {selectedTemplate ? (
          <Stack gap="md">
            <Box maw={794} mx="auto">
              <ResumeTemplatePreview template={selectedTemplate} />
            </Box>
            <Group justify="flex-end">
              <Button onClick={openCreateModal}>Создать резюме</Button>
            </Group>
          </Stack>
        ) : null}
      </Modal>
      {selectedTemplate ? (
        <CreateResumeModal
          template={selectedTemplate}
          opened={createModalOpened}
          onClose={() => {
            setCreateModalOpened(false);
            setSelectedTemplate(null);
          }}
          onCreated={() => navigate('/resumes')}
        />
      ) : null}
    </main>
  );
});
