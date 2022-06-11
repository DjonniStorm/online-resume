import { Divider, Group, Paper, Stack, TextInput, Title } from '@mantine/core';

import type { EditorForm } from '../model';

type BasicInformationFieldsProps = {
  form: EditorForm;
  fields: Set<string>;
};

export function BasicInformationFields({ form, fields }: BasicInformationFieldsProps) {
  return (
    <Paper withBorder p="lg">
      <Stack gap="md">
        <Title order={2} size="h3" fw={600}>
          Основная информация
        </Title>
        <TextInput label="Название резюме" {...form.getInputProps('title')} />
        {fields.has('FIRST_NAME') || fields.has('LAST_NAME') ? (
          <Group grow>
            {fields.has('FIRST_NAME') ? (
              <TextInput label="Имя" {...form.getInputProps('firstName')} />
            ) : null}
            {fields.has('LAST_NAME') ? (
              <TextInput label="Фамилия" {...form.getInputProps('lastName')} />
            ) : null}
          </Group>
        ) : null}
        {fields.has('HEADLINE') ? (
          <TextInput
            label="Заголовок"
            placeholder="Frontend-разработчик"
            {...form.getInputProps('headline')}
          />
        ) : null}
        {['EMAIL', 'PHONE', 'LOCATION', 'GITHUB_URL', 'TELEGRAM_HANDLE', 'WEBSITE_URL'].some(
          (field) => fields.has(field),
        ) ? (
          <>
            <Divider label="Контакты" />
            <Group grow>
              {fields.has('EMAIL') ? (
                <TextInput label="Email" type="email" {...form.getInputProps('email')} />
              ) : null}
              {fields.has('PHONE') ? (
                <TextInput label="Телефон" {...form.getInputProps('phone')} />
              ) : null}
            </Group>
            {fields.has('LOCATION') ? (
              <TextInput label="Город" {...form.getInputProps('location')} />
            ) : null}
            {fields.has('GITHUB_URL') || fields.has('TELEGRAM_HANDLE') ? (
              <Group grow>
                {fields.has('GITHUB_URL') ? (
                  <TextInput
                    label="GitHub"
                    placeholder="name или https://github.com/name"
                    {...form.getInputProps('githubUrl')}
                  />
                ) : null}
                {fields.has('TELEGRAM_HANDLE') ? (
                  <TextInput
                    label="Telegram"
                    placeholder="@name"
                    {...form.getInputProps('telegramHandle')}
                  />
                ) : null}
              </Group>
            ) : null}
            {fields.has('WEBSITE_URL') ? (
              <TextInput
                label="Сайт"
                placeholder="example.com или https://example.com"
                {...form.getInputProps('websiteUrl')}
              />
            ) : null}
          </>
        ) : null}
      </Stack>
    </Paper>
  );
}
