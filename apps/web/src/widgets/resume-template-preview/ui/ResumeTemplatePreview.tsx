import { type CSSProperties, useLayoutEffect, useRef, useState } from 'react';
import { match } from 'ts-pattern';

import type {
  ResumeSectionDto,
  TemplateDto,
  TemplateSectionDto,
  TemplateThemeDto,
} from '@/shared/api/generated/types.gen';

import { defaultTheme } from '../model/default-theme';
import type { SectionsByRegion } from '../model/layout-types';
import { previewFixture } from '../model/preview-fixture';
import type { ResumePreviewData } from '../model/resume-preview-data';
import { ResumeSection } from './ResumeSection';
import styles from './ResumeTemplatePreview.module.css';
import { SidebarLayout } from './layouts/SidebarLayout';
import { SingleColumnLayout } from './layouts/SingleColumnLayout';
import { WideHeaderLayout } from './layouts/WideHeaderLayout';

type ResumeTemplatePreviewProps = {
  template: TemplateDto;
  data?: ResumePreviewData;
  photoUrl?: string | null;
  sectionState?: Array<Pick<ResumeSectionDto, 'type' | 'sortOrder' | 'isVisible'>>;
};

const pixelsPerMm = 96 / 25.4;

export function ResumeTemplatePreview({
  template,
  data = previewFixture,
  photoUrl,
  sectionState,
}: ResumeTemplatePreviewProps) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const pageRef = useRef<HTMLElement>(null);
  const [dimensions, setDimensions] = useState({ scale: 1, height: 0 });
  const theme = template.theme ?? defaultTheme;
  const pageWidth = Number(template.pageWidthMm) * pixelsPerMm;
  const pageHeight = Number(template.pageHeightMm) * pixelsPerMm;
  const sectionsByRegion = groupSections(template.sections, sectionState);
  const layoutProps = { data, photoUrl, sectionsByRegion, sectionState, theme, template };

  useLayoutEffect(() => {
    const viewport = viewportRef.current;
    const page = pageRef.current;
    if (!viewport || !page) {
      return;
    }

    const measure = () => {
      const scale = Math.min(1, viewport.clientWidth / pageWidth);
      const height = page.offsetHeight * scale;
      setDimensions((current) => {
        if (current.scale === scale && current.height === height) {
          return current;
        }
        return { scale, height };
      });
    };

    const observer = new ResizeObserver(measure);
    observer.observe(viewport);
    observer.observe(page);
    measure();
    return () => observer.disconnect();
  }, [pageWidth]);

  return (
    <div
      ref={viewportRef}
      className={styles.viewport}
      style={{ height: dimensions.height || pageHeight }}
    >
      <div
        className={styles.scaledPage}
        style={{ width: pageWidth * dimensions.scale, height: dimensions.height || pageHeight }}
      >
        <article
          ref={pageRef}
          className={styles.page}
          data-layout={template.layout}
          data-header-band={
            template.layout === 'SINGLE_COLUMN' &&
            theme.headerColor &&
            theme.headerColor !== theme.pageColor
          }
          data-spacing={theme.spacing}
          style={{
            ...getPageStyle(theme, template),
            width: pageWidth,
            minHeight: pageHeight,
            transform: `scale(${dimensions.scale})`,
          }}
        >
          {sectionsByRegion.PAGE.length > 0 ? (
            <div className={styles.pageRegion}>
              {sectionsByRegion.PAGE.map((section) => (
                <ResumeSection key={section.id} section={section} data={data} theme={theme} />
              ))}
            </div>
          ) : null}
          {match(template.layout)
            .with('SIDEBAR_LEFT', 'SIDEBAR_RIGHT', () => <SidebarLayout {...layoutProps} />)
            .with('WIDE_HEADER', () => <WideHeaderLayout {...layoutProps} />)
            .with('SINGLE_COLUMN', 'CLASSIC_COLUMN', () => <SingleColumnLayout {...layoutProps} />)
            .exhaustive()}
          {sectionsByRegion.FOOTER.length > 0 ? (
            <footer className={styles.footerRegion}>
              {sectionsByRegion.FOOTER.map((section) => (
                <ResumeSection key={section.id} section={section} data={data} theme={theme} />
              ))}
            </footer>
          ) : null}
        </article>
      </div>
    </div>
  );
}

function groupSections(
  sections: TemplateSectionDto[],
  sectionState?: Array<Pick<ResumeSectionDto, 'type' | 'sortOrder' | 'isVisible'>>,
): SectionsByRegion {
  const grouped: SectionsByRegion = {
    PAGE: [],
    HEADER: [],
    SIDEBAR: [],
    MAIN: [],
    FOOTER: [],
  };

  const stateByType = new Map(sectionState?.map((section) => [section.type, section]));
  for (const section of sections) {
    const state = stateByType.get(section.type);
    if (state && !state.isVisible) {
      continue;
    }
    grouped[section.region].push({ ...section, sortOrder: state?.sortOrder ?? section.sortOrder });
  }

  for (const region of Object.keys(grouped) as Array<keyof SectionsByRegion>) {
    grouped[region].sort((left, right) => left.sortOrder - right.sortOrder);
  }

  return grouped;
}

function getPageStyle(theme: TemplateThemeDto, template: TemplateDto): CSSProperties {
  return {
    '--resume-primary': theme.primaryColor,
    '--resume-secondary': theme.secondaryColor,
    '--resume-text': theme.textColor,
    '--resume-page': theme.pageColor,
    '--resume-header':
      template.layout === 'WIDE_HEADER' && !template.theme
        ? theme.primaryColor
        : (theme.headerColor ?? theme.primaryColor),
    '--resume-sidebar': theme.sidebarColor ?? theme.pageColor,
    '--resume-sidebar-text': theme.sidebarColor
      ? contrastTextColor(theme.sidebarColor, theme.textColor)
      : theme.textColor,
    '--resume-title-size': `${theme.titleSizePt}pt`,
    '--resume-section-size': `${theme.sectionTitleSizePt}pt`,
    '--resume-body-size': `${theme.bodySizePt}pt`,
    '--resume-line-height': theme.lineHeight,
    '--resume-sidebar-width': `${template.sidebarWidthPercent ?? 30}%`,
    fontFamily: `${theme.bodyFontFamily}, Arial, sans-serif`,
  } as CSSProperties;
}

function contrastTextColor(background: string, darkText: string): string {
  const luminance = (color: string) => {
    const channels = /^#([\da-f]{2})([\da-f]{2})([\da-f]{2})$/i.exec(color);
    if (!channels) {
      return 0;
    }
    const channel = (index: number) => {
      const value = Number.parseInt(channels[index] ?? '00', 16) / 255;
      return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
    };
    return channel(1) * 0.2126 + channel(2) * 0.7152 + channel(3) * 0.0722;
  };

  const backgroundLuminance = luminance(background);
  const textLuminance = luminance(darkText);
  const whiteContrast = 1.05 / (backgroundLuminance + 0.05);
  const darkContrast =
    (Math.max(backgroundLuminance, textLuminance) + 0.05) /
    (Math.min(backgroundLuminance, textLuminance) + 0.05);
  return whiteContrast >= darkContrast ? '#FFFFFF' : darkText;
}
