import { Divider, Group, Paper, Stack, TextInput, Textarea, Title } from '@mantine/core';

import type { EditorForm } from '../model';

export function BasicInformationFields({ form }: { form: EditorForm }) {
  return (
    <Paper withBorder p="lg">
      <Stack gap="md">
        <Title order={2} size="h3">
          Основная информация
        </Title>
        <TextInput label="Название резюме" {...form.getInputProps('title')} />
        <Group grow>
          <TextInput label="Имя" {...form.getInputProps('firstName')} />
          <TextInput label="Фамилия" {...form.getInputProps('lastName')} />
        </Group>
        <TextInput
          label="Заголовок"
          placeholder="Frontend-разработчик"
          {...form.getInputProps('headline')}
        />
        <Textarea label="О себе" autosize minRows={4} {...form.getInputProps('about')} />
        <Divider label="Контакты" />
        <Group grow>
          <TextInput label="Email" type="email" {...form.getInputProps('email')} />
          <TextInput label="Телефон" {...form.getInputProps('phone')} />
        </Group>
        <TextInput label="Город" {...form.getInputProps('location')} />
        <Group grow>
          <TextInput
            label="GitHub"
            placeholder="github.com/name"
            {...form.getInputProps('githubUrl')}
          />
          <TextInput
            label="Telegram"
            placeholder="@name"
            {...form.getInputProps('telegramHandle')}
          />
        </Group>
        <TextInput label="Сайт" placeholder="example.com" {...form.getInputProps('websiteUrl')} />
      </Stack>
    </Paper>
  );
}
