import type { ResumeEditorSection } from '@/entities/resume';
import type { ResumeDto } from '@/shared/api/generated/types.gen';

export function moveSection(
  sections: ResumeEditorSection[],
  type: ResumeEditorSection['type'],
  direction: -1 | 1,
  resume: ResumeDto,
): ResumeEditorSection[] {
  const current = resume.template.sections.find((section) => section.type === type);
  if (!current?.canReorder) {
    return sections;
  }
  const sameRegion = sections.filter(
    (section) =>
      section.isVisible &&
      resume.template.sections.some(
        (item) => item.type === section.type && item.region === current.region && item.canReorder,
      ),
  );
  const index = sameRegion.findIndex((section) => section.type === type);
  const target = sameRegion[index + direction];
  if (index < 0 || !target) {
    return sections;
  }
  const currentIndex = sections.findIndex((section) => section.type === type);
  const targetIndex = sections.findIndex((section) => section.type === target.type);
  const reordered = [...sections];
  const first = sections[currentIndex];
  const second = sections[targetIndex];
  if (!first || !second) {
    return sections;
  }
  reordered[currentIndex] = second;
  reordered[targetIndex] = first;
  return reordered;
}
