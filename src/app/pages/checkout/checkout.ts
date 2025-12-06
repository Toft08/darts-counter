
import { Component, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GameService } from '../../services/game';
import { DartsInputComponent } from '../../components/darts-input/darts-input';
import { PlayerCardComponent } from '../../components/player-card/player-card';

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
  standalone: true,
  imports: [CommonModule, FormsModule, DartsInputComponent, PlayerCardComponent]
})
export class CheckoutComponent {
  @ViewChild(DartsInputComponent) dartsInput!: DartsInputComponent;
  
  startNumber: number = 81;
  trainingStarted: boolean = false;
  status: string = '';
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
    if (this.players.length > 1) {
      this.players.splice(index, 1);
      if (this.currentPlayerIndex >= this.players.length) {
        this.currentPlayerIndex = 0;
      }
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
    this.game.resetRound();
  }

  nextPlayer() {
    // Move to next player
    this.currentPlayerIndex = (this.currentPlayerIndex + 1) % this.players.length;
    
    // Clear the dart displays for the new player
    this.game.resetRound();
  }

  onDartSubmit(dartScore: number) {
    // Handle undo (negative score means add back)
    if (dartScore < 0) {
      const isPerVisitUndo = dartScore % 1 !== 0; // Has decimal = per-visit
      const scoreToAddBack = Math.floor(Math.abs(dartScore)); // Use floor to handle decimal offset
      this.currentPlayer.score += scoreToAddBack;
      // For per-visit undo, subtract 3 darts; for dart-by-dart, subtract 1
      const dartsToSubtract = isPerVisitUndo ? 3 : 1;
      this.currentPlayer.dartsThrown = Math.max(0, this.currentPlayer.dartsThrown - dartsToSubtract);
      return;
    }
    
    // CRITICAL: Store darts BEFORE submitting if this is the 3rd dart
    // because submitDart() will reset them
    const isThirdDart = this.game.inputMode === 'dart-by-dart' && this.game.getCurrentDartInRound() === 3;
    let dartsBeforeSubmit: [number, number, number] = [0, 0, 0];
    if (isThirdDart) {
      dartsBeforeSubmit = [this.game.dart1, this.game.dart2, dartScore];
    }
    
    const result = this.game.inputMode === 'dart-by-dart'
      ? this.game.submitDart(dartScore, this.currentPlayer.score)
      : this.game.submitTurn(dartScore, this.currentPlayer.score);

    if (!result.valid) {
      alert('Invalid score! Must be between 0-180');
      return;
    }

    // Track darts thrown
    if (this.game.inputMode === 'dart-by-dart') {
      this.currentPlayer.dartsThrown++;
    } else {
      this.currentPlayer.dartsThrown += 3;
    }

    if (result.bust) {
      // Store the darts that caused the bust (using pre-submit values if 3rd dart)
      this.currentPlayer.lastDarts = isThirdDart ? dartsBeforeSubmit : [this.game.dart1, this.game.dart2, this.game.dart3];
      this.currentPlayer.score = this.currentPlayer.target;
      this.currentPlayer.failed = true;
      this.checkRoundEnd();
      return;
    }

    this.currentPlayer.score = result.newScore;

    if (result.finished) {
      // Store the winning darts
      this.currentPlayer.lastDarts = isThirdDart ? dartsBeforeSubmit : [this.game.dart1, this.game.dart2, this.game.dart3];
      this.currentPlayer.checkouts++;
      this.currentPlayer.target++;
      this.status = 'success';
      setTimeout(() => {
        alert(`✅ ${this.currentPlayer.name} checked out! Next target: ${this.currentPlayer.target}`);
        this.status = '';
        this.startNewRound();
      }, 100);
    } else if (this.game.getCurrentDartInRound() === 1 && this.game.inputMode === 'dart-by-dart') {
      // Turn finished (3 darts thrown), use the pre-submit values we captured
      this.currentPlayer.lastDarts = dartsBeforeSubmit;
      
      if (this.currentPlayer.dartsThrown >= 9) {
        // Player has thrown 9 darts without finishing
        this.currentPlayer.failed = true;
        this.checkRoundEnd();
      } else {
        // Player still has darts left, next player's turn
        this.nextPlayer();
      }
    }
  }

  checkRoundEnd() {
    // Check if all players have either finished their 9 darts or failed
    const allPlayersFinished = this.players.every(p => p.dartsThrown >= 9 || p.failed);
    
    if (allPlayersFinished) {
      // Round is over, reset for new round
      this.roundActive = false;
      setTimeout(() => {
        alert('Round over! No one checked out. Starting new round...');
        this.startNewRound();
      }, 500);
    } else {
      // Move to next player
      this.nextPlayer();
    }
  }
}
