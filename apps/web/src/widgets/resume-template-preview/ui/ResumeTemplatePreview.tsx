import { type CSSProperties, useLayoutEffect, useRef, useState } from 'react';
import { match } from 'ts-pattern';

import type {
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
};

const pixelsPerMm = 96 / 25.4;

export function ResumeTemplatePreview({
  template,
  data = previewFixture,
}: ResumeTemplatePreviewProps) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const pageRef = useRef<HTMLElement>(null);
  const [dimensions, setDimensions] = useState({ scale: 1, height: 0 });
  const theme = template.theme ?? defaultTheme;
  const pageWidth = Number(template.pageWidthMm) * pixelsPerMm;
  const pageHeight = Number(template.pageHeightMm) * pixelsPerMm;
  const sectionsByRegion = groupSections(template.sections);
  const layoutProps = { data, sectionsByRegion, theme, template };

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
            .with('SINGLE_COLUMN', () => <SingleColumnLayout {...layoutProps} />)
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

function groupSections(sections: TemplateSectionDto[]): SectionsByRegion {
  const grouped: SectionsByRegion = {
    PAGE: [],
    HEADER: [],
    SIDEBAR: [],
    MAIN: [],
    FOOTER: [],
  };

  for (const section of sections) {
    grouped[section.region].push(section);
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
    '--resume-title-size': `${theme.titleSizePt}pt`,
    '--resume-section-size': `${theme.sectionTitleSizePt}pt`,
    '--resume-body-size': `${theme.bodySizePt}pt`,
    '--resume-line-height': theme.lineHeight,
    '--resume-sidebar-width': `${template.sidebarWidthPercent ?? 30}%`,
    fontFamily: `${theme.bodyFontFamily}, Arial, sans-serif`,
  } as CSSProperties;
}
