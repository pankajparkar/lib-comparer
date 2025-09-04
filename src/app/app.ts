import { Component } from '@angular/core';
import { LibComparerComponent } from './lib-comparer.component';
import { NavbarComponent } from './navbar.component';
import { ThemeToggleComponent } from './theme-toggle.component';

@Component({
  selector: 'lc-root',
  imports: [LibComparerComponent, NavbarComponent, ThemeToggleComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
}
