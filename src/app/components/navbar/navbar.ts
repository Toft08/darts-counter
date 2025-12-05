import { Component } from '@angular/core';
import { RouterLink, Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.html',
  styleUrls: ['./navbar.scss'],
  standalone: true,
  imports: [RouterLink]
})
export class NavbarComponent {
  currentGameMode: string = '';

  constructor(private router: Router) {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      const url = event.urlAfterRedirects || event.url;
      if (url.includes('/x01')) {
        this.currentGameMode = 'X01 Game';
      } else if (url.includes('/checkout')) {
        this.currentGameMode = 'Checkout';
      } else {
        this.currentGameMode = '';
      }
    });
  }
}
