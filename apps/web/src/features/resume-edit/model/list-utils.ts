import type { EditorForm } from './editor-form';

export function removeListItem<
  K extends 'experiences' | 'educations' | 'skills' | 'languages' | 'projects' | 'certificates',
>(form: EditorForm, key: K, index: number) {
  form.setFieldValue(key, form.values[key].filter((_, itemIndex) => itemIndex !== index) as never);
}
