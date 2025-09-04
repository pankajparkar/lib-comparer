import { Component, ChangeDetectionStrategy, signal, effect, inject } from '@angular/core';
import { DOCUMENT } from '@angular/common';

@Component({
    selector: 'lc-theme-toggle',
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
    <button 
      type="button" 
      class="theme-toggle"
      (click)="toggleTheme()"
      [attr.aria-label]="'Switch to ' + (currentTheme() === 'light' ? 'dark' : 'light') + ' theme'"
      [title]="'Switch to ' + (currentTheme() === 'light' ? 'dark' : 'light') + ' theme'"
    >
      <svg 
        class="theme-icon" 
        [class.hidden]="currentTheme() === 'dark'"
        width="20" 
        height="20" 
        viewBox="0 0 24 24" 
        fill="none" 
        stroke="currentColor" 
        stroke-width="2" 
        stroke-linecap="round" 
        stroke-linejoin="round"
      >
        <circle cx="12" cy="12" r="5"/>
        <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/>
      </svg>
      <svg 
        class="theme-icon" 
        [class.hidden]="currentTheme() === 'light'"
        width="20" 
        height="20" 
        viewBox="0 0 24 24" 
        fill="none" 
        stroke="currentColor" 
        stroke-width="2" 
        stroke-linecap="round" 
        stroke-linejoin="round"
      >
        <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
      </svg>
    </button>
  `,
    styles: [`
    :host {
      display: block;
    }
    
    .theme-toggle {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 40px;
      height: 40px;
      border: 1px solid var(--color-border);
      border-radius: var(--radius-lg);
      background: var(--color-surface);
      color: var(--color-text);
      cursor: pointer;
      transition: all var(--transition-normal);
      position: relative;
      overflow: hidden;
    }
    
    .theme-toggle:hover {
      background: var(--color-surface-hover);
      border-color: var(--color-border-strong);
      transform: translateY(-1px);
      box-shadow: var(--shadow-md);
    }
    
    .theme-toggle:active {
      transform: translateY(0);
    }
    
    .theme-toggle:focus-visible {
      outline: 2px solid var(--color-primary);
      outline-offset: 2px;
    }
    
    .theme-icon {
      position: absolute;
      transition: all var(--transition-normal);
      opacity: 1;
      transform: rotate(0deg) scale(1);
    }
    
    .theme-icon.hidden {
      opacity: 0;
      transform: rotate(180deg) scale(0.8);
    }
    
    .theme-toggle:hover .theme-icon {
      transform: rotate(5deg) scale(1.1);
    }
    
    .theme-toggle:hover .theme-icon.hidden {
      transform: rotate(175deg) scale(0.9);
    }
    
    /* High contrast mode adjustments */
    @media (prefers-contrast: high) {
      .theme-toggle {
        border-width: 2px;
      }
      
      .theme-toggle:hover {
        border-width: 3px;
      }
    }
    
    /* Reduced motion */
    @media (prefers-reduced-motion: reduce) {
      .theme-toggle,
      .theme-icon {
        transition: none;
      }
      
      .theme-toggle:hover {
        transform: none;
      }
      
      .theme-toggle:hover .theme-icon {
        transform: none;
      }
    }
  `]
})
export class ThemeToggleComponent {
    private document = inject(DOCUMENT);

    readonly currentTheme = signal<'light' | 'dark' | 'high-contrast'>('light');

    constructor() {
        // Initialize theme from localStorage or system preference
        const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | 'high-contrast' | null;
        const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        const systemPrefersHighContrast = window.matchMedia('(prefers-contrast: high)').matches;

        let initialTheme: 'light' | 'dark' | 'high-contrast' = 'light';

        if (savedTheme) {
            initialTheme = savedTheme;
        } else if (systemPrefersHighContrast) {
            initialTheme = 'high-contrast';
        } else if (systemPrefersDark) {
            initialTheme = 'dark';
        }

        this.currentTheme.set(initialTheme);
        this.applyTheme(initialTheme);

        // Watch for system theme changes
        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
            if (!localStorage.getItem('theme')) {
                this.currentTheme.set(e.matches ? 'dark' : 'light');
                this.applyTheme(e.matches ? 'dark' : 'light');
            }
        });

        window.matchMedia('(prefers-contrast: high)').addEventListener('change', (e) => {
            if (!localStorage.getItem('theme')) {
                this.currentTheme.set(e.matches ? 'high-contrast' : 'light');
                this.applyTheme(e.matches ? 'high-contrast' : 'light');
            }
        });

        // Effect to apply theme changes
        effect(() => {
            this.applyTheme(this.currentTheme());
        });
    }

    toggleTheme() {
        const themes: ('light' | 'dark' | 'high-contrast')[] = ['light', 'dark', 'high-contrast'];
        const currentIndex = themes.indexOf(this.currentTheme());
        const nextIndex = (currentIndex + 1) % themes.length;
        const nextTheme = themes[nextIndex];

        this.currentTheme.set(nextTheme);
        localStorage.setItem('theme', nextTheme);
    }

    private applyTheme(theme: 'light' | 'dark' | 'high-contrast') {
        this.document.documentElement.setAttribute('data-theme', theme);

        // Update meta theme-color for mobile browsers
        let metaThemeColor = this.document.querySelector('meta[name="theme-color"]');
        if (!metaThemeColor) {
            metaThemeColor = this.document.createElement('meta');
            metaThemeColor.setAttribute('name', 'theme-color');
            this.document.head.appendChild(metaThemeColor);
        }

        const themeColors = {
            light: '#ffffff',
            dark: '#0f172a',
            'high-contrast': '#000000'
        };

        metaThemeColor.setAttribute('content', themeColors[theme]);
    }
}
