import { Button, Stack, Text } from '@mantine/core';
import { Children, type PropsWithChildren } from 'react';

export function EditableList({
  children,
  emptyLabel,
  onAdd,
}: PropsWithChildren<{
  emptyLabel: string;
  onAdd: () => void;
}>) {
  return (
    <Stack gap="sm">
      {Children.count(children) > 0 ? (
        children
      ) : (
        <Text size="sm" c="dimmed">
          {emptyLabel}
        </Text>
      )}
      <Button variant="light" onClick={onAdd}>
        Добавить
      </Button>
    </Stack>
  );
}
