import { useHead } from '@unhead/react';
import { observer } from 'mobx-react-lite';
import { AppRouter } from './router';
import { Providers } from './providers';
import { useRootStore } from './store';

const AppShell = observer(function AppShell() {
  useRootStore();
  useHead({ title: 'Online Resume' });

  return <AppRouter />;
});

export function App() {
  return (
    <Providers>
      <AppShell />
    </Providers>
  );
}
