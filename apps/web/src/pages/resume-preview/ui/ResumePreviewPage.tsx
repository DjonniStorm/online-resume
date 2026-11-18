import {
  Alert,
  Anchor,
  Breadcrumbs,
  Button,
  Container,
  Group,
  Loader,
  Stack,
  Title,
} from '@mantine/core';
import { useHead } from '@unhead/react';
import { observer } from 'mobx-react-lite';
import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router';

import { StoreKey, useStores } from '@/app/store';
import type { ResumeDto } from '@/shared/api/generated/types.gen';
import { ResumeTemplatePreview, resumeToPreviewData } from '@/widgets/resume-template-preview';

export const ResumePreviewPage = observer(() => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { resumes, session } = useStores(StoreKey.Resumes, StoreKey.Session);
  const [loaded, setLoaded] = useState<{ id: string; resume: ResumeDto | null } | null>(null);

  useHead({
    title: loaded?.resume ? `${loaded.resume.title} — предпросмотр` : 'Предпросмотр резюме',
  });

  useEffect(() => {
    if (session.ready && !session.user) {
      void navigate('/auth/login');
      return;
    }
    if (!session.user || !id) {
      return;
    }
    let active = true;
    void resumes.get(id).then((resume) => {
      if (active) {
        setLoaded({ id, resume });
      }
    });
    return () => {
      active = false;
    };
  }, [id, navigate, resumes, session.ready, session.user]);

  if (!session.ready || !session.user || !id || loaded?.id !== id) {
    return (
      <Container size="lg" py="xl">
        <Group justify="center">
          <Loader size="sm" />
        </Group>
      </Container>
    );
  }

  if (!loaded.resume) {
    return (
      <Container size="lg" py="xl">
        <Alert color="red" title="Резюме не найдено">
          Возможно, оно было удалено или у вас больше нет доступа.
          <Group mt="md">
            <Button component={Link} to="/resumes" variant="light">
              К моим резюме
            </Button>
          </Group>
        </Alert>
      </Container>
    );
  }

  const resume = loaded.resume;
  return (
    <main>
      <Container size={900} py={{ base: 'lg', sm: 'xl' }}>
        <Stack gap="lg">
          <Group justify="space-between" align="flex-end" gap="sm">
            <Stack gap={4}>
              <Breadcrumbs fz="sm">
                <Anchor component={Link} to="/resumes" underline="never">
                  Мои резюме
                </Anchor>
                <span>{resume.title}</span>
              </Breadcrumbs>
              <Title order={1} size="h2">
                {resume.title}
              </Title>
            </Stack>
            <Button component={Link} to={`/resumes/${id}/edit`} variant="light">
              Редактировать
            </Button>
          </Group>
          <ResumeTemplatePreview
            template={resume.template}
            data={resumeToPreviewData(resume)}
            sectionState={resume.sections}
          />
        </Stack>
      </Container>
    </main>
  );
});
