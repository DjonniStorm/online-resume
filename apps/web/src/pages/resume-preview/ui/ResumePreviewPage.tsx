import {
  ActionIcon,
  Alert,
  Anchor,
  Breadcrumbs,
  Button,
  Container,
  Group,
  Loader,
  Stack,
  Title,
  Tooltip,
} from '@mantine/core';
import { IconDownload } from '@tabler/icons-react';
import { useHead } from '@unhead/react';
import { observer } from 'mobx-react-lite';
import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router';

import { StoreKey, useStores } from '@/app/store';
import { useResumePhotoUrl } from '@/entities/resume';
import { ResumePublication } from '@/features/resume-publication';
import { ApiOperation } from '@/shared/api';
import type { ResumeDto } from '@/shared/api/generated/types.gen';
import { ResumeTemplatePreview, resumeToPreviewData } from '@/widgets/resume-template-preview';

import styles from './ResumePreviewPage.module.css';

export const ResumePreviewPage = observer(() => {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const printOnOpen = searchParams.get('print') === '1';
  const navigate = useNavigate();
  const { requests, resumes, session } = useStores(
    StoreKey.Requests,
    StoreKey.Resumes,
    StoreKey.Session,
  );
  const [loaded, setLoaded] = useState<{ id: string; resume: ResumeDto | null } | null>(null);
  const photoUrl = useResumePhotoUrl(resumes, id ?? '', loaded?.resume?.photoPath ?? null);

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

  useEffect(() => {
    if (!printOnOpen || !id || loaded?.id !== id || !loaded.resume) {
      return;
    }
    if (
      loaded.resume.photoPath &&
      !photoUrl &&
      requests.latest(ApiOperation.ResumesGetPhoto)?.status !== 'error'
    ) {
      return;
    }
    let active = true;
    void Promise.all([
      document.fonts.ready,
      ...Array.from(document.images, (image) => image.decode().catch(() => undefined)),
    ]).then(() => {
      if (active) {
        window.print();
      }
    });
    return () => {
      active = false;
    };
  }, [id, loaded, photoUrl, printOnOpen, requests]);

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
      <Container size={900} py={{ base: 'lg', sm: 'xl' }} className={styles.container}>
        <Stack gap="lg">
          <Group justify="space-between" align="center" gap="sm" className={styles.controls}>
            <Stack gap={4} className={styles.heading}>
              <Breadcrumbs fz="sm">
                <Anchor component={Link} to="/resumes" underline="never">
                  Мои резюме
                </Anchor>
                <span>{resume.title}</span>
              </Breadcrumbs>
              <Title order={1} size="h3" fw={600}>
                {resume.title}
              </Title>
            </Stack>
            <Group gap="xs" wrap="nowrap">
              <Tooltip label="Сохранить как PDF">
                <ActionIcon
                  aria-label="Сохранить как PDF"
                  variant="light"
                  size="lg"
                  onClick={() => window.print()}
                >
                  <IconDownload size={20} aria-hidden="true" />
                </ActionIcon>
              </Tooltip>
              <Button component={Link} to={`/resumes/${id}/edit`}>
                Редактировать
              </Button>
            </Group>
          </Group>
          <div className={styles.controls}>
            <ResumePublication
              id={id}
              publicSlug={resume.isPublished ? resume.publicSlug : null}
              unpublishAt={resume.unpublishAt}
              onChange={(publicSlug, unpublishAt) =>
                setLoaded({
                  id,
                  resume: { ...resume, publicSlug, unpublishAt, isPublished: publicSlug !== null },
                })
              }
            />
          </div>
          <ResumeTemplatePreview
            template={resume.template}
            data={resumeToPreviewData(resume)}
            photoUrl={photoUrl}
            sectionState={resume.sections}
          />
        </Stack>
      </Container>
    </main>
  );
});
