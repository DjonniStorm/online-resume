import type { FormErrors } from '@mantine/form';

import type { ResumeEditorValues } from '@/entities/resume';

export function validateValues(values: ResumeEditorValues): FormErrors {
  const errors: FormErrors = {};
  if (!values.title.trim()) errors.title = 'Введите название резюме';
  if (!values.firstName.trim()) errors.firstName = 'Введите имя';
  if (!values.lastName.trim()) errors.lastName = 'Введите фамилию';
  validateList(errors, values.experiences, 'experiences', 'company', 'position');
  validateList(errors, values.educations, 'educations', 'institution');
  validateList(errors, values.skills, 'skills', 'name');
  validateList(errors, values.languages, 'languages', 'name');
  validateList(errors, values.projects, 'projects', 'name');
  validateList(errors, values.certificates, 'certificates', 'name');
  return errors;
}

function validateList<T extends Record<string, unknown>>(
  errors: FormErrors,
  items: T[],
  key: string,
  ...requiredFields: string[]
) {
  items.forEach((item, index) => {
    const hasAnyValue = Object.values(item).some((value) =>
      typeof value === 'string' ? value.trim() : Boolean(value),
    );
    if (!hasAnyValue) {
      return;
    }
    requiredFields.forEach((field) => {
      const value = item[field];
      if (typeof value !== 'string' || !value.trim()) {
        errors[`${key}.${index}.${field}`] = 'Заполните обязательное поле';
      }
    });
  });
}
