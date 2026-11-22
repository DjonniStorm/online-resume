import { ActionIcon, Alert, Button, Container, Group, Loader, Tooltip } from '@mantine/core';
import { IconDownload } from '@tabler/icons-react';
import { useHead } from '@unhead/react';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router';

import { StoreKey, useStore } from '@/app/store';
import type { ResumeDto } from '@/shared/api/generated/types.gen';
import { ResumeTemplatePreview, resumeToPreviewData } from '@/widgets/resume-template-preview';

import styles from './PublicResumePage.module.css';

export function PublicResumePage() {
  const { slug } = useParams();
  const resumes = useStore(StoreKey.Resumes);
  const [loaded, setLoaded] = useState<{ slug: string; resume: ResumeDto | null } | null>(null);

  useHead({ title: loaded?.resume ? `${loaded.resume.title} — резюме` : 'Публичное резюме' });

  useEffect(() => {
    if (!slug) {
      return;
    }
    let active = true;
    void resumes.getPublic(slug).then((resume) => {
      if (active) {
        setLoaded({ slug, resume });
      }
    });
    return () => {
      active = false;
    };
  }, [resumes, slug]);

  if (slug && loaded?.slug !== slug) {
    return (
      <Container size="lg" py="xl">
        <Group justify="center">
          <Loader size="sm" />
        </Group>
      </Container>
    );
  }

  if (!loaded?.resume) {
    return (
      <Container size="lg" py="xl">
        <Alert title="Резюме недоступно">
          Ссылка неверна или владелец снял резюме с публикации.
        </Alert>
      </Container>
    );
  }

  const resume = loaded.resume;
  return (
    <main>
      <Container size={900} py={{ base: 'lg', sm: 'xl' }} className={styles.container}>
        <div className={styles.controls}>
          <Tooltip label="Сохранить как PDF">
            <ActionIcon
              className={styles.desktopAction}
              aria-label="Сохранить как PDF"
              size="xl"
              variant="light"
              onClick={() => window.print()}
            >
              <IconDownload size={22} aria-hidden="true" />
            </ActionIcon>
          </Tooltip>
          <Button className={styles.mobileAction} onClick={() => window.print()}>
            Сохранить как PDF
          </Button>
        </div>
        <ResumeTemplatePreview
          template={resume.template}
          data={resumeToPreviewData(resume)}
          photoUrl={
            resume.photoPath && slug
              ? `/api/public/resumes/${encodeURIComponent(slug)}/photo`
              : null
          }
          sectionState={resume.sections}
        />
      </Container>
    </main>
  );
}
