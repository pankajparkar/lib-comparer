import { DatePipe, DecimalPipe } from '@angular/common';
import { Component, signal } from '@angular/core';
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
    recommendations = signal<LibraryRecommendation[]>([]);
    loading = false;

    async searchLibraries() {
        this.loading = true;
        this.recommendations.set([]);
        const query = `${this.selectedFramework} ${this.functionality}`;
        try {
            // Search GitHub repositories
            const githubResults: any[] = await this.fetchGithubRepos(query);
            // For each repo, fetch npm stats and build recommendation
            const recs: LibraryRecommendation[] = [];
            for (const repo of githubResults) {
                const npmStats = await this.fetchNpmStats(repo.name);
                recs.push({
                    id: repo.id,
                    name: repo.name,
                    stars: repo.stargazers_count,
                    forks: repo.forks_count,
                    issues: repo.open_issues_count,
                    lastActivity: repo.pushed_at,
                    users: repo.watchers_count,
                    size: `${repo.size} KB`,
                    downloads: npmStats.downloads,
                    repoUrl: repo.html_url,
                    npmUrl: npmStats.npmUrl
                });
            }
            // Sort by best statistics: stars, downloads, forks, watchers (descending)
            const sorted = recs.sort((a, b) => {
                // Weighted sum: stars + downloads/100 + forks + users
                const aScore = a.stars * 2 + a.downloads / 100 + a.forks + a.users;
                const bScore = b.stars * 2 + b.downloads / 100 + b.forks + b.users;
                return bScore - aScore;
            });
            this.recommendations.set(sorted);
        } catch (err) {
            // Handle error (show message or fallback)
            this.recommendations.set([]);
        }
        this.loading = false;
    }

    async fetchGithubRepos(query: string): Promise<any[]> {
        const url = `https://api.github.com/search/repositories?q=${encodeURIComponent(query)}&sort=stars&order=desc&per_page=5`;
        const res = await fetch(url);
        const data = await res.json();
        return data.items || [];
    }

    async fetchNpmStats(pkgName: string): Promise<{ downloads: number, npmUrl: string }> {
        // Get npm downloads (last month)
        const url = `https://api.npmjs.org/downloads/point/last-month/${encodeURIComponent(pkgName)}`;
        let downloads = 0;
        let npmUrl = `https://www.npmjs.com/package/${pkgName}`;
        try {
            const res = await fetch(url);
            const data = await res.json();
            downloads = data.downloads || 0;
        } catch {
            downloads = 0;
        }
        return { downloads, npmUrl };
    }
}
