import { DatePipe, DecimalPipe } from '@angular/common';
import { Component, signal, resource, ChangeDetectionStrategy } from '@angular/core';
import { FormsModule } from '@angular/forms';

interface LibraryRecommendation {
    id: number;
    name: string;
    stars: number;
    forks: number;
    issues: number;
    lastActivity: string;
    users: number;
    size: string;
    bundleSize?: number; // bytes, minified
    gzipSize?: number;   // bytes, gzipped
    downloads: number;
    repoUrl: string;
    npmUrl: string;
}

@Component({
    selector: 'lc-lib-comparer',
    templateUrl: './lib-comparer.component.html',
    styleUrls: ['./lib-comparer.component.scss'],
    imports: [FormsModule, DecimalPipe, DatePipe],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LibComparerComponent {
    frameworks = [
        'Angular', 'React', 'Vue', 'Svelte', 'jQuery', 'Bootstrap', 'Tailwind', 'Material UI', 'Ant Design', 'PrimeNG', 'Date-fns', 'Moment.js', 'Lodash', 'RxJS', 'D3.js', 'Chart.js'
    ];
    selectedFramework = '';
    functionality = '';
    // UI state
    readonly sortBy = signal<'score' | 'stars' | 'downloads' | 'recent'>('score');
    readonly perPage = signal(5);

    // Trigger signal for Resource API
    private readonly query = signal<{ framework: string; functionality: string } | null>(null);

    // Resource that loads recommendations using GitHub + npm APIs
    readonly recResource = resource<LibraryRecommendation[], {
        framework: string;
        functionality: string;
        perPage: number;
        sortBy: 'score' | 'stars' | 'downloads' | 'recent';
    } | null>({
        params: () => {
            const q = this.query();
            return q ? { ...q, perPage: this.perPage(), sortBy: this.sortBy() } : null;
        },
        loader: async ({ params }) => {
            if (!params) return [];
            const { framework, functionality, perPage, sortBy } = params;
            const search = `${framework} ${functionality}`.trim();

            // GitHub search
            const ghUrl = `https://api.github.com/search/repositories?q=${encodeURIComponent(search)}&sort=stars&order=desc&per_page=${perPage}`;
            const ghRes = await fetch(ghUrl);
            const ghData = await ghRes.json();
            const items: any[] = ghData?.items ?? [];

            // For each repo, also fetch npm stats in parallel
            const mapped = await Promise.all(items.map(async (repo) => {
                // Try to resolve the actual npm package name via package.json; fallback to repo name
                let pkgName: string = repo.name as string;
                try {
                    const owner = repo.owner?.login as string | undefined;
                    const branch = (repo.default_branch as string | undefined) ?? 'main';
                    if (owner) {
                        const pkgUrl = `https://raw.githubusercontent.com/${owner}/${repo.name}/${branch}/package.json`;
                        const pRes = await fetch(pkgUrl);
                        if (pRes.ok) {
                            const pJson = await pRes.json();
                            if (typeof pJson?.name === 'string' && pJson.name.trim()) {
                                pkgName = pJson.name.trim();
                            }
                        }
                    }
                } catch { /* ignore */ }
                const npmUrl = `https://www.npmjs.com/package/${pkgName}`;
                const npmApi = `https://api.npmjs.org/downloads/point/last-month/${encodeURIComponent(pkgName)}`;
                let downloads = 0;
                let bundleSize: number | undefined = undefined;
                let gzipSize: number | undefined = undefined;
                try {
                    const nRes = await fetch(npmApi);
                    const nData = await nRes.json();
                    downloads = nData?.downloads ?? 0;
                } catch { /* ignore */ }
                // Use Deno BundleJS: try meta API first
                try {
                    const bjUrl = `https://deno.bundlejs.com/?q=${encodeURIComponent(pkgName)}&meta`;
                    const bjRes = await fetch(bjUrl);
                    if (bjRes.ok) {
                        const bjData: any = await bjRes.json();
                        const s = bjData?.bundle?.size ?? bjData?.size ?? bjData?.meta?.size;
                        const g = bjData?.bundle?.gzip ?? bjData?.gzip ?? bjData?.meta?.gzip;
                        if (typeof s === 'number') bundleSize = s;
                        if (typeof g === 'number') gzipSize = g;
                    }
                } catch { /* ignore */ }
                const rec: LibraryRecommendation = {
                    id: repo.id,
                    name: repo.name,
                    stars: repo.stargazers_count,
                    forks: repo.forks_count,
                    issues: repo.open_issues_count,
                    lastActivity: repo.pushed_at,
                    users: repo.watchers_count,
                    size: `${repo.size} KB`,
                    bundleSize,
                    gzipSize,
                    downloads,
                    repoUrl: repo.html_url,
                    npmUrl,
                };
                return rec;
            }));

            // Sort on the server-side result based on sortBy
            const sorted = [...mapped];
            switch (sortBy) {
                case 'stars':
                    sorted.sort((a, b) => b.stars - a.stars); break;
                case 'downloads':
                    sorted.sort((a, b) => b.downloads - a.downloads); break;
                case 'recent':
                    sorted.sort((a, b) => new Date(b.lastActivity).getTime() - new Date(a.lastActivity).getTime()); break;
                case 'score':
                default:
                    sorted.sort((a, b) => {
                        const aScore = a.stars * 2 + a.downloads / 100 + a.forks + a.users;
                        const bScore = b.stars * 2 + b.downloads / 100 + b.forks + b.users;
                        return bScore - aScore;
                    });
            }
            return sorted;
        }
    });

    searchLibraries() {
        this.perPage.set(8);
        this.query.set({ framework: this.selectedFramework, functionality: this.functionality });
        // persist query & sort
        this.persistPrefs();
    }

    setSort(mode: 'score' | 'stars' | 'downloads' | 'recent') {
        this.sortBy.set(mode);
        this.persistPrefs();
    }

    loadMore() {
        this.perPage.update(v => Math.min(v + 5, 40));
        // updating perPage triggers resource params recompute
    }

    private persistPrefs() {
        try {
            localStorage.setItem('lc_prefs', JSON.stringify({
                sortBy: this.sortBy(),
                framework: this.selectedFramework,
                functionality: this.functionality
            }));
        } catch { /* no-op */ }
    }

    constructor() {
        try {
            const raw = localStorage.getItem('lc_prefs');
            if (raw) {
                const p = JSON.parse(raw) as { sortBy?: 'score' | 'stars' | 'downloads' | 'recent'; framework?: string; functionality?: string };
                if (p.sortBy) this.sortBy.set(p.sortBy);
                if (p.framework) this.selectedFramework = p.framework;
                if (p.functionality) this.functionality = p.functionality;
            }
        } catch { /* ignore */ }
    }
}
