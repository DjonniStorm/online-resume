import { Select } from '@mantine/core';
import { useEffect, useState } from 'react';

import { StoreKey, useStore } from '@/app/store';
import type { SelectedResumeDto } from '@/shared/api/generated/types.gen';

type ResumeAnalyticsFilterProps = {
  selectedResume: SelectedResumeDto | null;
  value: string | null;
  onChange: (value: string | null) => void;
};

export function ResumeAnalyticsFilter({
  selectedResume,
  value,
  onChange,
}: ResumeAnalyticsFilterProps) {
  const resumes = useStore(StoreKey.Resumes);
  const [search, setSearch] = useState('');
  const [options, setOptions] = useState<Array<{ value: string; label: string }>>([]);

  useEffect(() => {
    let active = true;
    const timer = window.setTimeout(
      () => {
        void resumes.searchAnalyticsOptions(search).then((items) => {
          if (active) {
            setOptions(items.map(({ id, title }) => ({ value: id, label: title })));
          }
        });
      },
      search ? 250 : 0,
    );
    return () => {
      active = false;
      window.clearTimeout(timer);
    };
  }, [resumes, search]);

  const data = [{ value: 'all', label: 'Все резюме' }, ...options];
  if (selectedResume && !data.some((option) => option.value === selectedResume.id)) {
    data.push({ value: selectedResume.id, label: selectedResume.title });
  }

  return (
    <Select
      aria-label="Резюме для статистики"
      placeholder="Выберите резюме"
      searchable
      nothingFoundMessage="Ничего не найдено"
      data={data}
      value={value ?? 'all'}
      onSearchChange={setSearch}
      onDropdownClose={() => setSearch('')}
      onChange={(next) => onChange(next === 'all' ? null : next)}
      maxDropdownHeight={240}
      size="sm"
      w={{ base: '100%', sm: 230 }}
    />
  );
}
