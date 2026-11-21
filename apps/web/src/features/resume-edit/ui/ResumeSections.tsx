import { Accordion, ActionIcon, Group, Paper, Select, Stack, Text, Title } from '@mantine/core';

import type { ResumeEditorSection } from '@/entities/resume';
import type { ResumeDto } from '@/shared/api/generated/types.gen';

import { type EditorForm, canMoveSection, moveSection, sectionLabels } from '../model';
import { SectionFields } from './SectionFields';

export function ResumeSections({ form, resume }: { form: EditorForm; resume: ResumeDto }) {
  const activeSections = form.values.sections.filter((section) => section.isVisible);
  const hiddenSections = form.values.sections.filter((section) => !section.isVisible);
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

  const move = (index: number, direction: -1 | 1) => {
    form.setFieldValue('sections', moveSection(form.values.sections, index, direction, resume));
  };
  return (
    <Paper withBorder p="lg">
      <Stack gap="md">
        <div>
          <Title order={2}>Разделы резюме</Title>
          <Text size="sm" c="dimmed">
            Порядок меняется внутри колонок выбранного шаблона.
          </Text>
        </div>
        <Accordion variant="separated">
          {activeSections.map((section, index) => (
            <Accordion.Item key={section.type} value={section.type}>
              <Group wrap="nowrap" gap="xs">
                <Accordion.Control style={{ flex: 1, minWidth: 0 }}>
                  <Text>{sectionLabels[section.type]}</Text>
                </Accordion.Control>
                <Group gap={4} wrap="nowrap" pr="sm">
                  <ActionIcon
                    variant="subtle"
                    aria-label="Переместить раздел выше"
                    disabled={index === 0 || !canMoveSection(activeSections, index, -1, resume)}
                    onClick={() => move(index, -1)}
                  >
                    ↑
                  </ActionIcon>
                  <ActionIcon
                    variant="subtle"
                    aria-label="Переместить раздел ниже"
                    disabled={
                      index === activeSections.length - 1 ||
                      !canMoveSection(activeSections, index, 1, resume)
                    }
                    onClick={() => move(index, 1)}
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
