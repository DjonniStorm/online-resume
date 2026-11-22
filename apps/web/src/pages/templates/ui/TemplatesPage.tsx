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
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';

import { StoreKey, useStores } from '@/app/store';
import { TemplateCard } from '@/entities/template';
import { CreateResumeModal } from '@/features/resume-create';
import type { TemplateDto } from '@/shared/api/generated/types.gen';
import { SearchForm } from '@/shared/ui/SearchForm';
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
  const [query, setQuery] = useState(templates.search);
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateDto | null>(null);
  const [createModalOpened, setCreateModalOpened] = useState(false);
  const [loadedHere, setLoadedHere] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    let active = true;
    void templates.load().finally(() => {
      if (active) {
        setLoadedHere(true);
      }
    });
    return () => {
      active = false;
    };
  }, [templates]);

  const pageCount = Math.ceil(templates.total / templates.limit);
  const listRequest = requests.latest('templates.list');
  const listError = errors.forOperation('templates.list');
  const loading = !loadedHere || listRequest?.status === 'pending';
  const ready = loadedHere && listRequest?.status === 'success';

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
          <Group justify="space-between" align="flex-end" gap="md">
            <div>
              <Title order={1} size="h2">
                Шаблоны
              </Title>
              <Text c="dimmed" size="sm">
                Выберите оформление для резюме
              </Text>
            </div>
            <Box w={{ base: '100%', sm: 420 }}>
              <SearchForm
                label="Поиск шаблонов"
                placeholder="Поиск шаблонов"
                value={query}
                onChange={setQuery}
                onSearch={(value) => void templates.searchFor(value)}
              />
            </Box>
          </Group>

          {loading ? (
            <div className={classes.grid}>
              {Array.from({ length: templates.limit }, (_, index) => (
                <Card key={index} withBorder radius="md" padding="md">
                  <Skeleton height={330} />
                  <Skeleton height={24} width="70%" mt="md" />
                </Card>
              ))}
            </div>
          ) : null}
          {!loading && listError ? (
            <Alert color="red" title="Не удалось загрузить шаблоны">
              <Button variant="light" color="red" mt="sm" onClick={() => void templates.reload()}>
                Повторить
              </Button>
            </Alert>
          ) : null}
          {ready && templates.total === 0 ? (
            <Alert title={query ? 'Ничего не найдено' : 'Шаблонов пока нет'}>
              {query ? 'Попробуйте другой запрос.' : 'Активные шаблоны ещё не добавлены.'}
            </Alert>
          ) : null}

          {ready && templates.templates.length > 0 ? (
            <div className={classes.grid}>
              {templates.templates.map((template) => (
                <TemplateCard
                  key={template.id}
                  template={template}
                  preview={<ResumeTemplatePreview template={template} />}
                  onSelect={setSelectedTemplate}
                />
              ))}
            </div>
          ) : null}

          {ready && templates.total > 0 ? (
            <Group justify="space-between" wrap="wrap" gap="md">
              <Group gap="xs">
                <Text size="sm" c="dimmed">
                  На странице
                </Text>
                <Select
                  aria-label="Шаблонов на странице"
                  size="xs"
                  w={75}
                  data={['2', '4', '8', '10']}
                  value={String(templates.limit)}
                  onChange={(value) => void templates.setPageSize(Number(value ?? 4))}
                />
                <Text size="sm" c="dimmed">
                  из {templates.total}
                </Text>
              </Group>
              {pageCount > 1 ? (
                <Pagination
                  total={pageCount}
                  value={templates.page}
                  onChange={(page) => void templates.load(page)}
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
