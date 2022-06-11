import { Alert, Button, FileButton, Group, Image, Paper, Stack, Text, Title } from '@mantine/core';
import { useRef, useState } from 'react';

import type { ResumeDto } from '@/shared/api/generated/types.gen';

const maxPhotoSize = 5 * 1024 * 1024;
const acceptedTypes = ['image/jpeg', 'image/png', 'image/webp'];

type ResumePhotoFieldProps = {
  photoUrl: string | null;
  hasPhoto: boolean;
  busy: boolean;
  error: { status?: number } | undefined;
  onUpload: (file: File) => Promise<ResumeDto | null>;
  onDelete: () => Promise<ResumeDto | null>;
};

export function ResumePhotoField({
  photoUrl,
  hasPhoto,
  busy,
  error,
  onUpload,
  onDelete,
}: ResumePhotoFieldProps) {
  const [validationError, setValidationError] = useState<string | null>(null);
  const resetFile = useRef<() => void>(null);

  const upload = async (file: File | null) => {
    if (!file) {
      return;
    }
    resetFile.current?.();
    if (!acceptedTypes.includes(file.type)) {
      setValidationError('Поддерживаются только JPEG, PNG и WebP.');
      return;
    }
    if (file.size === 0 || file.size > maxPhotoSize) {
      setValidationError('Размер фотографии должен быть от 1 байта до 5 МБ.');
      return;
    }
    setValidationError(null);
    await onUpload(file);
  };

  return (
    <Paper withBorder p="lg">
      <Stack gap="md">
        <Title order={2} size="h3" fw={600}>
          Фотография
        </Title>
        <Group align="center" gap="lg">
          <Image
            src={photoUrl ?? '/resume-photo-fallback.svg'}
            fallbackSrc="/resume-photo-fallback.svg"
            alt="Фотография резюме"
            w={96}
            h={96}
            fit="cover"
            radius="md"
          />
          <Stack gap="xs">
            <Text size="sm" c="dimmed">
              JPEG, PNG или WebP, до 5 МБ.
            </Text>
            <Group gap="xs">
              <FileButton
                onChange={(file) => void upload(file)}
                accept={acceptedTypes.join(',')}
                resetRef={resetFile}
              >
                {(props) => (
                  <Button {...props} type="button" loading={busy} disabled={busy}>
                    {hasPhoto ? 'Заменить фото' : 'Добавить фото'}
                  </Button>
                )}
              </FileButton>
              {hasPhoto ? (
                <Button
                  type="button"
                  variant="subtle"
                  color="red"
                  disabled={busy}
                  onClick={() => void onDelete()}
                >
                  Удалить
                </Button>
              ) : null}
            </Group>
          </Stack>
        </Group>
        {validationError ? <Alert color="red">{validationError}</Alert> : null}
        {error ? (
          <Alert color="red">
            {error.status === 413
              ? 'Фотография больше 5 МБ.'
              : 'Не удалось сохранить фотографию. Попробуйте ещё раз.'}
          </Alert>
        ) : null}
      </Stack>
    </Paper>
  );
}
