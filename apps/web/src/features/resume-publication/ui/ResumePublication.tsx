import {
  ActionIcon,
  Alert,
  Anchor,
  Badge,
  Button,
  Group,
  Menu,
  Stack,
  Text,
  Tooltip,
} from '@mantine/core';
import { IconCopy, IconDots, IconExternalLink } from '@tabler/icons-react';
import { observer } from 'mobx-react-lite';
import { useState } from 'react';

import { StoreKey, useStores } from '@/app/store';

import styles from './ResumePublication.module.css';

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
          <div className={styles.row}>
            <Badge variant="light" className={styles.status}>
              Опубликовано
            </Badge>
            <Anchor
              href={publicUrl}
              title={publicUrl}
              target="_blank"
              rel="noopener noreferrer"
              size="sm"
              className={styles.link}
            >
              <span className={styles.linkText}>{publicUrl}</span>
              <IconExternalLink size={16} aria-hidden="true" />
            </Anchor>
            <Tooltip label="Копировать ссылку">
              <ActionIcon
                aria-label="Копировать публичную ссылку"
                variant="light"
                size="lg"
                onClick={() => void copy()}
              >
                <IconCopy size={18} aria-hidden="true" />
              </ActionIcon>
            </Tooltip>
            <Menu position="bottom-end" withinPortal>
              <Menu.Target>
                <ActionIcon
                  aria-label="Действия с публикацией"
                  variant="subtle"
                  size="lg"
                  loading={unpublishing}
                >
                  <IconDots size={20} aria-hidden="true" />
                </ActionIcon>
              </Menu.Target>
              <Menu.Dropdown>
                <Menu.Item color="red" disabled={unpublishing} onClick={() => void unpublish()}>
                  Снять с публикации
                </Menu.Item>
              </Menu.Dropdown>
            </Menu>
          </div>
        ) : (
          <Group gap="sm" wrap="wrap">
            <Badge variant="light" color="gray">
              Не опубликовано
            </Badge>
            <Text size="sm" c="dimmed">
              Публичной ссылки пока нет
            </Text>
            <Button
              className={styles.publishButton}
              loading={publishing}
              onClick={() => void publish()}
            >
              Опубликовать резюме
            </Button>
          </Group>
        )}
        {errors.forOperation('resumes.publish') || errors.forOperation('resumes.unpublish') ? (
          <Alert color="red">Не удалось изменить публикацию. Попробуйте ещё раз.</Alert>
        ) : null}
        {copyError ? <Alert color="red">Не удалось скопировать ссылку.</Alert> : null}
      </Stack>
    );
  },
);
