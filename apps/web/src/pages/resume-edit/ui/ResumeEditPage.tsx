import {
  ActionIcon,
  Alert,
  Anchor,
  Breadcrumbs,
  Button,
  Container,
  Group,
  Loader,
  Modal,
  Paper,
  SimpleGrid,
  Stack,
  Text,
  Title,
  Tooltip,
} from '@mantine/core';
import { IconDeviceFloppy, IconExternalLink, IconPalette } from '@tabler/icons-react';
import { useHead } from '@unhead/react';
import { observer } from 'mobx-react-lite';
import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router';
import { match } from 'ts-pattern';

import { StoreKey, useStores } from '@/app/store';
import {
  type ResumeEditorValues,
  resumeToEditorValues,
  useResumePhotoUrl,
} from '@/entities/resume';
import { TemplateCard } from '@/entities/template';
import { ResumeEditorForm, type SaveState } from '@/features/resume-edit';
import type { TemplateDto } from '@/shared/api/generated/types.gen';
import {
  ResumeTemplatePreview,
  editorValuesToPreviewData,
  resumeToPreviewData,
} from '@/widgets/resume-template-preview';

import styles from './ResumeEditPage.module.css';

export const ResumeEditPage = observer(() => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { errors, requests, resumes, session, templates } = useStores(
    StoreKey.Errors,
    StoreKey.Requests,
    StoreKey.Resumes,
    StoreKey.Session,
    StoreKey.Templates,
  );
  const [resume, setResume] = useState<Awaited<ReturnType<typeof resumes.get>>>(null);
  const [previewData, setPreviewData] = useState<ReturnType<typeof resumeToPreviewData> | null>(
    null,
  );
  const [previewSections, setPreviewSections] = useState<
    ReturnType<typeof resumeToEditorValues>['sections']
  >([]);
  const [templateModalOpened, setTemplateModalOpened] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateDto | null>(null);
  const [saveState, setSaveState] = useState<SaveState>('saved');
  const photoUrl = useResumePhotoUrl(resumes, id ?? '', resume?.photoPath ?? null);

  useHead({ title: resume ? `Редактор · ${resume.title}` : 'Редактор резюме — Online Resume' });

  useEffect(() => {
    if (session.ready && !session.user) {
      navigate('/auth/login');
      return;
    }
    if (!session.user || !id) {
      return;
    }
    void resumes.get(id).then((value) => {
      setResume(value);
      setPreviewData(value ? resumeToPreviewData(value) : null);
      setPreviewSections(value ? resumeToEditorValues(value).sections : []);
    });
    void templates.load();
  }, [id, navigate, resumes, session.ready, session.user, templates]);

  const onValuesChange = useCallback((values: ResumeEditorValues) => {
    setPreviewData(editorValuesToPreviewData(values));
    setPreviewSections(values.sections);
  }, []);

  const save = useCallback(
    async (input: Parameters<typeof resumes.update>[1]) => {
      if (!id) {
        return null;
      }
      const value = await resumes.update(id, input);
      if (!value) {
        return null;
      }
      setResume(value);
      return value;
    },
    [id, resumes],
  );

  const uploadPhoto = async (file: File) => {
    if (!id) {
      return null;
    }
    const value = await resumes.uploadPhoto(id, file);
    if (value) {
      setResume(value);
    }
    return value;
  };

  const deletePhoto = async () => {
    if (!id) {
      return null;
    }
    const value = await resumes.deletePhoto(id);
    if (value) {
      setResume(value);
    }
    return value;
  };

  const openPreview = useCallback(() => {
    if (id) {
      void navigate(`/resumes/${id}/preview`);
    }
  }, [id, navigate]);

  const openTemplateModal = () => {
    setSelectedTemplate(resume?.template ?? null);
    setTemplateModalOpened(true);
    void templates.load();
  };

  const closeTemplateModal = () => {
    if (requests.latest('resumes.changeTemplate')?.status === 'pending') {
      return;
    }
    setTemplateModalOpened(false);
    setSelectedTemplate(null);
  };

  const changeTemplate = async () => {
    if (!id || !resume || !selectedTemplate || selectedTemplate.id === resume.template.id) {
      closeTemplateModal();
      return;
    }
    const value = await resumes.changeTemplate(id, {
      revision: resume.revision,
      templateSlug: selectedTemplate.slug,
    });
    if (!value) {
      return;
    }
    setResume(value);
    setPreviewData(resumeToPreviewData(value));
    setPreviewSections(resumeToEditorValues(value).sections);
    closeTemplateModal();
  };

  if (!session.ready || !session.user || !id) {
    return (
      <Container size="lg" py="xl">
        <Group justify="center">
          <Loader size="sm" />
        </Group>
      </Container>
    );
  }

  const loadRequest = requests.latest('resumes.get');
  const loadError = errors.forOperation('resumes.get');
  const saveError = errors.forOperation('resumes.update');
  const photoBusy =
    requests.latest('resumes.uploadPhoto')?.status === 'pending' ||
    requests.latest('resumes.deletePhoto')?.status === 'pending';

  if (loadRequest?.status === 'pending' || (!resume && !loadError)) {
    return (
      <Container size="lg" py="xl">
        <Group justify="center">
          <Loader size="sm" />
        </Group>
      </Container>
    );
  }

  if (!resume) {
    return (
      <Container size="lg" py="xl">
        <Alert color="red" title="Резюме не найдено">
          Возможно, оно было удалено или у вас больше нет доступа.
          <Group mt="md">
            <Button component={Link} to="/resumes" variant="light">
              Вернуться к резюме
            </Button>
          </Group>
        </Alert>
      </Container>
    );
  }

  return (
    <main className={styles.page}>
      <Container size="xl" py={{ base: 'lg', sm: 'xl' }} className={styles.container}>
        <Stack gap="lg" className={styles.content}>
          <Group justify="space-between" align="flex-end" gap="sm">
            <Stack gap={4}>
              <Breadcrumbs fz="sm">
                <Anchor component={Link} to="/resumes" underline="never">
                  Мои резюме
                </Anchor>
                <span>{resume.template.slug}</span>
              </Breadcrumbs>
              <Title order={1} size="h3">
                {resume.title}
              </Title>
            </Stack>
            <Group gap="sm">
              <Tooltip label="Сохранить и открыть предпросмотр">
                <ActionIcon
                  type="submit"
                  form="resume-editor-form"
                  data-intent="preview"
                  variant="light"
                  size="lg"
                  disabled={saveState === 'saving'}
                  aria-label="Сохранить и открыть предпросмотр"
                >
                  <IconExternalLink size={20} />
                </ActionIcon>
              </Tooltip>
              <Tooltip label="Изменить шаблон">
                <ActionIcon
                  variant="light"
                  size="lg"
                  disabled={saveState === 'saving'}
                  onClick={openTemplateModal}
                  aria-label="Изменить шаблон"
                >
                  <IconPalette size={20} />
                </ActionIcon>
              </Tooltip>
              <Tooltip
                label={match(saveState)
                  .with('saved', () => 'Сохранено')
                  .with('saving', () => 'Сохраняется…')
                  .with('error', () => 'Ошибка сохранения')
                  .with('invalid', () => 'Исправьте поля')
                  .with('dirty', () => 'Сохранить')
                  .exhaustive()}
              >
                <ActionIcon
                  type="submit"
                  form="resume-editor-form"
                  size="lg"
                  color={saveState === 'error' || saveState === 'invalid' ? 'red' : undefined}
                  variant={saveState === 'saved' ? 'default' : 'filled'}
                  disabled={saveState === 'saving' || saveState === 'saved'}
                  aria-label="Сохранить изменения"
                >
                  <IconDeviceFloppy size={20} />
                </ActionIcon>
              </Tooltip>
            </Group>
          </Group>
          <div className={styles.workspace}>
            <ResumeEditorForm
              key={`${resume.id}:${resume.template.id}`}
              resume={resume}
              saveError={saveError}
              paused={templateModalOpened || photoBusy}
              photoUrl={photoUrl}
              photoBusy={photoBusy || saveState === 'saving'}
              photoError={
                errors.forOperation('resumes.uploadPhoto') ??
                errors.forOperation('resumes.deletePhoto')
              }
              onPhotoUpload={uploadPhoto}
              onPhotoDelete={deletePhoto}
              onSave={save}
              onOpenPreview={openPreview}
              onSaveStateChange={setSaveState}
              onValuesChange={onValuesChange}
            />
            <Paper withBorder p="md" className={styles.previewPanel}>
              <div className={styles.previewHeader}>
                <Title order={2} size="h4">
                  Предпросмотр
                </Title>
              </div>
              <div className={styles.previewScroll}>
                <ResumeTemplatePreview
                  template={resume.template}
                  data={previewData ?? resumeToPreviewData(resume)}
                  photoUrl={photoUrl}
                  sectionState={previewSections.map((section, index) => ({
                    ...section,
                    sortOrder: index,
                  }))}
                />
              </div>
            </Paper>
          </div>
        </Stack>
      </Container>
      <Modal
        opened={templateModalOpened}
        onClose={closeTemplateModal}
        title="Изменить шаблон"
        size="xl"
        centered
      >
        <Stack gap="md">
          <Alert color="yellow" title="Несохранённые изменения">
            При применении другого шаблона несохранённые изменения формы будут потеряны. Сначала
            сохраните резюме, если хотите их оставить.
          </Alert>
          {requests.latest('templates.list')?.status === 'pending' ? (
            <Group justify="center">
              <Loader size="sm" />
            </Group>
          ) : null}
          {errors.forOperation('templates.list') ? (
            <Alert color="red" title="Не удалось загрузить шаблоны">
              Попробуйте закрыть окно и открыть его снова.
            </Alert>
          ) : null}
          {templates.templates.length > 0 ? (
            <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="md">
              {templates.templates.map((template) => (
                <TemplateCard
                  key={template.id}
                  template={template}
                  preview={
                    <ResumeTemplatePreview
                      template={template}
                      data={previewData ?? resumeToPreviewData(resume)}
                      photoUrl={photoUrl}
                      sectionState={previewSections.map((section, index) => ({
                        ...section,
                        sortOrder: index,
                      }))}
                    />
                  }
                  onSelect={setSelectedTemplate}
                />
              ))}
            </SimpleGrid>
          ) : null}
          {errors.forOperation('resumes.changeTemplate') ? (
            <Alert color="red" title="Не удалось изменить шаблон">
              {errors.forOperation('resumes.changeTemplate')?.status === 409
                ? 'Резюме изменилось в другой вкладке. Обновите страницу.'
                : 'Шаблон больше недоступен или не поддерживает разделы этого резюме.'}
            </Alert>
          ) : null}
          <Group justify="space-between">
            <Text size="sm" c="dimmed">
              Выбран: {selectedTemplate?.name ?? resume.template.name}
            </Text>
            <Group gap="sm">
              <Button variant="subtle" onClick={closeTemplateModal}>
                Отмена
              </Button>
              <Button
                loading={requests.latest('resumes.changeTemplate')?.status === 'pending'}
                disabled={!selectedTemplate || selectedTemplate.id === resume.template.id}
                onClick={() => void changeTemplate()}
              >
                Применить
              </Button>
            </Group>
          </Group>
        </Stack>
      </Modal>
    </main>
  );
});
