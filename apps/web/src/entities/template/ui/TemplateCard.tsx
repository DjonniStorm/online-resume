import { Button, Card, Group, Stack, Text, Title } from '@mantine/core';
import type { ReactNode } from 'react';

import type { TemplateDto } from '@/shared/api/generated/types.gen';

import styles from './TemplateCard.module.css';

type TemplateCardProps = {
  template: TemplateDto;
  preview: ReactNode;
  selected: boolean;
  onSelect: (template: TemplateDto) => void;
};

export function TemplateCard({ template, preview, selected, onSelect }: TemplateCardProps) {
  return (
    <Card withBorder shadow={selected ? 'md' : 'sm'} radius="md" padding="md">
      <Stack gap="md">
        <div className={styles.previewFrame}>{preview}</div>
        <Stack gap={4}>
          <Title order={3} size="h4">
            {template.name}
          </Title>
          <Text size="sm" c="dimmed" lineClamp={2}>
            {template.description}
          </Text>
        </Stack>
        <Group justify="space-between" align="center">
          <Text size="xs" c="dimmed">
            {template.sections.length} разделов
          </Text>
          <Button variant={selected ? 'filled' : 'light'} onClick={() => onSelect(template)}>
            {selected ? 'Выбран' : 'Посмотреть'}
          </Button>
        </Group>
      </Stack>
    </Card>
  );
}
