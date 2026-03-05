import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HalfInputComponent } from './half-input/half-input';

export type HalfTarget =
  | { kind: 'number'; value: number }
  | { kind: 'double' }
  | { kind: 'triple' }
  | { kind: 'exact'; value: number }
  | { kind: 'bull' };

export const HALF_TARGETS: HalfTarget[] = [
  { kind: 'number', value: 19 },
  { kind: 'number', value: 18 },
  { kind: 'double' },
  { kind: 'number', value: 17 },
  { kind: 'triple' },
  { kind: 'exact', value: 41 },
  { kind: 'number', value: 20 },
  { kind: 'bull' },
];

export function targetLabel(t: HalfTarget): string {
  switch (t.kind) {
    case 'number': return `${t.value}`;
    case 'double': return 'Double';
    case 'triple': return 'Triple';
    case 'exact': return '41 exact';
    case 'bull': return 'Bull';
  }
}

interface HalfPlayer {
  name: string;
  totalScore: number;
  roundScore: number;        // accumulated score for current target
  scoredThisTarget: boolean; // hit at least one valid dart this target
  lastDarts: [number, number, number];
  dartsThrown: number;       // 0-3
  halved: boolean;
}

@Component({
  selector: 'app-half',
  templateUrl: './half.html',
  styleUrls: ['./half.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, HalfInputComponent],
})
export class HalfComponent {
  gameStarted = false;
  gameOver = false;
  players: HalfPlayer[] = [];
  currentPlayerIndex = 0;
  targetIndex = 0;

  // ── Team mode ────────────────────────────────────
  teamMode = false;
  teamScore = 0;
  teamInput: string = '';
  teamLastHalved = false;

  readonly targets = HALF_TARGETS;
  readonly targetLabel = targetLabel;

  get currentTarget(): HalfTarget { return this.targets[this.targetIndex]; }
  get currentPlayer(): HalfPlayer { return this.players[this.currentPlayerIndex]; }
  get isLastTarget(): boolean { return this.targetIndex === this.targets.length - 1; }

  // ── Individual player setup ───────────────────────
  addPlayer(name?: string) {
    this.players.push({
      name: name || `Player ${this.players.length + 1}`,
      totalScore: 0,
      roundScore: 0,
      scoredThisTarget: false,
      lastDarts: [0, 0, 0],
      dartsThrown: 0,
      halved: false,
    });
  }

  removePlayer(index: number) {
    this.players.splice(index, 1);
  }

  private resetPlayerRound(p: HalfPlayer) {
    p.roundScore = 0;
    p.scoredThisTarget = false;
    p.lastDarts = [0, 0, 0];
    p.dartsThrown = 0;
    p.halved = false;
  }

  startGame() {
    this.teamMode = false;
    if (this.players.length === 0) this.addPlayer('Player 1');
    this.players.forEach(p => { p.totalScore = 0; this.resetPlayerRound(p); });
    this.currentPlayerIndex = 0;
    this.targetIndex = 0;
    this.gameStarted = true;
    this.gameOver = false;
  }

  // ── Team mode setup & logic ───────────────────────
  teamAppend(n: string) {
    if (this.teamInput.length < 3) this.teamInput += n;
  }

  teamClear() {
    this.teamInput = '';
  }

  startTeamGame() {
    this.teamMode = true;
    this.teamScore = 0;
    this.teamInput = '';
    this.teamLastHalved = false;
    this.targetIndex = 0;
    this.gameStarted = true;
    this.gameOver = false;
  }

  get teamInputLabel(): string {
    const t = this.currentTarget;
    switch (t.kind) {
      case 'number': return `Hits on ${t.value}`;
      case 'exact':  return 'Players who scored exactly 41';
      case 'double': return 'Total score from doubles';
      case 'triple': return 'Total score from triples';
      case 'bull':   return 'Number of bull hits';
    }
  }

  get teamInputHint(): string {
    const t = this.currentTarget;
    switch (t.kind) {
      case 'number': return `Single = 1 hit, Double = 2 hits, Triple = 3 hits  (× ${(t as any).value} pts each)`;
      case 'exact':  return 'Each player who hit 41 exact scores 41 pts';
      case 'double': return 'Enter the total score (e.g. D20 + D17 = 40 + 34 = 74)';
      case 'triple': return 'Enter the total score (e.g. T19 + T5 = 57 + 15 = 72)';
      case 'bull':   return 'Each hit = 25 pts (single = 25, double bull = 50)';
    }
  }

  get teamInputValue(): number {
    return parseInt(this.teamInput) || 0;
  }

  get teamComputedScore(): number {
    const v = this.teamInputValue;
    if (v <= 0) return 0;
    const t = this.currentTarget;
    switch (t.kind) {
      case 'number': return v * t.value;
      case 'exact':  return v * 41;
      case 'double':
      case 'triple':  return v;
      case 'bull':    return v * 25;
    }
  }

  submitTeamRound() {
    const earned = this.teamComputedScore;
    this.teamLastHalved = earned === 0;
    if (earned === 0) {
      this.teamScore = Math.ceil(this.teamScore / 2);
    } else {
      this.teamScore += earned;
    }
    if (this.isLastTarget) {
      this.gameOver = true;
    } else {
      this.targetIndex++;
      this.teamInput = '';
    }
  }

  onDartScored(score: number) {
    const p = this.currentPlayer;
    p.lastDarts[p.dartsThrown] = score;
    p.dartsThrown++;
    if (score > 0) {
      p.roundScore += score;
      p.scoredThisTarget = true;
    }
    if (p.dartsThrown >= 3) this.finaliseTurn();
  }

  private finaliseTurn() {
    const p = this.currentPlayer;
    p.halved = false;

    if (this.currentTarget.kind === 'exact') {
      if (p.roundScore === 41) {
        p.totalScore += 41;
      } else {
        p.totalScore = Math.ceil(p.totalScore / 2);
        p.halved = true;
      }
    } else {
      if (p.scoredThisTarget) {
        p.totalScore += p.roundScore;
      } else {
        p.totalScore = Math.ceil(p.totalScore / 2);
        p.halved = true;
      }
    }

    this.advanceTurn();
  }

  private advanceTurn() {
    const nextIndex = (this.currentPlayerIndex + 1) % this.players.length;
    if (nextIndex !== 0) {
      this.currentPlayerIndex = nextIndex;
      this.resetPlayerRound(this.players[this.currentPlayerIndex]);
    } else {
      if (this.isLastTarget) {
        this.currentPlayerIndex = 0;
        this.endGame();
      } else {
        this.targetIndex++;
        this.currentPlayerIndex = 0;
        this.players.forEach(p => this.resetPlayerRound(p));
      }
    }
  }

  private endGame() {
    this.gameOver = true;
    const winner = [...this.players].sort((a, b) => b.totalScore - a.totalScore)[0];
    setTimeout(() => {
      alert(`🎯 Game over! ${winner.name} wins with ${winner.totalScore} points!`);
    }, 200);
  }

  get sortedPlayers(): HalfPlayer[] {
    return [...this.players].sort((a, b) => b.totalScore - a.totalScore);
  }

  restartGame() {
    this.gameStarted = false;
    this.gameOver = false;
    this.teamMode = false;
    this.teamScore = 0;
    this.teamInput = '';
    this.players = [];
  }
}
