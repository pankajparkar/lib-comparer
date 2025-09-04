import { Component, ChangeDetectionStrategy, input } from '@angular/core';

@Component({
  selector: 'lc-navbar',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <nav class="navbar">
      <div class="navbar-brand">
        <img [src]="logoSrc()" [alt]="title()" width="28" height="28" />
        <span class="brand-text">{{ title() }}</span>
      </div>
      
      <div class="navbar-actions">
        <ng-content></ng-content>
        <a class="github-link" [href]="repoUrl()" target="_blank" rel="noopener" aria-label="View on GitHub">
          <svg viewBox="0 0 16 16" width="20" height="20" aria-hidden="true" focusable="false">
            <path fill="currentColor" d="M8 0C3.58 0 0 3.58 0 8a8 8 0 0 0 5.47 7.59c.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82a7.6 7.6 0 0 1 2-.27c.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8Z"></path>
          </svg>
          <span class="sr-only">GitHub</span>
        </a>
      </div>
    </nav>
  `,
  styles: [`
    :host {
      display: block;
      position: sticky;
      top: 0;
      z-index: var(--z-sticky);
      background: var(--color-background);
      border-bottom: 1px solid var(--color-border);
      backdrop-filter: blur(8px);
      -webkit-backdrop-filter: blur(8px);
    }
    
    .navbar {
      max-width: 1200px;
      margin: 0 auto;
      padding: var(--space-md) var(--space-lg);
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: var(--space-md);
    }
    
    .navbar-brand {
      display: flex;
      align-items: center;
      gap: var(--space-sm);
      font-weight: var(--font-weight-bold);
      font-size: var(--font-size-lg);
      color: var(--color-text);
      text-decoration: none;
    }
    
    .navbar-brand img {
      border-radius: var(--radius-sm);
      transition: transform var(--transition-normal);
    }
    
    .navbar-brand:hover img {
      transform: scale(1.05);
    }
    
    .brand-text {
      background: linear-gradient(135deg, var(--color-primary), var(--color-secondary));
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      font-weight: var(--font-weight-extrabold);
      letter-spacing: -0.025em;
    }
    
    .navbar-actions {
      display: flex;
      align-items: center;
      gap: var(--space-sm);
    }
    
    .github-link {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 40px;
      height: 40px;
      color: var(--color-text-muted);
      text-decoration: none;
      border: 1px solid var(--color-border);
      border-radius: var(--radius-lg);
      background: var(--color-surface);
      transition: all var(--transition-normal);
    }
    
    .github-link:hover {
      color: var(--color-text);
      background: var(--color-surface-hover);
      border-color: var(--color-border-strong);
      transform: translateY(-1px);
      box-shadow: var(--shadow-md);
    }
    
    .github-link:active {
      transform: translateY(0);
    }
    
    .github-link:focus-visible {
      outline: 2px solid var(--color-primary);
      outline-offset: 2px;
    }
    
    .sr-only {
      position: absolute;
      width: 1px;
      height: 1px;
      padding: 0;
      margin: -1px;
      overflow: hidden;
      clip: rect(0, 0, 0, 0);
      white-space: nowrap;
      border: 0;
    }
    
    /* Mobile responsiveness */
    @media (max-width: 640px) {
      .navbar {
        padding: var(--space-sm) var(--space-md);
      }
      
      .brand-text {
        display: none;
      }
      
      .navbar-brand img {
        width: 24px;
        height: 24px;
      }
    }
    
    /* High contrast mode */
    @media (prefers-contrast: high) {
      .navbar {
        border-bottom-width: 2px;
      }
      
      .github-link {
        border-width: 2px;
      }
    }
    
    /* Reduced motion */
    @media (prefers-reduced-motion: reduce) {
      .navbar-brand img,
      .github-link {
        transition: none;
      }
      
      .github-link:hover {
        transform: none;
      }
    }
  `]
})
export class NavbarComponent {
  readonly title = input('Lib Comparer');
  readonly logoSrc = input('/logo.svg');
  readonly repoUrl = input('https://github.com/pankajparkar/lib-comparer');
}
