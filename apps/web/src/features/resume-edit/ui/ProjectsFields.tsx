import { Button, Group, Paper, Stack, TextInput, Textarea } from '@mantine/core';

import { type EditorForm, emptyProject, removeListItem } from '../model';
import { EditableList } from './EditableList';

export function ProjectsFields({ form }: { form: EditorForm }) {
  return (
    <EditableList
      emptyLabel="Добавьте проект"
      onAdd={() => form.setFieldValue('projects', [...form.values.projects, emptyProject()])}
    >
      {form.values.projects.map((_item, index) => (
        <Paper key={index} withBorder p="sm">
          <Stack gap="sm">
            <Group grow>
              <TextInput label="Название" {...form.getInputProps(`projects.${index}.name`)} />
              <TextInput label="Роль" {...form.getInputProps(`projects.${index}.role`)} />
            </Group>
            <TextInput label="Ссылка" {...form.getInputProps(`projects.${index}.url`)} />
            <Group grow>
              <TextInput
                label="Начало"
                type="date"
                {...form.getInputProps(`projects.${index}.startDate`)}
              />
              <TextInput
                label="Окончание"
                type="date"
                {...form.getInputProps(`projects.${index}.endDate`)}
              />
            </Group>
            <Textarea
              label="Описание"
              autosize
              minRows={3}
              {...form.getInputProps(`projects.${index}.description`)}
            />
            <Button
              color="red"
              variant="subtle"
              onClick={() => removeListItem(form, 'projects', index)}
            >
              Удалить проект
            </Button>
          </Stack>
        </Paper>
      ))}
    </EditableList>
  );
}
