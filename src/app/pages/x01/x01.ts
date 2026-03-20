
import { Component, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GameService } from '../../services/game';
import { DartsInputComponent } from '../../components/darts-input/darts-input';
import { PlayerCardComponent } from '../../components/player-card/player-card';
import { DartThrow, isSyntheticThrow } from '../../models/dart-throw.model';

interface Player {
  name: string;
  score: number;
  legsWon: number;
  lastDarts: [number, number, number]; // Last 3 darts thrown
}

@Component({
  selector: 'app-x01',
  templateUrl: './x01.html',
  styleUrls: ['./x01.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, DartsInputComponent, PlayerCardComponent]
})
export class X01Component {
  @ViewChild(DartsInputComponent) dartsInput!: DartsInputComponent;
  
  startPoints: number = 501;
  legs: number = 3;
  gameStarted: boolean = false;
  matchWinner: string = '';
  errorMsg: string = '';
  showManualInput: boolean = false;
  showManualLegs: boolean = false;
  players: Player[] = [];
  newPlayerName: string = '';
  currentPlayerIndex: number = 0;

  constructor(public game: GameService) {}

  get currentPlayer(): Player {
    return this.players[this.currentPlayerIndex];
  }

  addPlayer(name?: string) {
    const playerName = name || this.newPlayerName.trim() || `Player ${this.players.length + 1}`;
    this.players.push({
      name: playerName,
      score: this.startPoints,
      legsWon: 0,
      lastDarts: [0, 0, 0]
    });
    this.newPlayerName = '';
  }

  removePlayer(index: number) {
    this.players.splice(index, 1);
    if (this.currentPlayerIndex >= this.players.length && this.players.length > 0) {
      this.currentPlayerIndex = 0;
    }
  }

  startGame() {
    if (this.players.length === 0) {
      this.addPlayer('Thrower');
    }
    this.game.initX01(this.startPoints, this.legs);
    this.players.forEach(p => {
      p.score = this.startPoints;
      p.legsWon = 0;
    });
    this.currentPlayerIndex = 0;
    this.gameStarted = true;
  }

  nextPlayer() {
    // Move to next player
    this.currentPlayerIndex = (this.currentPlayerIndex + 1) % this.players.length;
    
    // Clear the dart displays for the new player
    this.game.resetRound();
  }

  onDartThrown(dart: DartThrow) {
    const isPerTurn = isSyntheticThrow(dart);

    // Capture dart values before submit — submitDart resets dart1/2/3 on bust or finish.
    const dartInRound = isPerTurn ? 3 : this.game.getCurrentDartInRound();
    const dartsBeforeSubmit: [number, number, number] = [
      dartInRound === 1 ? dart.score : this.game.dart1,
      dartInRound === 2 ? dart.score : this.game.dart2,
      dartInRound === 3 ? dart.score : this.game.dart3,
    ];

    // Save accumulated round score so we can restore it on a mid-round bust.
    const roundScoreSoFar = this.game.roundScore;

    const result = isPerTurn
      ? this.game.submitTurn(dart.score, this.currentPlayer.score)
      : this.game.submitDart(dart, this.currentPlayer.score);

    if (!result.valid) {
      this.showError('Invalid score! Must be between 0–180');
      return;
    }

    if (result.bust) {
      // Restore any score that was already deducted by earlier darts in this round.
      this.currentPlayer.score += roundScoreSoFar;
      this.currentPlayer.lastDarts = dartsBeforeSubmit;
      this.nextPlayer();
      return;
    }

    this.currentPlayer.score = result.newScore;

    if (result.finished) {
      this.currentPlayer.lastDarts = dartsBeforeSubmit;
      this.currentPlayer.legsWon++;

      const legsNeeded = Math.ceil(this.legs / 2);
      if (this.currentPlayer.legsWon >= legsNeeded) {
        this.matchWinner = this.currentPlayer.name;
        this.gameStarted = false;
      } else {
        this.players.forEach(p => p.score = this.startPoints);
        this.currentPlayerIndex = 0;
        this.game.resetToFirstDart();
      }
    } else if (this.game.getCurrentDartInRound() === 1) {
      // Turn finished (returned to dart 1); use pre-submit values
      this.currentPlayer.lastDarts = dartsBeforeSubmit;
      this.nextPlayer();
    }
  }

  onUndoDart(dart: DartThrow) {
    this.currentPlayer.score += dart.score;
  }

  newGame() {
    this.matchWinner = '';
    this.gameStarted = false;
  }

  private showError(msg: string) {
    this.errorMsg = msg;
    setTimeout(() => { this.errorMsg = ''; }, 2500);
  }
}
