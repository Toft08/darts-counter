
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GameService } from '../../services/game';

@Component({
  selector: 'app-checkout',
  templateUrl: './checkout.html',
  standalone: true,
  imports: [CommonModule, FormsModule]
})
export class CheckoutComponent {
  startNumber: number = 40;
  trainingStarted: boolean = false;
  currentScore: number = 40;
  throwsLeft: number = 9;
  throwScore: number = 0;
  scoreInput: number = 0;
  status: string = '';

  constructor(public game: GameService) {}

  startTraining() {
    this.game.initCheckout(this.startNumber);
    this.currentScore = this.startNumber;
    this.throwsLeft = 9 - this.game.throws;
    this.trainingStarted = true;
    this.status = '';
  }

  submitThrow() {
    if (this.throwScore > 0 && this.throwScore <= this.currentScore) {
      const result = this.game.throw(this.throwScore);
      this.currentScore = this.game.checkoutCurrent;
      this.throwsLeft = 9 - this.game.throws;
      this.status = result;
      
      if (result === 'success') {
        this.startNumber = this.game.checkoutStart;
        this.currentScore = this.startNumber;
        this.throwsLeft = 9;
      } else if (result === 'reset') {
        this.currentScore = this.startNumber;
        this.throwsLeft = 9;
      }
    }
    this.throwScore = 0;
  }

  throw() {
    const result = this.game.throw(this.scoreInput);
    this.status = result;
    this.scoreInput = 0;
  }
}
