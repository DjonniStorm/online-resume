import { Button, Group, Paper, Stack, TextInput } from '@mantine/core';

import { type EditorForm, emptyCertificate, removeListItem } from '../model';
import { EditableList } from './EditableList';

export function CertificatesFields({ form }: { form: EditorForm }) {
  return (
    <EditableList
      emptyLabel="Добавьте сертификат"
      onAdd={() =>
        form.setFieldValue('certificates', [...form.values.certificates, emptyCertificate()])
      }
    >
      {form.values.certificates.map((_item, index) => (
        <Paper key={index} withBorder p="sm">
          <Stack gap="sm">
            <Group grow>
              <TextInput label="Название" {...form.getInputProps(`certificates.${index}.name`)} />
              <TextInput
                label="Организация"
                {...form.getInputProps(`certificates.${index}.issuer`)}
              />
            </Group>
            <Group grow>
              <TextInput
                label="Дата выдачи"
                type="date"
                {...form.getInputProps(`certificates.${index}.issuedAt`)}
              />
              <TextInput
                label="Действует до"
                type="date"
                {...form.getInputProps(`certificates.${index}.expiresAt`)}
              />
            </Group>
            <TextInput
              label="Ссылка на сертификат"
              {...form.getInputProps(`certificates.${index}.credentialUrl`)}
            />
            <Button
              color="red"
              variant="subtle"
              onClick={() => removeListItem(form, 'certificates', index)}
            >
              Удалить сертификат
            </Button>
          </Stack>
        </Paper>
      ))}
    </EditableList>
  );
}
