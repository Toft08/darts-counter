import { Component } from '@angular/core';
import { RouterLink, Router, NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { filter } from 'rxjs/operators';
import { GameService } from '../../services/game';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.html',
  styleUrls: ['./navbar.scss'],
  standalone: true,
  imports: [RouterLink, CommonModule, FormsModule]
})
export class NavbarComponent {
  currentGameMode: string = '';
  showSettings: boolean = false;

  constructor(private router: Router, public game: GameService) {
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

  toggleSettings() {
    this.showSettings = !this.showSettings;
  }

  closeSettings() {
    this.showSettings = false;
  }

  onInputModeChange() {
    this.game.resetRound();
  }
}
