
import { Component, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GameService } from '../../services/game';
import { DartsInputComponent } from '../../components/darts-input/darts-input';
import { PlayerCardComponent } from '../../components/player-card/player-card';

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
    if (this.players.length > 1) {
      this.players.splice(index, 1);
      if (this.currentPlayerIndex >= this.players.length) {
        this.currentPlayerIndex = 0;
      }
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

  onDartSubmit(dartScore: number) {
    // Handle undo (negative score means add back)
    if (dartScore < 0) {
      const scoreToAddBack = Math.floor(Math.abs(dartScore)); // Use floor to handle decimal offset
      this.currentPlayer.score += scoreToAddBack;
      return; // Important: don't continue processing
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

    if (result.bust) {
      // Store the darts that caused the bust (using pre-submit values if 3rd dart)
      this.currentPlayer.lastDarts = isThirdDart ? dartsBeforeSubmit : [this.game.dart1, this.game.dart2, this.game.dart3];
      this.nextPlayer();
      return;
    }

    this.currentPlayer.score = result.newScore;

    if (result.finished) {
      // Store the winning darts
      this.currentPlayer.lastDarts = isThirdDart ? dartsBeforeSubmit : [this.game.dart1, this.game.dart2, this.game.dart3];
      this.currentPlayer.legsWon++;
      
      // Check if this player won the match
      const legsNeeded = Math.ceil(this.legs / 2);
      if (this.currentPlayer.legsWon >= legsNeeded) {
        alert(`🎉 ${this.currentPlayer.name} wins the match!`);
        this.gameStarted = false;
      } else {
        alert(`${this.currentPlayer.name} wins the leg! Next leg starting...`);
        this.players.forEach(p => p.score = this.startPoints);
        this.currentPlayerIndex = 0;
      }
    } else if (this.game.getCurrentDartInRound() === 1) {
      // Turn finished (returned to dart 1), use the pre-submit values we captured
      this.currentPlayer.lastDarts = dartsBeforeSubmit;
      this.nextPlayer();
    }
  }
}
