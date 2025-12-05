
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GameService } from '../../services/game';
import { DartsInputComponent } from '../../components/darts-input/darts-input';

@Component({
  selector: 'app-x01',
  templateUrl: './x01.html',
  standalone: true,
  imports: [CommonModule, FormsModule, DartsInputComponent]
})
export class X01Component {
  startPoints: number = 501;
  legs: number = 1;
  gameStarted: boolean = false;
  currentScore: number = 501;
  legsLeft: number = 1;

  constructor(public game: GameService) {}

  startGame() {
    this.game.initX01(this.startPoints, this.legs);
    this.currentScore = this.startPoints;
    this.legsLeft = this.legs;
    this.gameStarted = true;
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
      alert('Bust! Score too high. Round reset.');
      return;
    }

    this.currentScore = result.newScore;

    if (result.finished) {
      this.legsLeft--;
      if (this.legsLeft > 0) {
        alert('Leg won! Starting next leg...');
        this.currentScore = this.startPoints;
      } else {
        alert('🎉 Game won!');
        this.gameStarted = false;
      }
    }
  }
}
