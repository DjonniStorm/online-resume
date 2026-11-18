import type { useForm } from '@mantine/form';

import type { ResumeEditorValues } from '@/entities/resume';

export type EditorForm = ReturnType<typeof useForm<ResumeEditorValues>>;
