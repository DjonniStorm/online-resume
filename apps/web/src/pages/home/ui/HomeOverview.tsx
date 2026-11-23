import {
  Alert,
  Button,
  Card,
  Container,
  Group,
  Loader,
  SimpleGrid,
  Stack,
  Text,
  Title,
  Tooltip,
} from '@mantine/core';
import { Link } from 'react-router';
import { P, match } from 'ts-pattern';

import { ResumeCard } from '@/entities/resume';
import type { ResumeOverviewDto, ResumeSummaryDto } from '@/shared/api/generated/types.gen';

import styles from './HomeOverview.module.css';
import { ResumeAnalyticsFilter } from './ResumeAnalyticsFilter';

type HomeOverviewProps = {
  error: string | null;
  loading: boolean;
  overview: ResumeOverviewDto | null;
  selectedResumeId: string | null;
  onSelectResume: (resumeId: string | null) => void;
  onDelete: (resume: ResumeSummaryDto) => void;
  deleteDisabled: boolean;
};

export function HomeOverview({
  error,
  loading,
  overview,
  selectedResumeId,
  onSelectResume,
  onDelete,
  deleteDisabled,
}: HomeOverviewProps) {
  return (
    <Container size="xl" py={{ base: 'lg', sm: 'xl' }}>
      {match({ error, loading, overview })
        .with({ error: P.string }, ({ error }) => (
          <Alert color="red">
            {error}
            {selectedResumeId ? (
              <Button
                variant="light"
                color="red"
                size="xs"
                ml="sm"
                onClick={() => onSelectResume(null)}
              >
                Показать все резюме
              </Button>
            ) : null}
          </Alert>
        ))
        .with({ loading: false, overview: P.nonNullable }, ({ overview }) => (
          <OverviewContent
            overview={overview}
            selectedResumeId={selectedResumeId}
            onSelectResume={onSelectResume}
            onDelete={onDelete}
            deleteDisabled={deleteDisabled}
          />
        ))
        .otherwise(() => (
          <Group justify="center" py="xl" role="status">
            <Loader size="sm" />
          </Group>
        ))}
    </Container>
  );
}

function OverviewContent({
  overview,
  selectedResumeId,
  onSelectResume,
  onDelete,
  deleteDisabled,
}: Pick<
  HomeOverviewProps,
  'onDelete' | 'deleteDisabled' | 'selectedResumeId' | 'onSelectResume'
> & { overview: ResumeOverviewDto }) {
  const {
    total,
    publishedCount,
    latestResume,
    viewsTotal,
    viewsLast7Days,
    dailyViews,
    selectedResume,
  } = overview;
  const maxDailyViews = Math.max(1, ...dailyViews.map(({ count }) => count));

  return (
    <Stack gap="xl">
      <Group justify="space-between" align="flex-end" gap="md">
        <div>
          <Title order={1} size="h2">
            Ваши резюме
          </Title>
          <Text c="dimmed" size="sm">
            Всего: {total} · опубликовано: {publishedCount}
          </Text>
        </div>
        <Button component={Link} to="/templates">
          Создать резюме
        </Button>
      </Group>

      <SimpleGrid cols={{ base: 1, md: 2 }} spacing="lg">
        <Card withBorder radius="md" className={styles.analytics}>
          <Stack gap="lg">
            <div>
              <Group justify="space-between" align="flex-end" gap="sm" mb="sm">
                <Text fw={600}>Просмотры за 7 дней</Text>
                <ResumeAnalyticsFilter
                  selectedResume={selectedResume}
                  value={selectedResumeId}
                  onChange={onSelectResume}
                />
              </Group>
              <Group align="baseline" gap="lg">
                <Title order={2} size="h1">
                  {viewsLast7Days}
                </Title>
                <Text size="sm" c="dimmed">
                  За всё время: {viewsTotal}
                </Text>
              </Group>
            </div>
            {viewsLast7Days > 0 ? (
              <div
                className={styles.chart}
                role="group"
                aria-label="Посещения публичных резюме по дням за последние 7 дней"
              >
                {dailyViews.map(({ date, count }) => (
                  <Tooltip key={date} label={`${formatDay(date)}: ${count}`}>
                    <div
                      className={styles.day}
                      role="img"
                      aria-label={`${formatDay(date)}: ${count}`}
                      tabIndex={0}
                    >
                      <div className={styles.barArea}>
                        <div
                          className={styles.bar}
                          style={{ height: `${(count / maxDailyViews) * 100}%` }}
                        />
                      </div>
                      <Text size="xs" c="dimmed" ta="center">
                        {formatWeekday(date)}
                      </Text>
                    </div>
                  </Tooltip>
                ))}
              </div>
            ) : (
              <Text size="sm" c="dimmed" className={styles.emptyViews}>
                {selectedResume
                  ? 'За последние 7 дней это резюме не просматривали.'
                  : publishedCount > 0
                    ? 'Публичные ссылки пока не открывали за последние 7 дней.'
                    : 'Опубликуйте резюме, чтобы его можно было открыть по ссылке.'}
              </Text>
            )}
          </Stack>
        </Card>

        <Stack gap="sm">
          <Title order={2} size="h4">
            Недавно обновлено
          </Title>
          {match(latestResume)
            .with(P.nonNullable, (resume) => (
              <ResumeCard resume={resume} onDelete={onDelete} deleteDisabled={deleteDisabled} />
            ))
            .otherwise(() => (
              <Alert title="Резюме ещё нет">Выберите шаблон, чтобы создать первое резюме.</Alert>
            ))}
        </Stack>
      </SimpleGrid>
    </Stack>
  );
}

function formatDay(value: string): string {
  return new Intl.DateTimeFormat('ru-RU', {
    day: 'numeric',
    month: 'long',
    timeZone: 'UTC',
  }).format(new Date(value));
}

function formatWeekday(value: string): string {
  return new Intl.DateTimeFormat('ru-RU', { weekday: 'short', timeZone: 'UTC' }).format(
    new Date(value),
  );
}
