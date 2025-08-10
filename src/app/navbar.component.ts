import { Component, ChangeDetectionStrategy, input } from '@angular/core';

@Component({
    selector: 'lc-navbar',
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
    <nav class="top-nav">
      <div class="brand">
        <img [src]="logoSrc()" [alt]="title()" width="24" height="24" />
        <span>{{ title() }}</span>
      </div>
      <a class="gh-link" [href]="repoUrl()" target="_blank" rel="noopener" aria-label="View on GitHub">
        <svg viewBox="0 0 16 16" width="18" height="18" aria-hidden="true" focusable="false"><path fill="currentColor" d="M8 0C3.58 0 0 3.58 0 8a8 8 0 0 0 5.47 7.59c.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82a7.6 7.6 0 0 1 2-.27c.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8Z"></path></svg>
        <span class="sr-only">GitHub</span>
      </a>
    </nav>
  `,
    styles: [
        `:host{display:block;}`,
        `.top-nav{max-width:1100px;margin:0 auto 1rem;padding:.75rem 1rem;display:flex;align-items:center;justify-content:space-between;background:linear-gradient(180deg,rgba(17,24,39,.6),rgba(15,23,42,.35));border:1px solid var(--border);border-radius:12px;box-shadow:0 10px 40px rgba(2,6,23,.65);backdrop-filter:blur(8px)}`,
        `.top-nav .brand{display:flex;align-items:center;gap:.6rem;font-weight:800;letter-spacing:.2px;text-shadow:0 1px 16px rgba(139,92,246,.18)}`,
        `.top-nav .brand img{filter:drop-shadow(0 2px 8px rgba(6,182,212,.24))}`,
        `.gh-link{color:var(--text);text-decoration:none;display:inline-flex;align-items:center;gap:.4rem;padding:.35rem .5rem;border-radius:8px;border:1px solid transparent}`,
        `.gh-link:hover{color:color-mix(in srgb, var(--accent2) 75%, white);border-color:var(--border);background:rgba(148,163,184,.08)}`,
        `.sr-only{position:absolute;width:1px;height:1px;margin:-1px;padding:0;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0}`
    ]
})
export class NavbarComponent {
    readonly title = input<string>('Lib Comparer');
    readonly logoSrc = input<string>('/assets/logo.svg');
    readonly repoUrl = input<string>('https://github.com/pankajparkar/lib-comparer');
}
