import { Component } from '@angular/core';
import { LibComparerComponent } from './lib-comparer.component';
import { NavbarComponent } from './navbar.component';
import { ThemeToggleComponent } from './theme-toggle.component';
import { AiSetupModalComponent } from './ai-setup-modal.component';

@Component({
  selector: 'lc-root',
  imports: [LibComparerComponent, NavbarComponent, ThemeToggleComponent, AiSetupModalComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
}
