import {
  Alert,
  Card,
  Container,
  Group,
  Loader,
  SimpleGrid,
  Stack,
  Text,
  Title,
} from '@mantine/core';
import { Link } from 'react-router';

import { ResumeCardPreview } from '@/entities/resume';
import type { ResumeSummaryDto } from '@/shared/api/generated/types.gen';

type HomeOverviewProps = {
  error: string | null;
  loading: boolean;
  resumes: ResumeSummaryDto[];
  total: number;
};

export function HomeOverview({ error, loading, resumes, total }: HomeOverviewProps) {
  if (loading) {
    return (
      <Container size="lg" py="xl">
        <Group justify="center" py="xl" role="status">
          <Loader size="sm" />
        </Group>
      </Container>
    );
  }

  if (error) {
    return (
      <Container size="lg" py="xl">
        <Alert color="red">{error}</Alert>
      </Container>
    );
  }

  const publishedCount = resumes.filter((resume) => resume.isPublished).length;
  const templateCount = new Set(resumes.map((resume) => resume.template.name)).size;
  const latestResume = resumes[0];

  return (
    <Container size="lg" py="xl">
      <Stack gap="xl">
        <Title order={1} size="h2">
          Обзор
        </Title>
        <SimpleGrid cols={{ base: 1, sm: 3 }}>
          <Card withBorder>
            <Text size="sm" c="dimmed">
              Всего резюме
            </Text>
            <Title order={2}>{total}</Title>
          </Card>
          <Card withBorder>
            <Text size="sm" c="dimmed">
              Опубликовано
            </Text>
            <Title order={2}>{publishedCount}</Title>
          </Card>
          <Card withBorder>
            <Text size="sm" c="dimmed">
              Шаблонов используется
            </Text>
            <Title order={2}>{templateCount}</Title>
          </Card>
        </SimpleGrid>
        {latestResume ? (
          <Stack gap="sm">
            <Title order={3}>Последнее резюме</Title>
            <Card
              component={Link}
              to={`/resumes/${latestResume.id}/edit`}
              withBorder
              shadow="sm"
              p={0}
            >
              <ResumeCardPreview resume={latestResume} />
              <Stack gap={4} p="md">
                <Group justify="space-between" align="flex-start">
                  <Stack gap={2}>
                    <Title order={3} size="h4">
                      {latestResume.title}
                    </Title>
                    <Text c="dimmed">
                      {latestResume.firstName} {latestResume.lastName}
                    </Text>
                  </Stack>
                  <Text size="sm" c="dimmed">
                    {latestResume.template.name}
                  </Text>
                </Group>
              </Stack>
            </Card>
          </Stack>
        ) : (
          <Alert title="Резюме ещё нет">
            Откройте раздел «Мои резюме», чтобы создать первое резюме.
          </Alert>
        )}
      </Stack>
    </Container>
  );
}
