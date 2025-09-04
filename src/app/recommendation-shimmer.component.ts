import { Component, ChangeDetectionStrategy, computed, input } from '@angular/core';

@Component({
  selector: 'lc-recommendation-shimmer',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="card-list">
      @for(i of items(); track i) {
        <div class="lib-card skeleton">
          <div class="lib-card-header">
            <h3 class="shimmer" style="width: 50%">&nbsp;</h3>
            <span class="npm-link shimmer" style="width: 60px">&nbsp;</span>
          </div>
          <ul class="lib-stats">
            @for(r of rows; track r) {
              <li>
                <span class="stat-label shimmer" style="width: 140px">&nbsp;</span>
                <strong class="shimmer" style="width: 80px">&nbsp;</strong>
              </li>
            }
          </ul>
        </div>
      }
    </div>
  `,
  styles: [`
        :host { 
          display: block; 
        }
        
        .card-list { 
          display: grid; 
          grid-template-columns: repeat(auto-fill, minmax(400px, 1fr)); 
          gap: var(--space-xl);
          margin-top: var(--space-lg);
        }
        
        .lib-card { 
          position: relative;
          background: var(--color-surface-elevated);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-xl);
          padding: var(--space-xl);
          display: flex;
          flex-direction: column;
          gap: var(--space-lg);
          box-shadow: var(--shadow-sm);
        }
        
        .lib-card-header { 
          display: flex; 
          align-items: center; 
          justify-content: space-between; 
          gap: var(--space-md);
        }
        
        .npm-link { 
          background: var(--color-surface);
          color: transparent;
          font-weight: var(--font-weight-semibold);
          padding: var(--space-xs) var(--space-sm);
          border-radius: var(--radius-md);
          border: 1px solid var(--color-border);
          font-size: var(--font-size-xs);
        }
        
        .lib-stats { 
          list-style: none; 
          padding: 0; 
          margin: 0; 
          display: grid; 
          grid-template-columns: repeat(auto-fit, minmax(120px, 1fr)); 
          gap: var(--space-md);
        }
        
        .stat-label { 
          margin-right: var(--space-xs);
        }
        
        .shimmer { 
          display: inline-block;
          background: linear-gradient(
            90deg,
            var(--color-surface) 25%,
            var(--color-surface-hover) 37%,
            var(--color-surface) 63%
          );
          background-size: 400% 100%;
          animation: shimmer 1.4s ease infinite;
          color: transparent;
          border-radius: var(--radius-sm);
        }
        
        @keyframes shimmer { 
          0% { background-position: 100% 0; } 
          100% { background-position: -100% 0; } 
        }
        
        /* Mobile responsiveness */
        @media (max-width: 768px) {
          .card-list {
            grid-template-columns: 1fr;
            gap: var(--space-lg);
          }
          
          .lib-stats {
            grid-template-columns: repeat(2, 1fr);
          }
        }
        
        @media (max-width: 480px) {
          .lib-stats {
            grid-template-columns: 1fr;
          }
        }
        
        /* Reduced motion */
        @media (prefers-reduced-motion: reduce) {
          .shimmer {
            animation: none;
            background: var(--color-surface);
          }
        }
    `]
})
export class RecommendationShimmerComponent {
  readonly count = input<number>(4);
  readonly rows = [1, 2, 3, 4, 5, 6, 7];
  readonly items = computed(() => Array.from({ length: Math.max(1, this.count() ?? 4) }, (_, i) => i));
}
