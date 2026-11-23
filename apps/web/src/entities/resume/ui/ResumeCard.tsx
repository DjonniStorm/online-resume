import { ActionIcon, Badge, Card, Group, Menu, Stack, Text, Title } from '@mantine/core';
import { IconEye } from '@tabler/icons-react';
import { Link } from 'react-router';

import type { ResumeSummaryDto } from '@/shared/api/generated/types.gen';

import styles from './ResumeCard.module.css';
import { ResumeCardPreview } from './ResumeCardPreview';

type ResumeCardProps = {
  resume: ResumeSummaryDto;
  onDelete: (resume: ResumeSummaryDto) => void;
  deleteDisabled?: boolean;
};

export function ResumeCard({ resume, onDelete, deleteDisabled = false }: ResumeCardProps) {
  return (
    <Card withBorder radius="md" className={styles.card}>
      <Link
        to={`/resumes/${resume.id}/edit`}
        aria-label={`Открыть резюме ${resume.title}`}
        className={styles.link}
      />
      <Group align="stretch" wrap="nowrap" gap="lg">
        <ResumeCardPreview resume={resume} />
        <Stack gap={6} className={styles.details}>
          <Title order={3} size="h4" className={styles.title}>
            {resume.title}
          </Title>
          <Text size="sm" c="dimmed">
            {resume.firstName} {resume.lastName}
          </Text>
          <Text size="xs" c="dimmed">
            {resume.template.name}
          </Text>
          {resume.isPublished ? (
            <Badge variant="light" size="sm" w="fit-content">
              Опубликовано
            </Badge>
          ) : null}
          {resume.deletionScheduledAt ? (
            <Badge variant="light" color="orange" size="sm" w="fit-content">
              Удаление запланировано
            </Badge>
          ) : null}
          <Group justify="space-between" align="flex-end" gap="xs" mt="auto" wrap="wrap">
            <Group gap={4} wrap="nowrap">
              <IconEye size={15} color="var(--mantine-color-dimmed)" aria-hidden="true" />
              <Text size="xs" c="dimmed">
                Просмотры за 7 дней: {resume.viewsLast7Days}
              </Text>
            </Group>
            <Text size="xs" c="dimmed">
              Обновлено: {formatDate(resume.updatedAt)}
            </Text>
          </Group>
        </Stack>
      </Group>
      <Menu position="bottom-end" withinPortal>
        <Menu.Target>
          <ActionIcon
            variant="subtle"
            aria-label={`Действия с резюме ${resume.title}`}
            className={styles.actions}
          >
            ⋯
          </ActionIcon>
        </Menu.Target>
        <Menu.Dropdown>
          <Menu.Item component={Link} to={`/resumes/${resume.id}/edit`}>
            Открыть
          </Menu.Item>
          <Menu.Item component={Link} to={`/resumes/${resume.id}/preview`}>
            Предпросмотр
          </Menu.Item>
          <Menu.Item component={Link} to={`/?resumeId=${encodeURIComponent(resume.id)}`}>
            Статистика
          </Menu.Item>
          <Menu.Item component={Link} to={`/resumes/${resume.id}/preview?print=1`}>
            Сохранить как PDF
          </Menu.Item>
          <Menu.Divider />
          <Menu.Item color="red" disabled={deleteDisabled} onClick={() => onDelete(resume)}>
            {resume.deletionScheduledAt ? 'Управлять удалением' : 'Удалить'}
          </Menu.Item>
        </Menu.Dropdown>
      </Menu>
    </Card>
  );
}

function formatDate(value: string): string {
  return new Intl.DateTimeFormat('ru-RU', { dateStyle: 'medium' }).format(new Date(value));
}
