import { Button, Group, Paper, Stack, TextInput, Textarea } from '@mantine/core';

import { type EditorForm, emptyEducation, removeListItem } from '../model';
import { EditableList } from './EditableList';

export function EducationFields({ form }: { form: EditorForm }) {
  return (
    <EditableList
      emptyLabel="Добавьте образование"
      onAdd={() => form.setFieldValue('educations', [...form.values.educations, emptyEducation()])}
    >
      {form.values.educations.map((_item, index) => (
        <Paper key={index} withBorder p="sm">
          <Stack gap="sm">
            <TextInput
              label="Учебное заведение"
              {...form.getInputProps(`educations.${index}.institution`)}
            />
            <Group grow>
              <TextInput label="Степень" {...form.getInputProps(`educations.${index}.degree`)} />
              <TextInput
                label="Направление"
                {...form.getInputProps(`educations.${index}.fieldOfStudy`)}
              />
            </Group>
            <Group grow>
              <TextInput
                label="Начало"
                type="date"
                {...form.getInputProps(`educations.${index}.startDate`)}
              />
              <TextInput
                label="Окончание"
                type="date"
                {...form.getInputProps(`educations.${index}.endDate`)}
              />
            </Group>
            <TextInput label="Место" {...form.getInputProps(`educations.${index}.location`)} />
            <Textarea
              label="Описание"
              autosize
              minRows={3}
              {...form.getInputProps(`educations.${index}.description`)}
            />
            <Button
              color="red"
              variant="subtle"
              onClick={() => removeListItem(form, 'educations', index)}
            >
              Удалить образование
            </Button>
          </Stack>
        </Paper>
      ))}
    </EditableList>
  );
}
