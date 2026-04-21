import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Header} from './components/header/header';
import { Footer } from './components/footer/footer';
import { Sidebar } from './components/sidebar/sidebar';
import { DealsDay } from './components/deals-day/deals-day';
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    Header,
    Footer,
    Sidebar,
    DealsDay
  ],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected readonly title = signal('frontend');
}
