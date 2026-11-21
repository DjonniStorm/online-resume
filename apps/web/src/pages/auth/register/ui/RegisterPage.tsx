import { useHead } from '@unhead/react';

import { StoreKey, useStore } from '@/app/store';
import { RegisterForm } from '@/features/auth/ui/RegisterForm';
import { AuthLayout } from '@/widgets/auth-layout/ui/AuthLayout';

export function RegisterPage() {
  useHead({ title: 'Регистрация — Online Resume' });
  const sessionStore = useStore(StoreKey.Session);

  return (
    <AuthLayout>
      <RegisterForm sessionStore={sessionStore} />
    </AuthLayout>
  );
}
