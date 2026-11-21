import { Alert, Button, Group, Modal, Stack, TextInput, Textarea } from '@mantine/core';
import { useForm } from '@mantine/form';
import { observer } from 'mobx-react-lite';

import { StoreKey, useStores } from '@/app/store';
import type { CreateResumeDto, TemplateDto } from '@/shared/api/generated/types.gen';

type CreateResumeModalProps = {
  template: TemplateDto;
  opened: boolean;
  onClose: () => void;
  onCreated: () => void;
};

export const CreateResumeModal = observer(
  ({ template, opened, onClose, onCreated }: CreateResumeModalProps) => {
    const { requests, errors, resumes } = useStores(
      StoreKey.Requests,
      StoreKey.Errors,
      StoreKey.Resumes,
    );
    const createRequest = requests.latest('resumes.create');
    const createError = errors.forOperation('resumes.create');
    const form = useForm<CreateResumeDto>({
      mode: 'uncontrolled',
      initialValues: {
        title: '',
        firstName: '',
        lastName: '',
        templateSlug: template.slug,
        headline: '',
        about: '',
      },
      validate: {
        title: (value) => (value.trim() ? null : 'Введите название резюме'),
        firstName: (value) => (value.trim() ? null : 'Введите имя'),
        lastName: (value) => (value.trim() ? null : 'Введите фамилию'),
      },
    });

    const submit = async (values: CreateResumeDto) => {
      const success = await resumes.create({
        ...values,
        title: values.title.trim(),
        firstName: values.firstName.trim(),
        lastName: values.lastName.trim(),
        headline: values.headline?.trim() || undefined,
        about: values.about?.trim() || undefined,
      });
      if (success) {
        form.reset();
        onCreated();
        return;
      }
    };

    return (
      <Modal opened={opened} onClose={onClose} title={`Создать резюме · ${template.name}`} centered>
        <form onSubmit={form.onSubmit((values) => void submit(values))}>
          <Stack>
            <TextInput
              label="Название"
              placeholder="Резюме frontend-разработчика"
              {...form.getInputProps('title')}
              key={form.key('title')}
            />
            <Group grow>
              <TextInput
                label="Имя"
                {...form.getInputProps('firstName')}
                key={form.key('firstName')}
              />
              <TextInput
                label="Фамилия"
                {...form.getInputProps('lastName')}
                key={form.key('lastName')}
              />
            </Group>
            <TextInput
              label="Заголовок"
              placeholder="Frontend-разработчик"
              {...form.getInputProps('headline')}
              key={form.key('headline')}
            />
            <Textarea
              label="О себе"
              autosize
              minRows={3}
              {...form.getInputProps('about')}
              key={form.key('about')}
            />
            {createError ? (
              <Alert color="red">
                {createError.status === 404
                  ? 'Выбранный шаблон больше недоступен.'
                  : 'Не удалось создать резюме. Попробуйте ещё раз.'}
              </Alert>
            ) : null}
            <Group justify="flex-end">
              <Button
                variant="subtle"
                onClick={onClose}
                disabled={createRequest?.status === 'pending'}
              >
                Отмена
              </Button>
              <Button type="submit" loading={createRequest?.status === 'pending'}>
                Создать
              </Button>
            </Group>
          </Stack>
        </form>
      </Modal>
    );
  },
);
