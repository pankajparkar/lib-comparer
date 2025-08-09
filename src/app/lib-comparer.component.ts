import { DatePipe, DecimalPipe } from '@angular/common';
import { Component, signal, resource, effect } from '@angular/core';
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
    downloads: number;
    repoUrl: string;
    npmUrl: string;
}

@Component({
    selector: 'lc-lib-comparer',
    templateUrl: './lib-comparer.component.html',
    styleUrls: ['./lib-comparer.component.scss'],
    imports: [FormsModule, DecimalPipe, DatePipe],
})
export class LibComparerComponent {
    frameworks = [
        'Angular', 'React', 'Vue', 'Svelte', 'jQuery', 'Bootstrap', 'Tailwind', 'Material UI', 'Ant Design', 'PrimeNG', 'Date-fns', 'Moment.js', 'Lodash', 'RxJS', 'D3.js', 'Chart.js'
    ];
    selectedFramework = '';
    functionality = '';
    loading = false;

    // Trigger signal for Resource API
    private readonly query = signal<{ framework: string; functionality: string } | null>(null);

    // Resource that loads recommendations using GitHub + npm APIs
    private readonly recResource = resource<LibraryRecommendation[], {
        framework: string;
        functionality: string;
    } | null>({
        params: () => this.query(),
        loader: async ({ params }) => {
            if (!params) return [];
            const { framework, functionality } = params;
            const search = `${framework} ${functionality}`.trim();

            // GitHub search
            const ghUrl = `https://api.github.com/search/repositories?q=${encodeURIComponent(search)}&sort=stars&order=desc&per_page=5`;
            const ghRes = await fetch(ghUrl);
            const ghData = await ghRes.json();
            const items: any[] = ghData?.items ?? [];

            // For each repo, also fetch npm stats in parallel
            const mapped = await Promise.all(items.map(async (repo) => {
                const pkgName = repo.name as string;
                const npmUrl = `https://www.npmjs.com/package/${pkgName}`;
                const npmApi = `https://api.npmjs.org/downloads/point/last-month/${encodeURIComponent(pkgName)}`;
                let downloads = 0;
                try {
                    const nRes = await fetch(npmApi);
                    const nData = await nRes.json();
                    downloads = nData?.downloads ?? 0;
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
                    downloads,
                    repoUrl: repo.html_url,
                    npmUrl,
                };
                return rec;
            }));

            // Sort best-first
            return mapped.sort((a, b) => {
                const aScore = a.stars * 2 + a.downloads / 100 + a.forks + a.users;
                const bScore = b.stars * 2 + b.downloads / 100 + b.forks + b.users;
                return bScore - aScore;
            });
        }
    });
}
