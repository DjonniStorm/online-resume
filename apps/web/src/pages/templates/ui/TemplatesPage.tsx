import {
  Alert,
  Button,
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
import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router';

import { StoreKey, useStores } from '@/app/store';
import { TemplateCard } from '@/entities/template';
import { CreateResumeModal } from '@/features/resume-create';
import { ResumeTemplatePreview } from '@/widgets/resume-template-preview';

export const TemplatesPage = observer(() => {
  useHead({ title: 'Шаблоны — Online Resume' });
  const { requests, errors, templates, session } = useStores(
    StoreKey.Requests,
    StoreKey.Errors,
    StoreKey.Templates,
    StoreKey.Session,
  );
  const [selectedSlug, setSelectedSlug] = useState<string | null>(null);
  const [createModalOpened, setCreateModalOpened] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    void templates.load();
  }, [templates]);

  const selectedTemplate =
    templates.templates.find((template) => template.slug === selectedSlug) ??
    templates.templates[0];
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
    <Container size="xl" py="xl">
      <Stack gap="xl">
        <Group justify="space-between" align="flex-end">
          <Stack gap={4}>
            <Text size="sm" c="dimmed">
              Оформление резюме
            </Text>
            <Title order={1}>Выберите шаблон</Title>
            <Text c="dimmed" maw={620}>
              Готовые варианты с одинаковыми данными, но разной композицией и визуальным ритмом.
            </Text>
          </Stack>
          <Button component={Link} to="/" variant="subtle">
            На главную
          </Button>
        </Group>

        {listRequest?.status === 'pending' ? <TemplateListSkeleton /> : null}
        {listError ? (
          <Alert color="red" title="Не удалось загрузить шаблоны">
            <Group justify="space-between" mt="sm">
              <Text size="sm">Проверьте соединение с API и повторите попытку.</Text>
              <Button variant="light" color="red" onClick={() => void templates.reload()}>
                Повторить
              </Button>
            </Group>
          </Alert>
        ) : null}
        {listRequest?.status === 'success' && templates.templates.length === 0 ? (
          <Alert title="Шаблонов пока нет">Активные шаблоны ещё не добавлены.</Alert>
        ) : null}

        {templates.templates.length > 0 ? (
          <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="lg">
            {templates.templates.map((template) => (
              <TemplateCard
                key={template.id}
                template={template}
                preview={<ResumeTemplatePreview template={template} />}
                selected={template.id === selectedTemplate?.id}
                onSelect={(nextTemplate) => setSelectedSlug(nextTemplate.slug)}
              />
            ))}
          </SimpleGrid>
        ) : null}

        {selectedTemplate ? (
          <Stack gap="md">
            <Stack gap={4}>
              <Text size="sm" c="dimmed">
                Крупный просмотр
              </Text>
              <Title order={2}>{selectedTemplate.name}</Title>
            </Stack>
            <ResumeTemplatePreview template={selectedTemplate} />
            <Group justify="flex-end">
              <Button onClick={openCreateModal}>Создать резюме в этом шаблоне</Button>
            </Group>
          </Stack>
        ) : null}
      </Stack>
      {selectedTemplate ? (
        <CreateResumeModal
          template={selectedTemplate}
          opened={createModalOpened}
          onClose={() => setCreateModalOpened(false)}
          onCreated={() => navigate('/resumes')}
        />
      ) : null}
    </Container>
  );
});

function TemplateListSkeleton() {
  return (
    <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="lg">
      {[1, 2, 3].map((item) => (
        <Stack key={item} gap="md">
          <Loader size="sm" />
          <Text size="sm" c="dimmed">
            Загружаем шаблоны…
          </Text>
        </Stack>
      ))}
    </SimpleGrid>
  );
}
