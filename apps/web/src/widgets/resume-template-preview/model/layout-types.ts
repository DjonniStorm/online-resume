import type { TemplateSectionDto, TemplateThemeDto } from '@/shared/api/generated/types.gen';

import type { ResumePreviewData } from './resume-preview-data';

export type Region = TemplateSectionDto['region'];

export type SectionsByRegion = Record<Region, TemplateSectionDto[]>;

export type ResumeTemplateLayoutProps = {
  data: ResumePreviewData;
  sectionsByRegion: SectionsByRegion;
  theme: TemplateThemeDto;
};
