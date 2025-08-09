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
    styles: [
        `:host { display: block; }`,
        `.card-list { display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 1.25rem; margin-top: 1rem; }`,
        `.lib-card { position: relative; background: linear-gradient(180deg, rgba(17, 24, 39, 0.9), rgba(15, 23, 42, 0.7)); border-radius: 14px; border: 1px solid var(--border, rgba(148, 163, 184, 0.18)); padding: 1.25rem 1rem; display: flex; flex-direction: column; gap: 0.8rem; box-shadow: 0 10px 40px rgba(2, 6, 23, 0.65); }`,
        `.lib-card-header { display: flex; align-items: center; justify-content: space-between; gap: 1rem; }`,
        `.npm-link { background: rgba(148, 163, 184, 0.1); color: transparent; font-weight: 700; padding: 0.3rem 0.7rem; border-radius: 7px; border: 1px solid rgba(148, 163, 184, 0.18); }`,
        `.lib-stats { list-style: none; padding: 0; margin: 0; display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 8px 16px; }`,
        `.stat-label { margin-right: 6px; }`,
        `.shimmer { display: inline-block; background: linear-gradient(90deg, rgba(148, 163, 184, 0.18) 25%, rgba(30, 41, 59, 0.5) 37%, rgba(148, 163, 184, 0.18) 63%); background-size: 400% 100%; animation: shimmer 1.4s ease infinite; color: transparent; border-radius: 6px; }`,
        `@keyframes shimmer { 0% { background-position: 100% 0; } 100% { background-position: -100% 0; } }`,
    ]
})
export class RecommendationShimmerComponent {
    readonly count = input<number>(4);
    readonly rows = [1, 2, 3, 4, 5, 6, 7];
    readonly items = computed(() => Array.from({ length: Math.max(1, this.count() ?? 4) }, (_, i) => i));
}
