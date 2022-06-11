import { Accordion, ActionIcon, Group, Paper, Select, Stack, Text, Title } from '@mantine/core';
import { match } from 'ts-pattern';

import type { ResumeEditorSection } from '@/entities/resume';
import type { ResumeDto } from '@/shared/api/generated/types.gen';

import { type EditorForm, moveSection, sectionLabels } from '../model';
import { SectionFields } from './SectionFields';

export function ResumeSections({ form, resume }: { form: EditorForm; resume: ResumeDto }) {
  const editable = (section: ResumeEditorSection) =>
    section.type !== 'PROFILE' &&
    section.type !== 'CONTACTS' &&
    resume.template.sections.some((item) => item.type === section.type);
  const activeSections = form.values.sections.filter(
    (section) => section.isVisible && editable(section),
  );
  const hiddenSections = form.values.sections.filter(
    (section) => !section.isVisible && editable(section),
  );
  const regions = [
    ...new Set(
      activeSections.map(
        (section) => resume.template.sections.find((item) => item.type === section.type)?.region,
      ),
    ),
  ].filter((region): region is NonNullable<typeof region> => Boolean(region));
  const addSection = (type: ResumeEditorSection['type']) => {
    form.setFieldValue(
      'sections',
      form.values.sections.map((section) =>
        section.type === type ? { ...section, isVisible: true } : section,
      ),
    );
  };

  const removeSection = (type: ResumeEditorSection['type']) => {
    form.setFieldValue(
      'sections',
      form.values.sections.map((section) =>
        section.type === type ? { ...section, isVisible: false } : section,
      ),
    );
  };

  const move = (type: ResumeEditorSection['type'], direction: -1 | 1) => {
    form.setFieldValue('sections', moveSection(form.values.sections, type, direction, resume));
  };
  return (
    <Paper withBorder p="lg">
      <Stack gap="md">
        <div>
          <Title order={2} size="h3" fw={600}>
            Разделы резюме
          </Title>
          <Text size="sm" c="dimmed">
            Порядок меняется внутри колонок выбранного шаблона.
          </Text>
        </div>
        {regions.map((region) => {
          const regionSections = activeSections.filter((section) =>
            resume.template.sections.some(
              (item) => item.type === section.type && item.region === region,
            ),
          );
          const movable = regionSections.filter(
            (section) =>
              resume.template.sections.find((item) => item.type === section.type)?.canReorder,
          );
          return (
            <Stack key={region} gap="xs">
              <Text fw={600} size="sm">
                {match(region)
                  .with('SIDEBAR', () => 'Боковая колонка')
                  .with('MAIN', () => 'Основная колонка')
                  .otherwise(() => 'Дополнительные разделы')}
              </Text>
              <Accordion variant="separated">
                {regionSections.map((section) => (
                  <Accordion.Item key={section.type} value={section.type}>
                    <Group wrap="nowrap" gap="xs">
                      <Accordion.Control style={{ flex: 1, minWidth: 0 }}>
                        <Text>{sectionLabels[section.type]}</Text>
                      </Accordion.Control>
                      <Group gap={4} wrap="nowrap" pr="sm">
                        <ActionIcon
                          variant="subtle"
                          aria-label="Переместить раздел выше"
                          disabled={movable.findIndex((item) => item.type === section.type) <= 0}
                          onClick={() => move(section.type, -1)}
                        >
                          ↑
                        </ActionIcon>
                        <ActionIcon
                          variant="subtle"
                          aria-label="Переместить раздел ниже"
                          disabled={
                            movable.findIndex((item) => item.type === section.type) < 0 ||
                            movable.findIndex((item) => item.type === section.type) ===
                              movable.length - 1
                          }
                          onClick={() => move(section.type, 1)}
                        >
                          ↓
                        </ActionIcon>
                        <ActionIcon
                          variant="subtle"
                          color="red"
                          aria-label="Скрыть раздел"
                          onClick={() => removeSection(section.type)}
                        >
                          ×
                        </ActionIcon>
                      </Group>
                    </Group>
                    <Accordion.Panel>
                      <SectionFields type={section.type} form={form} />
                    </Accordion.Panel>
                  </Accordion.Item>
                ))}
              </Accordion>
            </Stack>
          );
        })}
        {hiddenSections.length > 0 ? (
          <Group align="end">
            <Select
              label="Добавить раздел"
              placeholder="Выберите раздел"
              data={hiddenSections.map((section) => ({
                value: section.type,
                label: sectionLabels[section.type],
              }))}
              onChange={(value) => {
                if (value) {
                  addSection(value as ResumeEditorSection['type']);
                }
              }}
              searchable
              clearable
            />
          </Group>
        ) : null}
      </Stack>
    </Paper>
  );
}
