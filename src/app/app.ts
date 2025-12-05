import { Component } from '@angular/core';
import { RouterOutlet, RouterLink } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink],
  template: `
    <div class="app-container">
      <nav>
        <a routerLink="/x01">X01 Game</a>
        <a routerLink="/checkout">Checkout Training</a>
      </nav>
      <router-outlet></router-outlet>
    </div>
  `,
  styles: [`
    .app-container { padding: 20px; }
    nav { margin-bottom: 20px; }
    nav a { margin-right: 15px; padding: 10px; text-decoration: none; background: #007bff; color: white; border-radius: 5px; }
    nav a:hover { background: #0056b3; }
  `]
})
export class AppComponent {}
