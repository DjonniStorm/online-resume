import { Card, Title } from '@mantine/core';
import { type ReactNode, useEffect, useRef, useState } from 'react';

import type { TemplateDto } from '@/shared/api/generated/types.gen';

import styles from './TemplateCard.module.css';

type TemplateCardProps = {
  template: TemplateDto;
  preview: ReactNode;
  onSelect: (template: TemplateDto) => void;
};

export function TemplateCard({ template, preview, onSelect }: TemplateCardProps) {
  const frameRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const frame = frameRef.current;
    if (!frame) {
      return;
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: '250px' },
    );
    observer.observe(frame);
    return () => observer.disconnect();
  }, []);

  return (
    <Card
      component="button"
      type="button"
      className={styles.card}
      withBorder
      radius="md"
      padding="md"
      aria-label={`Посмотреть шаблон ${template.name}`}
      onClick={() => onSelect(template)}
    >
      <div ref={frameRef} className={styles.previewFrame} aria-hidden="true" inert>
        {visible ? preview : null}
      </div>
      <Title order={3} size="h4" mt="md" style={{ overflowWrap: 'anywhere' }}>
        {template.name}
      </Title>
    </Card>
  );
}
