import { ActionIcon, Group, TextInput } from '@mantine/core';

import { type EditorForm, removeListItem } from '../model';
import { EditableList } from './EditableList';

export function LanguagesFields({ form }: { form: EditorForm }) {
  return (
    <EditableList
      emptyLabel="Добавьте язык"
      onAdd={() =>
        form.setFieldValue('languages', [...form.values.languages, { name: '', proficiency: '' }])
      }
    >
      {form.values.languages.map((_item, index) => (
        <Group key={index} grow align="end">
          <TextInput label="Язык" {...form.getInputProps(`languages.${index}.name`)} />
          <TextInput
            label="Уровень"
            placeholder="B2, родной"
            {...form.getInputProps(`languages.${index}.proficiency`)}
          />
          <ActionIcon
            color="red"
            variant="subtle"
            aria-label="Удалить язык"
            onClick={() => removeListItem(form, 'languages', index)}
          >
            ×
          </ActionIcon>
        </Group>
      ))}
    </EditableList>
  );
}
