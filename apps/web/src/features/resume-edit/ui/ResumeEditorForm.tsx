import { Alert, Stack } from '@mantine/core';
import { useForm } from '@mantine/form';
import { useEffect } from 'react';

import { type ResumeEditorValues, resumeToEditorValues } from '@/entities/resume';
import type { ResumeDto, UpdateResumeDto } from '@/shared/api/generated/types.gen';

import { type SaveState, useResumeAutosave } from '../model';
import { BasicInformationFields } from './BasicInformationFields';
import styles from './ResumeEditorForm.module.css';
import { ResumeSections } from './ResumeSections';

type ResumeEditorFormProps = {
  resume: ResumeDto;
  saveError: { status?: number } | undefined;
  paused: boolean;
  onSave: (input: UpdateResumeDto) => Promise<ResumeDto | null>;
  onOpenPreview: () => void;
  onSaveStateChange: (state: SaveState) => void;
  onValuesChange: (values: ResumeEditorValues) => void;
};

export function ResumeEditorForm({
  resume,
  saveError,
  paused,
  onSave,
  onOpenPreview,
  onSaveStateChange,
  onValuesChange,
}: ResumeEditorFormProps) {
  const form = useForm<ResumeEditorValues>({
    mode: 'controlled',
    initialValues: resumeToEditorValues(resume),
  });

  useEffect(() => {
    onValuesChange(form.values);
  }, [form.values, onValuesChange]);

  const saveLatest = useResumeAutosave({
    form,
    resume,
    saveError,
    paused,
    onSave,
    onSaveStateChange,
  });

  return (
    <form
      id="resume-editor-form"
      className={styles.form}
      onSubmit={(event) => {
        event.preventDefault();
        const openPreview =
          (event.nativeEvent as SubmitEvent).submitter?.getAttribute('data-intent') === 'preview';
        void saveLatest(openPreview).then((saved) => {
          if (saved && openPreview) {
            onOpenPreview();
          }
        });
      }}
    >
      <Stack gap="lg">
        <BasicInformationFields form={form} />
        <ResumeSections form={form} resume={resume} />
        {saveError ? (
          <Alert color="red" title="Не удалось сохранить резюме">
            {saveError.status === 409
              ? 'Резюме изменилось в другой вкладке. Перезагрузите страницу и повторите сохранение.'
              : 'Проверьте заполненные поля и попробуйте ещё раз.'}
          </Alert>
        ) : null}
      </Stack>
    </form>
  );
}
