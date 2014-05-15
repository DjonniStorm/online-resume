import type { ReactNode } from 'react';

import classes from './AuthLayout.module.css';

type AuthLayoutProps = {
  children: ReactNode;
};

export function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className={classes.shell}>
      <aside className={classes.intro}>
        <div className={classes.introBody}>
          <div className={classes.paper} aria-hidden="true">
            <div className={classes.paperHeader}>
              <span className={classes.avatar} />
              <span className={classes.paperIdentity}>
                <span />
                <span />
              </span>
            </div>
            <div className={classes.paperRule} />
            <div className={classes.paperColumns}>
              <div className={classes.paperColumn}>
                <span className={classes.lineAccent} />
                <span />
                <span />
                <span className={classes.shortLine} />
                <span className={classes.sectionGap} />
                <span className={classes.lineAccent} />
                <span />
                <span className={classes.shortLine} />
              </div>
              <div className={classes.paperColumn}>
                <span className={classes.lineAccent} />
                <span />
                <span />
                <span />
                <span className={classes.shortLine} />
                <span className={classes.sectionGap} />
                <span className={classes.lineAccent} />
                <span />
              </div>
            </div>
          </div>
          <h2>Резюме, которое легко обновлять</h2>
          <p>Соберите профессиональную историю в одном месте и возвращайтесь к ней, когда нужно.</p>
        </div>
      </aside>

      <main className={classes.main}>
        <div className={classes.formArea}>{children}</div>
      </main>
    </div>
  );
}
