import { ActionIcon, Badge, Card, Group, Menu, Stack, Text, Title } from '@mantine/core';
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
          <Text size="xs" c="dimmed" mt="auto">
            Обновлено: {formatDate(resume.updatedAt)}
          </Text>
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
          <Menu.Item component={Link} to={`/resumes/${resume.id}/preview?print=1`}>
            Сохранить как PDF
          </Menu.Item>
          <Menu.Divider />
          <Menu.Item color="red" disabled={deleteDisabled} onClick={() => onDelete(resume)}>
            Удалить
          </Menu.Item>
        </Menu.Dropdown>
      </Menu>
    </Card>
  );
}

function formatDate(value: string): string {
  return new Intl.DateTimeFormat('ru-RU', { dateStyle: 'medium' }).format(new Date(value));
}
