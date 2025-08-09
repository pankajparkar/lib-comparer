import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
    selector: 'lc-lib-comparer',
    templateUrl: './lib-comparer.component.html',
    styleUrls: ['./lib-comparer.component.scss'],
    imports: [LibComparerComponent, FormsModule],
})
export class LibComparerComponent {
    frameworks = [
        'Angular', 'React', 'Vue', 'Svelte', 'jQuery', 'Bootstrap', 'Tailwind', 'Material UI', 'Ant Design', 'PrimeNG', 'Date-fns', 'Moment.js', 'Lodash', 'RxJS', 'D3.js', 'Chart.js'
    ];
    selectedFramework = '';
    functionality = '';
    recommendations: any[] = [];
    loading = false;

    async searchLibraries() {
        this.loading = true;
        // TODO: Replace with real API call to fetch recommendations
        this.recommendations = [
            {
                name: 'ngx-datepicker',
                stars: 1200,
                forks: 150,
                issues: 12,
                lastActivity: '2025-08-01',
                users: 5000,
                size: '120KB',
                downloads: 20000
            },
            {
                name: 'ng-select',
                stars: 3000,
                forks: 400,
                issues: 5,
                lastActivity: '2025-07-20',
                users: 12000,
                size: '80KB',
                downloads: 50000
            }
        ];
        this.loading = false;
    }
}
