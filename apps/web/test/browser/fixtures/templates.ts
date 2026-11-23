import type { TemplateDto } from '../../../src/shared/api/generated/types.gen';

const baseTemplate: TemplateDto = {
  id: 'template-clear-focus',
  slug: 'clear-focus',
  name: 'Clear Focus',
  description: 'Одноколоночный шаблон',
  layout: 'SINGLE_COLUMN',
  pageWidthMm: '210',
  pageHeightMm: '297',
  sidebarWidthPercent: null,
  photoPlacement: 'NONE',
  photoShape: 'CIRCLE',
  continuationHeader: 'COMPACT',
  previewUrl: null,
  theme: null,
  sections: [
    {
      id: 'section-profile',
      type: 'PROFILE',
      region: 'HEADER',
      sortOrder: 0,
      itemLayout: 'STANDARD',
      canReorder: false,
      showHeading: false,
      headingText: null,
      accentColor: null,
    },
  ],
  fields: [],
};

export const templates: TemplateDto[] = [
  baseTemplate,
  { ...baseTemplate, id: 'template-second', slug: 'second', name: 'Второй шаблон' },
];
