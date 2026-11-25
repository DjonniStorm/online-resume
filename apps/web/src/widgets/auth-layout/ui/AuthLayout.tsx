import type { PropsWithChildren } from 'react';

import classes from './AuthLayout.module.css';

export function AuthLayout({ children }: PropsWithChildren) {
  return (
    <div className={classes.shell}>
      <aside className={classes.intro}>
        <div className={classes.introBody}>
          <p className={classes.caption}>Варианты оформления</p>
          <img
            className={classes.illustration}
            src="/resume-layouts.svg"
            alt="Три варианта оформления резюме"
            width="600"
            height="410"
          />
        </div>
      </aside>

      <main className={classes.main}>
        <div className={classes.formArea}>{children}</div>
      </main>
    </div>
  );
}
