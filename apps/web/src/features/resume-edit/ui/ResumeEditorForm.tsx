import {
  Accordion,
  ActionIcon,
  Alert,
  Button,
  Checkbox,
  Divider,
  Group,
  Paper,
  Select,
  Stack,
  Text,
  TextInput,
  Textarea,
  Title,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import type { FormErrors } from '@mantine/form';
import { Children, type ReactNode } from 'react';
import { useEffect } from 'react';

import {
  type ResumeEditorSection,
  type ResumeEditorValues,
  editorValuesToUpdateInput,
  resumeToEditorValues,
} from '@/entities/resume';
import type { ResumeDto, TemplateSectionDto } from '@/shared/api/generated/types.gen';

import styles from './ResumeEditorForm.module.css';

type ResumeEditorFormProps = {
  resume: ResumeDto;
  saving: boolean;
  saveError: { status?: number } | undefined;
  onSave: (input: ReturnType<typeof editorValuesToUpdateInput>) => Promise<boolean>;
  onValuesChange: (values: ResumeEditorValues) => void;
};

const sectionLabels: Record<TemplateSectionDto['type'], string> = {
  PROFILE: 'Профиль',
  ABOUT: 'О себе',
  CONTACTS: 'Контакты',
  EXPERIENCE: 'Опыт работы',
  EDUCATION: 'Образование',
  SKILLS: 'Навыки',
  LANGUAGES: 'Языки',
  PROJECTS: 'Проекты',
  CERTIFICATES: 'Сертификаты',
};

export function ResumeEditorForm({
  resume,
  saving,
  saveError,
  onSave,
  onValuesChange,
}: ResumeEditorFormProps) {
  const form = useForm<ResumeEditorValues>({
    mode: 'controlled',
    initialValues: resumeToEditorValues(resume),
  });
  const activeSections = form.values.sections.filter((section) => section.isVisible);
  const hiddenSections = form.values.sections.filter((section) => !section.isVisible);

  useEffect(() => {
    form.setValues(resumeToEditorValues(resume));
  }, [resume.id, resume.revision]);

  useEffect(() => {
    onValuesChange(form.values);
  }, [form.values, onValuesChange]);

  const submit = async () => {
    const errors = validateValues(form.values);
    form.setErrors(errors);
    if (Object.keys(errors).length > 0) {
      return;
    }
    await onSave(editorValuesToUpdateInput(form.values, resume.revision));
  };

  const addSection = (type: ResumeEditorSection['type']) => {
    form.setFieldValue(
      'sections',
      form.values.sections.map((section) =>
        section.type === type ? { ...section, isVisible: true } : section,
      ),
    );
  };

  const removeSection = (type: ResumeEditorSection['type']) => {
    form.setFieldValue(
      'sections',
      form.values.sections.map((section) =>
        section.type === type ? { ...section, isVisible: false } : section,
      ),
    );
  };

  const moveSection = (index: number, direction: -1 | 1) => {
    const nextIndex = index + direction;
    if (nextIndex < 0 || nextIndex >= activeSections.length) {
      return;
    }
    const nextSections = [...activeSections];
    const currentSection = nextSections[index];
    const nextSection = nextSections[nextIndex];
    const currentTemplateSection = resume.template.sections.find(
      (section) => section.type === currentSection?.type,
    );
    const nextTemplateSection = resume.template.sections.find(
      (section) => section.type === nextSection?.type,
    );
    if (
      !currentSection ||
      !nextSection ||
      !currentTemplateSection ||
      !nextTemplateSection ||
      currentTemplateSection.region !== nextTemplateSection.region
    ) {
      return;
    }
    nextSections[index] = nextSection;
    nextSections[nextIndex] = currentSection;
    const visibleByType = new Map(nextSections.map((section) => [section.type, section]));
    form.setFieldValue(
      'sections',
      form.values.sections.map((section) => visibleByType.get(section.type) ?? section),
    );
  };

  return (
    <form
      className={styles.form}
      onSubmit={(event) => {
        event.preventDefault();
        void submit();
      }}
    >
      <Stack gap="lg">
        <Paper withBorder p="lg">
          <Stack gap="md">
            <Title order={2}>Основная информация</Title>
            <TextInput label="Название резюме" {...form.getInputProps('title')} />
            <Group grow>
              <TextInput label="Имя" {...form.getInputProps('firstName')} />
              <TextInput label="Фамилия" {...form.getInputProps('lastName')} />
            </Group>
            <TextInput
              label="Заголовок"
              placeholder="Frontend-разработчик"
              {...form.getInputProps('headline')}
            />
            <Textarea label="О себе" autosize minRows={4} {...form.getInputProps('about')} />
            <Divider label="Контакты" />
            <Group grow>
              <TextInput label="Email" type="email" {...form.getInputProps('email')} />
              <TextInput label="Телефон" {...form.getInputProps('phone')} />
            </Group>
            <TextInput label="Город" {...form.getInputProps('location')} />
            <Group grow>
              <TextInput
                label="GitHub"
                placeholder="github.com/name"
                {...form.getInputProps('githubUrl')}
              />
              <TextInput
                label="Telegram"
                placeholder="@name"
                {...form.getInputProps('telegramHandle')}
              />
            </Group>
            <TextInput
              label="Сайт"
              placeholder="example.com"
              {...form.getInputProps('websiteUrl')}
            />
          </Stack>
        </Paper>

        <Paper withBorder p="lg">
          <Stack gap="md">
            <div>
              <Title order={2}>Разделы резюме</Title>
              <Text size="sm" c="dimmed">
                Порядок меняется внутри колонок выбранного шаблона.
              </Text>
            </div>
            <Accordion variant="separated">
              {activeSections.map((section, index) => (
                <Accordion.Item key={section.type} value={section.type}>
                  <Accordion.Control>
                    <Group justify="space-between" wrap="nowrap" pr="sm">
                      <Text>{sectionLabels[section.type]}</Text>
                      <Group gap={4} onClick={(event) => event.stopPropagation()}>
                        <ActionIcon
                          variant="subtle"
                          aria-label="Переместить раздел выше"
                          disabled={
                            index === 0 || !canMoveSection(activeSections, index, -1, resume)
                          }
                          onClick={() => moveSection(index, -1)}
                        >
                          ↑
                        </ActionIcon>
                        <ActionIcon
                          variant="subtle"
                          aria-label="Переместить раздел ниже"
                          disabled={
                            index === activeSections.length - 1 ||
                            !canMoveSection(activeSections, index, 1, resume)
                          }
                          onClick={() => moveSection(index, 1)}
                        >
                          ↓
                        </ActionIcon>
                        <ActionIcon
                          variant="subtle"
                          color="red"
                          aria-label="Скрыть раздел"
                          onClick={() => removeSection(section.type)}
                        >
                          ×
                        </ActionIcon>
                      </Group>
                    </Group>
                  </Accordion.Control>
                  <Accordion.Panel>{renderSectionFields(section.type, form)}</Accordion.Panel>
                </Accordion.Item>
              ))}
            </Accordion>
            {hiddenSections.length > 0 ? (
              <Group align="end">
                <Select
                  label="Добавить раздел"
                  placeholder="Выберите раздел"
                  data={hiddenSections.map((section) => ({
                    value: section.type,
                    label: sectionLabels[section.type],
                  }))}
                  onChange={(value) => {
                    if (value) {
                      addSection(value as ResumeEditorSection['type']);
                    }
                  }}
                  searchable
                  clearable
                />
              </Group>
            ) : null}
          </Stack>
        </Paper>

        {saveError ? (
          <Alert color="red" title="Не удалось сохранить резюме">
            {saveError.status === 409
              ? 'Резюме изменилось в другой вкладке. Перезагрузите страницу и повторите сохранение.'
              : 'Проверьте заполненные поля и попробуйте ещё раз.'}
          </Alert>
        ) : null}
        <Group justify="flex-end" className={styles.saveActions}>
          <Button type="submit" loading={saving}>
            Сохранить изменения
          </Button>
        </Group>
      </Stack>
    </form>
  );
}

function renderSectionFields(
  type: ResumeEditorSection['type'],
  form: ReturnType<typeof useForm<ResumeEditorValues>>,
) {
  switch (type) {
    case 'PROFILE':
      return (
        <Text size="sm" c="dimmed">
          Профиль формируется из основной информации.
        </Text>
      );
    case 'CONTACTS':
      return (
        <Text size="sm" c="dimmed">
          Контакты редактируются в основной информации.
        </Text>
      );
    case 'ABOUT':
      return (
        <Textarea label="Текст раздела" autosize minRows={4} {...form.getInputProps('about')} />
      );
    case 'EXPERIENCE':
      return <ExperienceFields form={form} />;
    case 'EDUCATION':
      return <EducationFields form={form} />;
    case 'SKILLS':
      return <SkillsFields form={form} />;
    case 'LANGUAGES':
      return <LanguagesFields form={form} />;
    case 'PROJECTS':
      return <ProjectsFields form={form} />;
    case 'CERTIFICATES':
      return <CertificatesFields form={form} />;
  }
}

function ExperienceFields({ form }: { form: ReturnType<typeof useForm<ResumeEditorValues>> }) {
  return (
    <EditableList
      emptyLabel="Добавьте первый опыт работы"
      onAdd={() =>
        form.setFieldValue('experiences', [...form.values.experiences, emptyExperience()])
      }
    >
      {form.values.experiences.map((item, index) => (
        <Paper key={index} withBorder p="sm">
          <Stack gap="sm">
            <Group grow>
              <TextInput label="Компания" {...form.getInputProps(`experiences.${index}.company`)} />
              <TextInput
                label="Должность"
                {...form.getInputProps(`experiences.${index}.position`)}
              />
            </Group>
            <Group grow>
              <TextInput
                label="Начало"
                type="date"
                {...form.getInputProps(`experiences.${index}.startDate`)}
              />
              <TextInput
                label="Окончание"
                type="date"
                disabled={item.isCurrent}
                {...form.getInputProps(`experiences.${index}.endDate`)}
              />
            </Group>
            <Checkbox
              label="Работаю сейчас"
              {...form.getInputProps(`experiences.${index}.isCurrent`, { type: 'checkbox' })}
            />
            <TextInput label="Место" {...form.getInputProps(`experiences.${index}.location`)} />
            <Textarea
              label="Описание"
              autosize
              minRows={3}
              {...form.getInputProps(`experiences.${index}.description`)}
            />
            <Button
              color="red"
              variant="subtle"
              onClick={() => removeListItem(form, 'experiences', index)}
            >
              Удалить опыт
            </Button>
          </Stack>
        </Paper>
      ))}
    </EditableList>
  );
}

function EducationFields({ form }: { form: ReturnType<typeof useForm<ResumeEditorValues>> }) {
  return (
    <EditableList
      emptyLabel="Добавьте образование"
      onAdd={() => form.setFieldValue('educations', [...form.values.educations, emptyEducation()])}
    >
      {form.values.educations.map((_item, index) => (
        <Paper key={index} withBorder p="sm">
          <Stack gap="sm">
            <TextInput
              label="Учебное заведение"
              {...form.getInputProps(`educations.${index}.institution`)}
            />
            <Group grow>
              <TextInput label="Степень" {...form.getInputProps(`educations.${index}.degree`)} />
              <TextInput
                label="Направление"
                {...form.getInputProps(`educations.${index}.fieldOfStudy`)}
              />
            </Group>
            <Group grow>
              <TextInput
                label="Начало"
                type="date"
                {...form.getInputProps(`educations.${index}.startDate`)}
              />
              <TextInput
                label="Окончание"
                type="date"
                {...form.getInputProps(`educations.${index}.endDate`)}
              />
            </Group>
            <TextInput label="Место" {...form.getInputProps(`educations.${index}.location`)} />
            <Textarea
              label="Описание"
              autosize
              minRows={3}
              {...form.getInputProps(`educations.${index}.description`)}
            />
            <Button
              color="red"
              variant="subtle"
              onClick={() => removeListItem(form, 'educations', index)}
            >
              Удалить образование
            </Button>
          </Stack>
        </Paper>
      ))}
    </EditableList>
  );
}

function SkillsFields({ form }: { form: ReturnType<typeof useForm<ResumeEditorValues>> }) {
  return (
    <EditableList
      emptyLabel="Добавьте навык"
      onAdd={() => form.setFieldValue('skills', [...form.values.skills, { name: '', level: '' }])}
    >
      {form.values.skills.map((_item, index) => (
        <Group key={index} grow align="end">
          <TextInput label="Навык" {...form.getInputProps(`skills.${index}.name`)} />
          <Select
            label="Уровень"
            placeholder="Не указан"
            data={['Базовый', 'Уверенный', 'Продвинутый']}
            clearable
            {...form.getInputProps(`skills.${index}.level`)}
          />
          <ActionIcon
            color="red"
            variant="subtle"
            aria-label="Удалить навык"
            onClick={() => removeListItem(form, 'skills', index)}
          >
            ×
          </ActionIcon>
        </Group>
      ))}
    </EditableList>
  );
}

function LanguagesFields({ form }: { form: ReturnType<typeof useForm<ResumeEditorValues>> }) {
  return (
    <EditableList
      emptyLabel="Добавьте язык"
      onAdd={() =>
        form.setFieldValue('languages', [...form.values.languages, { name: '', proficiency: '' }])
      }
    >
      {form.values.languages.map((_item, index) => (
        <Group key={index} grow align="end">
          <TextInput label="Язык" {...form.getInputProps(`languages.${index}.name`)} />
          <TextInput
            label="Уровень"
            placeholder="B2, родной"
            {...form.getInputProps(`languages.${index}.proficiency`)}
          />
          <ActionIcon
            color="red"
            variant="subtle"
            aria-label="Удалить язык"
            onClick={() => removeListItem(form, 'languages', index)}
          >
            ×
          </ActionIcon>
        </Group>
      ))}
    </EditableList>
  );
}

function ProjectsFields({ form }: { form: ReturnType<typeof useForm<ResumeEditorValues>> }) {
  return (
    <EditableList
      emptyLabel="Добавьте проект"
      onAdd={() => form.setFieldValue('projects', [...form.values.projects, emptyProject()])}
    >
      {form.values.projects.map((_item, index) => (
        <Paper key={index} withBorder p="sm">
          <Stack gap="sm">
            <Group grow>
              <TextInput label="Название" {...form.getInputProps(`projects.${index}.name`)} />
              <TextInput label="Роль" {...form.getInputProps(`projects.${index}.role`)} />
            </Group>
            <TextInput label="Ссылка" {...form.getInputProps(`projects.${index}.url`)} />
            <Group grow>
              <TextInput
                label="Начало"
                type="date"
                {...form.getInputProps(`projects.${index}.startDate`)}
              />
              <TextInput
                label="Окончание"
                type="date"
                {...form.getInputProps(`projects.${index}.endDate`)}
              />
            </Group>
            <Textarea
              label="Описание"
              autosize
              minRows={3}
              {...form.getInputProps(`projects.${index}.description`)}
            />
            <Button
              color="red"
              variant="subtle"
              onClick={() => removeListItem(form, 'projects', index)}
            >
              Удалить проект
            </Button>
          </Stack>
        </Paper>
      ))}
    </EditableList>
  );
}

function CertificatesFields({ form }: { form: ReturnType<typeof useForm<ResumeEditorValues>> }) {
  return (
    <EditableList
      emptyLabel="Добавьте сертификат"
      onAdd={() =>
        form.setFieldValue('certificates', [...form.values.certificates, emptyCertificate()])
      }
    >
      {form.values.certificates.map((_item, index) => (
        <Paper key={index} withBorder p="sm">
          <Stack gap="sm">
            <Group grow>
              <TextInput label="Название" {...form.getInputProps(`certificates.${index}.name`)} />
              <TextInput
                label="Организация"
                {...form.getInputProps(`certificates.${index}.issuer`)}
              />
            </Group>
            <Group grow>
              <TextInput
                label="Дата выдачи"
                type="date"
                {...form.getInputProps(`certificates.${index}.issuedAt`)}
              />
              <TextInput
                label="Действует до"
                type="date"
                {...form.getInputProps(`certificates.${index}.expiresAt`)}
              />
            </Group>
            <TextInput
              label="Ссылка на сертификат"
              {...form.getInputProps(`certificates.${index}.credentialUrl`)}
            />
            <Button
              color="red"
              variant="subtle"
              onClick={() => removeListItem(form, 'certificates', index)}
            >
              Удалить сертификат
            </Button>
          </Stack>
        </Paper>
      ))}
    </EditableList>
  );
}

function EditableList({
  children,
  emptyLabel,
  onAdd,
}: {
  children: ReactNode;
  emptyLabel: string;
  onAdd: () => void;
}) {
  return (
    <Stack gap="sm">
      {Children.count(children) > 0 ? (
        children
      ) : (
        <Text size="sm" c="dimmed">
          {emptyLabel}
        </Text>
      )}
      <Button variant="light" onClick={onAdd}>
        Добавить
      </Button>
    </Stack>
  );
}

function canMoveSection(
  sections: ResumeEditorSection[],
  index: number,
  direction: -1 | 1,
  resume: ResumeDto,
): boolean {
  const current = sections[index];
  const target = sections[index + direction];
  if (!current || !target) {
    return false;
  }
  const currentTemplateSection = resume.template.sections.find(
    (section) => section.type === current.type,
  );
  const targetTemplateSection = resume.template.sections.find(
    (section) => section.type === target.type,
  );
  return currentTemplateSection?.region === targetTemplateSection?.region;
}

function removeListItem<
  K extends 'experiences' | 'educations' | 'skills' | 'languages' | 'projects' | 'certificates',
>(form: ReturnType<typeof useForm<ResumeEditorValues>>, key: K, index: number) {
  form.setFieldValue(key, form.values[key].filter((_, itemIndex) => itemIndex !== index) as never);
}

function validateValues(values: ResumeEditorValues): FormErrors {
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

function emptyExperience() {
  return {
    company: '',
    position: '',
    location: '',
    startDate: '',
    endDate: '',
    isCurrent: false,
    description: '',
  };
}

function emptyEducation() {
  return {
    institution: '',
    degree: '',
    fieldOfStudy: '',
    location: '',
    startDate: '',
    endDate: '',
    description: '',
  };
}

function emptyProject() {
  return { name: '', role: '', description: '', url: '', startDate: '', endDate: '' };
}

function emptyCertificate() {
  return { name: '', issuer: '', issuedAt: '', expiresAt: '', credentialUrl: '' };
}
