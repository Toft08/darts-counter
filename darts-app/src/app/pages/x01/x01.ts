
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GameService } from '../../services/game';

@Component({
  selector: 'app-x01',
  templateUrl: './x01.html',
  standalone: true,
  imports: [CommonModule, FormsModule]
})
export class X01Component {
  startPoints: number = 501;
  legs: number = 1;
  gameStarted: boolean = false;
  currentScore: number = 501;
  legsLeft: number = 1;
  throwScore: number = 0;
  scoreInput: number = 0;

  constructor(public game: GameService) {}

  startGame() {
    this.game.initX01(this.startPoints, this.legs);
    this.currentScore = this.startPoints;
    this.legsLeft = this.legs;
    this.gameStarted = true;
  }

  submitThrow() {
    if (this.throwScore > 0 && this.throwScore <= this.currentScore) {
      const won = this.game.subtract(this.throwScore);
      this.currentScore = this.game.currentScore;
      
      if (won) {
        this.legsLeft--;
        if (this.legsLeft > 0) {
          alert('Leg won! Starting next leg...');
          this.currentScore = this.startPoints;
          this.game.currentScore = this.startPoints;
        } else {
          alert('Game won!');
          this.gameStarted = false;
        }
      }
    }
    this.throwScore = 0;
  }

  subtract() {
    if (this.game.subtract(this.scoreInput)) {
      alert("Leg won!");
    }
    this.scoreInput = 0;
  }
}
