import { Alert, Button, Container, Group, Loader, Paper, Stack, Text, Title } from '@mantine/core';
import { useHead } from '@unhead/react';
import { observer } from 'mobx-react-lite';
import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router';

import { StoreKey, useStores } from '@/app/store';
import { type ResumeEditorValues, resumeToEditorValues } from '@/entities/resume';
import { ResumeEditorForm } from '@/features/resume-edit';
import {
  ResumeTemplatePreview,
  editorValuesToPreviewData,
  resumeToPreviewData,
} from '@/widgets/resume-template-preview';

import styles from './ResumeEditPage.module.css';

export const ResumeEditPage = observer(() => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { errors, requests, resumes, session } = useStores(
    StoreKey.Errors,
    StoreKey.Requests,
    StoreKey.Resumes,
    StoreKey.Session,
  );
  const [resume, setResume] = useState<Awaited<ReturnType<typeof resumes.get>>>(null);
  const [previewData, setPreviewData] = useState<ReturnType<typeof resumeToPreviewData> | null>(
    null,
  );
  const [previewSections, setPreviewSections] = useState<
    ReturnType<typeof resumeToEditorValues>['sections']
  >([]);

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
  }, [id, navigate, resumes, session.ready, session.user]);

  const onValuesChange = useCallback((values: ResumeEditorValues) => {
    setPreviewData(editorValuesToPreviewData(values));
    setPreviewSections(values.sections);
  }, []);

  const save = useCallback(
    async (input: Parameters<typeof resumes.update>[1]) => {
      if (!id) {
        return false;
      }
      const value = await resumes.update(id, input);
      if (!value) {
        return false;
      }
      setResume(value);
      setPreviewData(resumeToPreviewData(value));
      setPreviewSections(resumeToEditorValues(value).sections);
      return true;
    },
    [id, resumes],
  );

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
  const saveRequest = requests.latest('resumes.update');
  const loadError = errors.forOperation('resumes.get');
  const saveError = errors.forOperation('resumes.update');

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
          <Group justify="space-between" align="flex-end">
            <div>
              <Text size="sm" c="dimmed">
                Редактор резюме
              </Text>
              <Title order={1}>{resume.title}</Title>
            </div>
            <Button component={Link} to="/resumes" variant="subtle">
              Назад к резюме
            </Button>
          </Group>
          <div className={styles.workspace}>
            <ResumeEditorForm
              resume={resume}
              saving={saveRequest?.status === 'pending'}
              saveError={saveError}
              onSave={save}
              onValuesChange={onValuesChange}
            />
            <Paper withBorder p="md" className={styles.previewPanel}>
              <div className={styles.previewHeader}>
                <Title order={2} size="h3">
                  Предпросмотр
                </Title>
              </div>
              <div className={styles.previewScroll}>
                <ResumeTemplatePreview
                  template={resume.template}
                  data={previewData ?? resumeToPreviewData(resume)}
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
    </main>
  );
});
