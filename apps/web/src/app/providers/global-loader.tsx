import { Loader, Text } from '@mantine/core';
import { observer } from 'mobx-react-lite';
import { useEffect, useState } from 'react';

import { StoreKey, useStore } from '@/app/store';

import classes from './GlobalLoader.module.css';

export const GlobalLoader = observer(() => {
  const loader = useStore(StoreKey.Loader);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!loader.visible) {
      setVisible(false);
      return;
    }

    const timer = window.setTimeout(() => setVisible(true), 180);
    return () => window.clearTimeout(timer);
  }, [loader.visible]);

  if (!visible || !loader.visible) {
    return null;
  }

  return (
    <div className={classes.container} role="status" aria-live="polite">
      <Loader size="xs" />
      <Text size="sm">
        {loader.active.length === 1
          ? 'Выполняется запрос…'
          : `Выполняются запросы: ${loader.active.length}`}
      </Text>
    </div>
  );
});
