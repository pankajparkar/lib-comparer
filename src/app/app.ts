import { Component } from '@angular/core';
import { LibComparerComponent } from './lib-comparer.component';

@Component({
  selector: 'lc-root',
  imports: [LibComparerComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
}
