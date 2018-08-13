import {
  Alert,
  Box,
  Button,
  Container,
  Group,
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
import { useNavigate } from 'react-router';

import { StoreKey, useStores } from '@/app/store';
import { TemplateCard } from '@/entities/template';
import { CreateResumeModal } from '@/features/resume-create';
import type { TemplateDto } from '@/shared/api/generated/types.gen';
import { ResumeTemplatePreview } from '@/widgets/resume-template-preview';

export const TemplatesPage = observer(() => {
  useHead({ title: 'Шаблоны — Online Resume' });
  const { requests, errors, templates, session } = useStores(
    StoreKey.Requests,
    StoreKey.Errors,
    StoreKey.Templates,
    StoreKey.Session,
  );
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(4);
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateDto | null>(null);
  const [createModalOpened, setCreateModalOpened] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    void templates.load();
  }, [templates]);

  const normalizedQuery = query.trim().toLocaleLowerCase('ru');
  const filteredTemplates = templates.templates.filter((template) =>
    `${template.name} ${template.description}`.toLocaleLowerCase('ru').includes(normalizedQuery),
  );
  const pageCount = Math.ceil(filteredTemplates.length / pageSize);
  const visibleTemplates = filteredTemplates.slice((page - 1) * pageSize, page * pageSize);
  const listRequest = requests.latest('templates.list');
  const listError = errors.forOperation('templates.list');

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
              <Title order={1}>Шаблоны</Title>
              <Text c="dimmed" size="sm">
                Выберите оформление для резюме
              </Text>
            </div>
            <TextInput
              w={{ base: '100%', sm: 320 }}
              aria-label="Поиск шаблонов"
              placeholder="Поиск шаблонов"
              value={query}
              onChange={(event) => {
                setQuery(event.currentTarget.value);
                setPage(1);
              }}
            />
          </Group>

          {listRequest?.status === 'pending' ? (
            <SimpleGrid cols={{ base: 1, sm: 2, lg: 3, xl: 4 }} spacing="lg">
              <Skeleton height={360} />
              <Skeleton height={360} />
            </SimpleGrid>
          ) : null}
          {listError ? (
            <Alert color="red" title="Не удалось загрузить шаблоны">
              <Button variant="light" color="red" mt="sm" onClick={() => void templates.reload()}>
                Повторить
              </Button>
            </Alert>
          ) : null}
          {listRequest?.status === 'success' && filteredTemplates.length === 0 ? (
            <Alert title={query ? 'Ничего не найдено' : 'Шаблонов пока нет'}>
              {query ? 'Попробуйте другой запрос.' : 'Активные шаблоны ещё не добавлены.'}
            </Alert>
          ) : null}

          {visibleTemplates.length > 0 ? (
            <SimpleGrid cols={{ base: 1, sm: 2, lg: 3, xl: 4 }} spacing="lg">
              {visibleTemplates.map((template) => (
                <TemplateCard
                  key={template.id}
                  template={template}
                  preview={<ResumeTemplatePreview template={template} />}
                  onSelect={setSelectedTemplate}
                />
              ))}
            </SimpleGrid>
          ) : null}

          {filteredTemplates.length > 0 ? (
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
                  value={String(pageSize)}
                  onChange={(value) => {
                    setPageSize(Number(value ?? 4));
                    setPage(1);
                  }}
                />
                <Text size="sm" c="dimmed">
                  из {filteredTemplates.length}
                </Text>
              </Group>
              {pageCount > 1 ? (
                <Pagination total={pageCount} value={page} onChange={setPage} />
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
