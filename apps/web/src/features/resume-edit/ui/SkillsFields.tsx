import { ActionIcon, Group, Select, TextInput } from '@mantine/core';

import { type EditorForm, removeListItem } from '../model';
import { EditableList } from './EditableList';

export function SkillsFields({ form }: { form: EditorForm }) {
  return (
    <EditableList
      emptyLabel="Добавьте навык"
      onAdd={() => form.setFieldValue('skills', [...form.values.skills, { name: '', level: '' }])}
    >
      {form.values.skills.map((_item, index) => (
        <Group key={index} grow align="end">
          <TextInput label="Навык" {...form.getInputProps(`skills.${index}.name`)} />
          <Select
            label="Уровень"
            placeholder="Не указан"
            data={['Базовый', 'Уверенный', 'Продвинутый']}
            clearable
            {...form.getInputProps(`skills.${index}.level`)}
          />
          <ActionIcon
            color="red"
            variant="subtle"
            aria-label="Удалить навык"
            onClick={() => removeListItem(form, 'skills', index)}
          >
            ×
          </ActionIcon>
        </Group>
      ))}
    </EditableList>
  );
}
