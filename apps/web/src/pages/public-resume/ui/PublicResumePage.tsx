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
  const currentResume = loaded && loaded.slug === slug ? loaded.resume : null;

  const resumeName = currentResume
    ? `${currentResume.firstName} ${currentResume.lastName}`.trim()
    : null;
  const title = currentResume ? `${currentResume.title} — ${resumeName}` : 'Публичное резюме';
  const description = currentResume
    ? [currentResume.headline, `Резюме ${resumeName} в Online Resume.`].filter(Boolean).join(' ')
    : 'Создавайте и публикуйте резюме с удобными шаблонами.';
  const image =
    currentResume?.photoPath && slug
      ? `${window.location.origin}/api/public/resumes/${encodeURIComponent(slug)}/photo`
      : `${window.location.origin}/og-preview.png`;

  useHead({
    title,
    meta: [
      { name: 'description', content: description },
      { property: 'og:type', content: 'profile' },
      { property: 'og:title', content: title },
      { property: 'og:description', content: description },
      { property: 'og:url', content: window.location.href },
      { property: 'og:image', content: image },
      { name: 'twitter:card', content: 'summary_large_image' },
      { name: 'twitter:title', content: title },
      { name: 'twitter:description', content: description },
      { name: 'twitter:image', content: image },
    ],
  });

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

  if (!currentResume) {
    return (
      <Container size="lg" py="xl">
        <Alert title="Резюме недоступно">
          Ссылка неверна или владелец снял резюме с публикации.
        </Alert>
      </Container>
    );
  }

  const resume = currentResume;
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
