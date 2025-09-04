import { DatePipe, DecimalPipe } from '@angular/common';
import { Component, signal, resource, ChangeDetectionStrategy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RecommendationShimmerComponent } from './recommendation-shimmer.component';
import { AiAssistComponent } from './ai-assist.component';

interface LibraryRecommendation {
    id: number;
    name: string;
    packageName: string;
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
    coveragePct?: number; // 0-100
    coverageSource?: string; // where we derived it from
    vulnerable?: boolean;
    vulnCount?: number;
    maxCvss?: number;
    maxSeverityLabel?: string; // critical/high/medium/low
}

@Component({
    selector: 'lc-lib-comparer',
    templateUrl: './lib-comparer.component.html',
    styleUrls: ['./lib-comparer.component.scss'],
    imports: [FormsModule, DecimalPipe, DatePipe, RecommendationShimmerComponent, AiAssistComponent],
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
                // Attempt to derive test coverage (best-effort, fast-fail)
                let coveragePct: number | undefined;
                let coverageSource: string | undefined;
                const owner = repo.owner?.login as string | undefined;
                const branch = (repo.default_branch as string | undefined) ?? 'main';
                const timeout = (ms: number) => new Promise<never>((_, reject) => setTimeout(() => reject(new Error('timeout')), ms));

                async function fetchText(url: string, ms = 1500): Promise<string | undefined> {
                    try {
                        const res = await Promise.race([fetch(url, { headers: { 'Accept': 'text/plain, */*' } }), timeout(ms)]);
                        if (!res.ok || res.status >= 400) return undefined;
                        const text = await res.text();
                        if (!text || text.length < 10) return undefined;
                        return text.slice(0, 200000); // cap
                    } catch { return undefined; }
                }

                // 1. Codecov badge (SVG) – avoid picking attribute percentages like width="100%"
                if (!coveragePct && owner) {
                    const badgeSvg = await fetchText(`https://codecov.io/gh/${owner}/${repo.name}/branch/${branch}/graph/badge.svg`, 1200);
                    if (badgeSvg) {
                        // Capture numeric percent inside a <text> node only
                        const textMatch = badgeSvg.match(/<text[^>]*>\s*([0-9]{1,3})%<\/text>/);
                        let val: number | undefined;
                        if (textMatch) {
                            val = parseInt(textMatch[1], 10);
                        } else {
                            // Fallback: search lines containing % but exclude ones with attribute assignments like ="100%"
                            const line = badgeSvg.split(/\n+/).find(l => /%<\/text>/.test(l));
                            if (line) {
                                const m2 = line.match(/>([0-9]{1,3})%<\/text>/);
                                if (m2) val = parseInt(m2[1], 10);
                            }
                        }
                        if (val !== undefined && val >= 0 && val <= 100) {
                            coveragePct = val; coverageSource = 'codecov-badge';
                        }
                    }
                }
                // 2. Coveralls JSON
                if (!coveragePct && owner) {
                    try {
                        const jsonTxt = await fetchText(`https://coveralls.io/github/${owner}/${repo.name}.json`, 1200);
                        if (jsonTxt) {
                            try {
                                const data = JSON.parse(jsonTxt);
                                const val = data?.coverage ?? data?.covered_percent ?? data?.badge_data?.covered_percent;
                                if (typeof val === 'number' && val >= 0 && val <= 100) { coveragePct = val; coverageSource = 'coveralls'; }
                            } catch { /* ignore parse */ }
                        }
                    } catch { /* ignore */ }
                }
                // 3. Raw coverage summary JSON
                if (!coveragePct && owner) {
                    const summaryTxt = await fetchText(`https://raw.githubusercontent.com/${owner}/${repo.name}/${branch}/coverage/coverage-summary.json`, 1200);
                    if (summaryTxt) {
                        try {
                            const sum = JSON.parse(summaryTxt);
                            const val = sum?.total?.lines?.pct ?? sum?.total?.statements?.pct;
                            if (typeof val === 'number' && val >= 0 && val <= 100) { coveragePct = val; coverageSource = 'coverage-summary'; }
                        } catch { /* ignore */ }
                    }
                }
                // 4. Raw lcov.info
                if (!coveragePct && owner) {
                    const lcovTxt = await fetchText(`https://raw.githubusercontent.com/${owner}/${repo.name}/${branch}/coverage/lcov.info`, 1500);
                    if (lcovTxt) {
                        // Parse LF (lines found) / LH (lines hit)
                        let lfTotal = 0, lhTotal = 0;
                        const lines = lcovTxt.split(/\n+/);
                        for (const line of lines) {
                            if (line.startsWith('LF:')) { const v = parseInt(line.slice(3), 10); if (!isNaN(v)) lfTotal += v; }
                            else if (line.startsWith('LH:')) { const v = parseInt(line.slice(3), 10); if (!isNaN(v)) lhTotal += v; }
                        }
                        if (lfTotal > 0 && lhTotal >= 0) {
                            const pct = (lhTotal / lfTotal) * 100;
                            if (pct >= 0 && pct <= 100) { coveragePct = Math.round(pct * 10) / 10; coverageSource = 'lcov'; }
                        }
                    }
                }

                const rec: LibraryRecommendation = {
                    id: repo.id,
                    name: repo.name,
                    packageName: pkgName,
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
                    coveragePct,
                    coverageSource,
                };
                return rec;
            }));

            // Batch vulnerability lookup via OSV.dev
            try {
                if (mapped.length) {
                    const body = {
                        queries: mapped.map(r => ({ package: { name: r.packageName, ecosystem: 'npm' } }))
                    } as const;
                    const osvRes = await fetch('https://api.osv.dev/v1/querybatch', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(body)
                    });
                    if (osvRes.ok) {
                        const osvData: any = await osvRes.json();
                        const results: any[] = Array.isArray(osvData?.results) ? osvData.results : [];
                        results.forEach((res, idx) => {
                            const vulns: any[] = res?.vulns || [];
                            if (!vulns.length) return;
                            const rec = mapped[idx];
                            if (!rec) return;
                            rec.vulnerable = true;
                            rec.vulnCount = vulns.length;
                            // Derive max CVSS and label
                            let maxCvss = 0;
                            for (const v of vulns) {
                                const sevArr = v?.severity;
                                if (Array.isArray(sevArr)) {
                                    for (const s of sevArr) {
                                        if (s?.score) {
                                            const num = parseFloat(String(s.score));
                                            if (!isNaN(num) && num > maxCvss) maxCvss = num;
                                        }
                                    }
                                }
                            }
                            if (maxCvss > 0) rec.maxCvss = Math.round(maxCvss * 10) / 10;
                            const score = rec.maxCvss ?? 0;
                            let label = 'low';
                            if (score >= 9) label = 'critical';
                            else if (score >= 7) label = 'high';
                            else if (score >= 4) label = 'medium';
                            rec.maxSeverityLabel = label;
                        });
                        // Mark those without vulns explicitly as secure for clarity
                        mapped.forEach(r => { if (r.vulnerable !== true) { r.vulnerable = false; r.vulnCount = 0; } });
                    }
                }
            } catch { /* ignore vulnerability errors */ }

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

    onAIExtract(payload: { framework: string; functionality: string }) {
        this.selectedFramework = payload.framework;
        this.functionality = payload.functionality;
        this.searchLibraries();
    }
}
