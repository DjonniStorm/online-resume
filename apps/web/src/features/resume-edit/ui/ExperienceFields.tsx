import { Button, Checkbox, Group, Paper, Stack, TextInput, Textarea } from '@mantine/core';

import { type EditorForm, emptyExperience, removeListItem } from '../model';
import { EditableList } from './EditableList';

export function ExperienceFields({ form }: { form: EditorForm }) {
  return (
    <EditableList
      emptyLabel="Добавьте первый опыт работы"
      onAdd={() =>
        form.setFieldValue('experiences', [...form.values.experiences, emptyExperience()])
      }
    >
      {form.values.experiences.map((item, index) => (
        <Paper key={index} withBorder p="sm">
          <Stack gap="sm">
            <Group grow>
              <TextInput label="Компания" {...form.getInputProps(`experiences.${index}.company`)} />
              <TextInput
                label="Должность"
                {...form.getInputProps(`experiences.${index}.position`)}
              />
            </Group>
            <Group grow>
              <TextInput
                label="Начало"
                type="date"
                {...form.getInputProps(`experiences.${index}.startDate`)}
              />
              <TextInput
                label="Окончание"
                type="date"
                disabled={item.isCurrent}
                {...form.getInputProps(`experiences.${index}.endDate`)}
              />
            </Group>
            <Checkbox
              label="Работаю сейчас"
              {...form.getInputProps(`experiences.${index}.isCurrent`, { type: 'checkbox' })}
            />
            <TextInput label="Место" {...form.getInputProps(`experiences.${index}.location`)} />
            <Textarea
              label="Описание"
              autosize
              minRows={3}
              {...form.getInputProps(`experiences.${index}.description`)}
            />
            <Button
              color="red"
              variant="subtle"
              onClick={() => removeListItem(form, 'experiences', index)}
            >
              Удалить опыт
            </Button>
          </Stack>
        </Paper>
      ))}
    </EditableList>
  );
}
