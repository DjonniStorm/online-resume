import { Alert, Anchor, Button, Group, Stack, TextInput } from '@mantine/core';
import { observer } from 'mobx-react-lite';
import { useState } from 'react';

import { StoreKey, useStores } from '@/app/store';

type ResumePublicationProps = {
  id: string;
  publicSlug: string | null;
  onChange: (slug: string | null) => void;
};

export const ResumePublication = observer(
  ({ id, publicSlug, onChange }: ResumePublicationProps) => {
    const { resumes, requests, errors } = useStores(
      StoreKey.Resumes,
      StoreKey.Requests,
      StoreKey.Errors,
    );
    const [copyError, setCopyError] = useState(false);
    const publicUrl = publicSlug ? `${window.location.origin}/r/${publicSlug}` : null;
    const publishing = requests.latest('resumes.publish')?.status === 'pending';
    const unpublishing = requests.latest('resumes.unpublish')?.status === 'pending';

    const publish = async () => {
      const slug = await resumes.publish(id);
      if (slug) {
        onChange(slug);
      }
    };

    const unpublish = async () => {
      if (await resumes.unpublish(id)) {
        onChange(null);
      }
    };

    const copy = async () => {
      if (!publicUrl) {
        return;
      }
      try {
        await navigator.clipboard.writeText(publicUrl);
        setCopyError(false);
      } catch {
        setCopyError(true);
      }
    };

    return (
      <Stack gap="xs">
        {publicUrl ? (
          <Group gap="xs" align="flex-end">
            <TextInput label="Публичная ссылка" value={publicUrl} readOnly style={{ flex: 1 }} />
            <Button variant="light" onClick={() => void copy()}>
              Копировать
            </Button>
            <Button
              variant="subtle"
              color="red"
              loading={unpublishing}
              onClick={() => void unpublish()}
            >
              Снять с публикации
            </Button>
            <Anchor href={publicUrl} target="_blank" rel="noopener noreferrer" size="sm">
              Открыть ссылку
            </Anchor>
          </Group>
        ) : (
          <Button loading={publishing} onClick={() => void publish()}>
            Опубликовать резюме
          </Button>
        )}
        {errors.forOperation('resumes.publish') || errors.forOperation('resumes.unpublish') ? (
          <Alert color="red">Не удалось изменить публикацию. Попробуйте ещё раз.</Alert>
        ) : null}
        {copyError ? <Alert color="red">Не удалось скопировать ссылку.</Alert> : null}
      </Stack>
    );
  },
);
