import { Text, Textarea } from '@mantine/core';
import { match } from 'ts-pattern';

import type { ResumeEditorSection } from '@/entities/resume';

import type { EditorForm } from '../model';
import { CertificatesFields } from './CertificatesFields';
import { EducationFields } from './EducationFields';
import { ExperienceFields } from './ExperienceFields';
import { LanguagesFields } from './LanguagesFields';
import { ProjectsFields } from './ProjectsFields';
import { SkillsFields } from './SkillsFields';

export function SectionFields({
  type,
  form,
}: {
  type: ResumeEditorSection['type'];
  form: EditorForm;
}) {
  return match(type)
    .with('PROFILE', () => (
      <Text size="sm" c="dimmed">
        Профиль формируется из основной информации.
      </Text>
    ))
    .with('CONTACTS', () => (
      <Text size="sm" c="dimmed">
        Контакты редактируются в основной информации.
      </Text>
    ))
    .with('ABOUT', () => (
      <Textarea label="Текст раздела" autosize minRows={4} {...form.getInputProps('about')} />
    ))
    .with('EXPERIENCE', () => <ExperienceFields form={form} />)
    .with('EDUCATION', () => <EducationFields form={form} />)
    .with('SKILLS', () => <SkillsFields form={form} />)
    .with('LANGUAGES', () => <LanguagesFields form={form} />)
    .with('PROJECTS', () => <ProjectsFields form={form} />)
    .with('CERTIFICATES', () => <CertificatesFields form={form} />)
    .exhaustive();
}
