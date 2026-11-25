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
import { ApiOperation } from '@/shared/api';

import styles from './ResumePublication.module.css';

type ResumePublicationProps = {
  id: string;
  publicSlug: string | null;
  unpublishAt: string | null;
  onChange: (slug: string | null, unpublishAt: string | null) => void;
};

export const ResumePublication = observer(
  ({ id, publicSlug, unpublishAt, onChange }: ResumePublicationProps) => {
    const { resumes, requests, errors } = useStores(
      StoreKey.Resumes,
      StoreKey.Requests,
      StoreKey.Errors,
    );
    const [copyError, setCopyError] = useState(false);
    const publicUrl = publicSlug ? `${window.location.origin}/r/${publicSlug}` : null;
    const publishing = requests.latest(ApiOperation.ResumesPublish)?.status === 'pending';
    const unpublishing = requests.latest(ApiOperation.ResumesUnpublish)?.status === 'pending';
    const changing =
      unpublishing ||
      requests.latest(ApiOperation.ResumesScheduleUnpublish)?.status === 'pending' ||
      requests.latest(ApiOperation.ResumesCancelUnpublish)?.status === 'pending';

    const publish = async () => {
      const slug = await resumes.publish(id);
      if (slug) {
        onChange(slug, null);
      }
    };

    const unpublish = async () => {
      if (await resumes.unpublish(id)) {
        onChange(null, null);
      }
    };

    const schedule = async () => {
      const date = await resumes.scheduleUnpublish(id);
      if (date) onChange(publicSlug, date);
    };

    const cancel = async () => {
      if (await resumes.cancelUnpublish(id)) onChange(publicSlug, null);
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
              {unpublishAt ? 'Снятие запланировано' : 'Опубликовано'}
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
                  loading={changing}
                >
                  <IconDots size={20} aria-hidden="true" />
                </ActionIcon>
              </Menu.Target>
              <Menu.Dropdown>
                {unpublishAt ? (
                  <Menu.Item disabled={changing} onClick={() => void cancel()}>
                    Отменить снятие
                  </Menu.Item>
                ) : (
                  <Menu.Item disabled={changing} onClick={() => void schedule()}>
                    Снять через 3 дня
                  </Menu.Item>
                )}
                <Menu.Item color="red" disabled={unpublishing} onClick={() => void unpublish()}>
                  Снять сейчас
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
        {unpublishAt ? (
          <Text size="sm" c="dimmed">
            Ссылка отключится{' '}
            {new Intl.DateTimeFormat('ru-RU', { dateStyle: 'medium', timeStyle: 'short' }).format(
              new Date(unpublishAt),
            )}
            .
          </Text>
        ) : null}
        {errors.forOperation(ApiOperation.ResumesPublish) ||
        errors.forOperation(ApiOperation.ResumesUnpublish) ||
        errors.forOperation(ApiOperation.ResumesScheduleUnpublish) ||
        errors.forOperation(ApiOperation.ResumesCancelUnpublish) ? (
          <Alert color="red">Не удалось изменить публикацию. Попробуйте ещё раз.</Alert>
        ) : null}
        {copyError ? <Alert color="red">Не удалось скопировать ссылку.</Alert> : null}
      </Stack>
    );
  },
);
