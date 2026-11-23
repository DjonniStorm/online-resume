import { useHead } from '@unhead/react';

import { StoreKey, useStore } from '@/app/store';
import { LoginForm } from '@/features/auth/ui/LoginForm';
import { AuthLayout } from '@/widgets/auth-layout/ui/AuthLayout';

export function LoginPage() {
  useHead({ title: 'Вход — Online Resume' });
  const sessionStore = useStore(StoreKey.Session);

  return (
    <AuthLayout>
      <LoginForm sessionStore={sessionStore} />
    </AuthLayout>
  );
}
