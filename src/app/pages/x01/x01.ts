
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GameService } from '../../services/game';
import { DartsInputComponent } from '../../components/darts-input/darts-input';

interface Player {
  name: string;
  score: number;
  legsWon: number;
}

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
  players: Player[] = [];
  newPlayerName: string = '';
  currentPlayerIndex: number = 0;

  constructor(public game: GameService) {
    this.addPlayer('Player 1');
  }

  get currentPlayer(): Player {
    return this.players[this.currentPlayerIndex];
  }

  addPlayer(name?: string) {
    const playerName = name || this.newPlayerName.trim() || `Player ${this.players.length + 1}`;
    this.players.push({
      name: playerName,
      score: this.startPoints,
      legsWon: 0
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
      alert('Add at least one player to start!');
      return;
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
    this.currentPlayerIndex = (this.currentPlayerIndex + 1) % this.players.length;
    this.game.resetRound();
  }

  onDartSubmit(dartScore: number) {
    const result = this.game.inputMode === 'dart-by-dart' 
      ? this.game.submitDart(dartScore, this.currentPlayer.score)
      : this.game.submitTurn(dartScore, this.currentPlayer.score);

    if (!result.valid) {
      alert('Invalid score! Must be between 0-180');
      return;
    }

    if (result.bust) {
      alert(`${this.currentPlayer.name} bust! Next player...`);
      this.nextPlayer();
      return;
    }

    this.currentPlayer.score = result.newScore;

    if (result.finished) {
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
    } else if (this.game.currentDart === 1) {
      // Turn finished (returned to dart 1), switch to next player
      this.nextPlayer();
    }
  }
}
