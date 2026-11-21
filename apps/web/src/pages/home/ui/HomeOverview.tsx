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
import { P, match } from 'ts-pattern';

import { ResumeCardPreview } from '@/entities/resume';
import type { ResumeOverviewDto } from '@/shared/api/generated/types.gen';

type HomeOverviewProps = {
  error: string | null;
  loading: boolean;
  overview: ResumeOverviewDto | null;
};

export function HomeOverview({ error, loading, overview }: HomeOverviewProps) {
  return (
    <Container size="lg" py="xl">
      {match({ error, loading, overview })
        .with({ error: P.string }, ({ error }) => <Alert color="red">{error}</Alert>)
        .with({ loading: false, overview: P.nonNullable }, ({ overview }) => (
          <OverviewContent overview={overview} />
        ))
        .otherwise(() => (
          <Group justify="center" py="xl" role="status">
            <Loader size="sm" />
          </Group>
        ))}
    </Container>
  );
}

function OverviewContent({ overview }: { overview: ResumeOverviewDto }) {
  const { total, publishedCount, templateCount, latestResume } = overview;

  return (
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
      {match(latestResume)
        .with(P.nonNullable, (resume) => (
          <Stack gap="sm">
            <Title order={3}>Последнее резюме</Title>
            <Card component={Link} to={`/resumes/${resume.id}/edit`} withBorder shadow="sm" p={0}>
              <ResumeCardPreview resume={resume} />
              <Stack gap={4} p="md">
                <Group justify="space-between" align="flex-start">
                  <Stack gap={2}>
                    <Title order={3} size="h4">
                      {resume.title}
                    </Title>
                    <Text c="dimmed">
                      {resume.firstName} {resume.lastName}
                    </Text>
                  </Stack>
                  <Text size="sm" c="dimmed">
                    {resume.template.name}
                  </Text>
                </Group>
              </Stack>
            </Card>
          </Stack>
        ))
        .otherwise(() => (
          <Alert title="Резюме ещё нет">
            Откройте раздел «Мои резюме», чтобы создать первое резюме.
          </Alert>
        ))}
    </Stack>
  );
}
