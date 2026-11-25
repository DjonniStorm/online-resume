import { Anchor, Center, Stack, Title } from '@mantine/core';
import { Link } from 'react-router';

export function RouteErrorBoundary() {
  return (
    <main>
      <Center mih="100vh">
        <Stack align="center" gap="sm">
          <Title order={1} size="h3" fw={600} ta="center">
            Возникла непредвиденная ошибка
          </Title>
          <Anchor component={Link} to="/">
            На главную
          </Anchor>
        </Stack>
      </Center>
    </main>
  );
}
