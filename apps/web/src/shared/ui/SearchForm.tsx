import { ActionIcon, TextInput, Tooltip } from '@mantine/core';
import { IconSearch } from '@tabler/icons-react';
import { useState } from 'react';

import styles from './SearchForm.module.css';

type SearchFormProps = {
  label: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  onSearch: (value: string) => void;
};

export function SearchForm({ label, placeholder, value, onChange, onSearch }: SearchFormProps) {
  return (
    <form
      role="search"
      aria-label={label}
      className={styles.form}
      onSubmit={(event) => {
        event.preventDefault();
        onSearch(value.trim());
      }}
    >
      <TextInput
        className={styles.input}
        aria-label={label}
        placeholder={placeholder}
        value={value}
        onChange={(event) => onChange(event.currentTarget.value)}
      />
      <Tooltip label="Найти">
        <ActionIcon type="submit" variant="light" size={42} aria-label="Найти">
          <IconSearch size={19} aria-hidden="true" />
        </ActionIcon>
      </Tooltip>
    </form>
  );
}

type SearchFormDraftProps = Omit<SearchFormProps, 'value' | 'onChange'> & {
  initialValue: string;
};

export function SearchFormDraft({ initialValue, ...props }: SearchFormDraftProps) {
  const [value, setValue] = useState(initialValue);
  return <SearchForm {...props} value={value} onChange={setValue} />;
}
