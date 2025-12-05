
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GameService } from '../../services/game';
import { DartsInputComponent } from '../../components/darts-input/darts-input';

@Component({
  selector: 'app-checkout',
  templateUrl: './checkout.html',
  standalone: true,
  imports: [CommonModule, FormsModule, DartsInputComponent]
})
export class CheckoutComponent {
  startNumber: number = 40;
  trainingStarted: boolean = false;
  currentScore: number = 40;
  status: string = '';

  constructor(public game: GameService) {}

  startTraining() {
    this.game.initCheckout(this.startNumber);
    this.currentScore = this.startNumber;
    this.trainingStarted = true;
    this.status = '';
  }

  onDartSubmit(dartScore: number) {
    const result = this.game.inputMode === 'dart-by-dart'
      ? this.game.submitDart(dartScore, this.currentScore)
      : this.game.submitTurn(dartScore, this.currentScore);

    if (!result.valid) {
      alert('Invalid score! Must be between 0-180');
      return;
    }

    if (result.bust) {
      alert('Bust! Score too high. Resetting...');
      this.status = '';
      return;
    }

    this.currentScore = result.newScore;

    if (result.finished) {
      this.startNumber++;
      this.status = 'success';
      setTimeout(() => {
        alert(`✅ You checked out! Next target: ${this.startNumber}`);
        this.currentScore = this.startNumber;
        this.game.checkoutStart = this.startNumber;
        this.status = '';
      }, 100);
    }
  }
}
