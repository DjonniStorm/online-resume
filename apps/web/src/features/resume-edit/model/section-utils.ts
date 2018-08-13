import type { ResumeEditorSection } from '@/entities/resume';
import type { ResumeDto } from '@/shared/api/generated/types.gen';

export function canMoveSection(
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

export function moveSection(
  sections: ResumeEditorSection[],
  index: number,
  direction: -1 | 1,
  resume: ResumeDto,
): ResumeEditorSection[] {
  const activeSections = sections.filter((section) => section.isVisible);
  if (!canMoveSection(activeSections, index, direction, resume)) {
    return sections;
  }
  const first = activeSections[index];
  const second = activeSections[index + direction];
  if (!first || !second) {
    return sections;
  }
  const reordered = [...activeSections];
  reordered[index] = second;
  reordered[index + direction] = first;
  const visibleByType = new Map(reordered.map((section) => [section.type, section]));
  return sections.map((section) => visibleByType.get(section.type) ?? section);
}
