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
  target: number;
  checkouts: number;
  dartsThrown: number;
  failed: boolean;
  lastDarts: [number, number, number];
}

@Component({
  selector: 'app-checkout',
  templateUrl: './checkout.html',
  styleUrls: ['./checkout.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, DartsInputComponent, PlayerCardComponent]
})
export class CheckoutComponent {
  @ViewChild(DartsInputComponent) dartsInput!: DartsInputComponent;
  
  startNumber: number = 81;
  trainingStarted: boolean = false;
  status: string = '';
  errorMsg: string = '';
  showManualInput: boolean = false;
  players: Player[] = [];
  newPlayerName: string = '';
  currentPlayerIndex: number = 0;
  roundActive: boolean = false;

  constructor(public game: GameService) {}

  get currentPlayer(): Player {
    return this.players[this.currentPlayerIndex];
  }

  addPlayer(name?: string) {
    const playerName = name || this.newPlayerName.trim() || `Player ${this.players.length + 1}`;
    this.players.push({
      name: playerName,
      score: this.startNumber,
      target: this.startNumber,
      checkouts: 0,
      dartsThrown: 0,
      failed: false,
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

  startTraining() {
    if (this.players.length === 0) {
      this.addPlayer('Thrower');
    }
    this.game.initCheckout(this.startNumber);
    this.players.forEach(p => {
      p.score = this.startNumber;
      p.target = this.startNumber;
      p.checkouts = 0;
      p.dartsThrown = 0;
      p.failed = false;
    });
    this.currentPlayerIndex = 0;
    this.trainingStarted = true;
    this.roundActive = true;
    this.status = '';
  }

  startNewRound() {
    this.players.forEach(p => {
      p.score = p.target;
      p.dartsThrown = 0;
      p.failed = false;
    });
    this.currentPlayerIndex = 0;
    this.roundActive = true;
    this.game.resetToFirstDart(); // Use resetToFirstDart to align to dart 1
  }

  nextPlayer() {
    // Move to next player
    this.currentPlayerIndex = (this.currentPlayerIndex + 1) % this.players.length;
    
    // Clear the dart displays for the new player
    this.game.resetRound();
  }

  onDartThrown(dart: DartThrow) {
    const isPerTurn = isSyntheticThrow(dart);

    // Capture dart values before submit when this is the 3rd dart,
    // because submitDart() resets game.dart1/2/3 after the round.
    const isThirdDart = !isPerTurn && this.game.getCurrentDartInRound() === 3;
    let dartsBeforeSubmit: [number, number, number] = [0, 0, 0];
    if (isThirdDart) {
      dartsBeforeSubmit = [this.game.dart1, this.game.dart2, dart.score];
    }

    const result = isPerTurn
      ? this.game.submitTurn(dart.score, this.currentPlayer.score)
      : this.game.submitDart(dart, this.currentPlayer.score);

    if (!result.valid) {
      this.showError('Invalid score! Must be between 0–180');
      return;
    }

    // Track darts thrown
    this.currentPlayer.dartsThrown += isPerTurn ? 3 : 1;

    if (result.bust) {
      this.currentPlayer.lastDarts = isThirdDart ? dartsBeforeSubmit : [this.game.dart1, this.game.dart2, this.game.dart3];
      this.currentPlayer.score = this.currentPlayer.target;

      if (this.game.getCurrentDartInRound() === 1 || isPerTurn) {
        if (this.currentPlayer.dartsThrown >= 9) {
          this.currentPlayer.failed = true;
          this.checkRoundEnd();
        } else {
          this.nextPlayer();
        }
      }
      return;
    }

    this.currentPlayer.score = result.newScore;

    if (result.finished) {
      this.currentPlayer.lastDarts = isThirdDart ? dartsBeforeSubmit : [this.game.dart1, this.game.dart2, this.game.dart3];
      this.currentPlayer.checkouts++;
      this.currentPlayer.target++;
      const winnerName = this.currentPlayer.name;
      const newTarget = this.currentPlayer.target;
      this.status = 'success';

      this.startNewRound();
      setTimeout(() => { this.status = ''; }, 1200);
      return;
    } else if (this.game.getCurrentDartInRound() === 1 && !isPerTurn) {
      this.currentPlayer.lastDarts = dartsBeforeSubmit;

      if (this.currentPlayer.dartsThrown >= 9) {
        this.currentPlayer.failed = true;
        this.checkRoundEnd();
      } else {
        this.nextPlayer();
      }
    }
  }

  onUndoDart(dart: DartThrow) {
    this.currentPlayer.score += dart.score;
    // Synthetic = per-turn visit (counts as 3 darts); regular dart = 1
    const dartsToSubtract = isSyntheticThrow(dart) ? 3 : 1;
    this.currentPlayer.dartsThrown = Math.max(0, this.currentPlayer.dartsThrown - dartsToSubtract);
  }
  checkRoundEnd() {
    // Check if all players have either finished their 9 darts or failed
    const allPlayersFinished = this.players.every(p => p.dartsThrown >= 9 || p.failed);
    
    if (allPlayersFinished) {
      // Round is over, reset for new round
      this.roundActive = false;
      this.startNewRound();
    } else {
      // Move to next player
      this.nextPlayer();
    }
  }

  private showError(msg: string) {
    this.errorMsg = msg;
    setTimeout(() => { this.errorMsg = ''; }, 2500);
  }
}
