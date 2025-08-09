import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { LibComparerComponent } from './lib-comparer.component';

@Component({
  selector: 'lc-root',
  imports: [RouterOutlet, LibComparerComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
}
