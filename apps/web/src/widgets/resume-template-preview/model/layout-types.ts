import type {
  ResumeSectionDto,
  TemplateDto,
  TemplateSectionDto,
  TemplateThemeDto,
} from '@/shared/api/generated/types.gen';

import type { ResumePreviewData } from './resume-preview-data';

export type Region = TemplateSectionDto['region'];

export type SectionsByRegion = Record<Region, TemplateSectionDto[]>;

export type ResumeTemplateLayoutProps = {
  data: ResumePreviewData;
  sectionsByRegion: SectionsByRegion;
  sectionState?: Array<Pick<ResumeSectionDto, 'type' | 'sortOrder' | 'isVisible'>>;
  theme: TemplateThemeDto;
  template: TemplateDto;
};
