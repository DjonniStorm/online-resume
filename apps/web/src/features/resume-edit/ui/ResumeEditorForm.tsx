import { Alert, Stack } from '@mantine/core';
import { useForm } from '@mantine/form';
import { useEffect } from 'react';

import {
  type ResumeEditorValues,
  editorValuesToUpdateInput,
  resumeToEditorValues,
} from '@/entities/resume';
import type { ResumeDto } from '@/shared/api/generated/types.gen';

import { validateValues } from '../model';
import { BasicInformationFields } from './BasicInformationFields';
import styles from './ResumeEditorForm.module.css';
import { ResumeSections } from './ResumeSections';

type ResumeEditorFormProps = {
  resume: ResumeDto;
  saveError: { status?: number } | undefined;
  onSave: (
    input: ReturnType<typeof editorValuesToUpdateInput>,
    openPreview: boolean,
  ) => Promise<boolean>;
  onValuesChange: (values: ResumeEditorValues) => void;
};

export function ResumeEditorForm({
  resume,
  saveError,
  onSave,
  onValuesChange,
}: ResumeEditorFormProps) {
  const form = useForm<ResumeEditorValues>({
    mode: 'controlled',
    initialValues: resumeToEditorValues(resume),
  });

  useEffect(() => {
    form.setValues(resumeToEditorValues(resume));
  }, [resume.id, resume.revision]);

  useEffect(() => {
    onValuesChange(form.values);
  }, [form.values, onValuesChange]);

  const submit = async (openPreview: boolean) => {
    const errors = validateValues(form.values);
    form.setErrors(errors);
    if (Object.keys(errors).length > 0) {
      return;
    }
    await onSave(editorValuesToUpdateInput(form.values, resume.revision), openPreview);
  };

  return (
    <form
      id="resume-editor-form"
      className={styles.form}
      onSubmit={(event) => {
        event.preventDefault();
        void submit(
          (event.nativeEvent as SubmitEvent).submitter?.getAttribute('data-intent') === 'preview',
        );
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
