import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HalfTarget, targetLabel } from '../half';

@Component({
  selector: 'app-half-team-input',
  templateUrl: './half-team-input.html',
  styleUrls: ['./half-team-input.scss'],
  standalone: true,
  imports: [CommonModule],
})
export class HalfTeamInputComponent {
  @Input() target!: HalfTarget;
  @Input() teamScore = 0;
  @Input() isLastTarget = false;

  /** Emits the earned points for this round (0 = no hit → caller halves the score). */
  @Output() roundSubmitted = new EventEmitter<number>();

  readonly targetLabel = targetLabel;

  teamInput = '';

  append(n: string) {
    if (this.teamInput.length < 3) this.teamInput += n;
  }

  clear() {
    this.teamInput = '';
  }

  submit() {
    this.roundSubmitted.emit(this.computedScore);
    this.teamInput = '';
  }

  get inputValue(): number {
    return parseInt(this.teamInput) || 0;
  }

  get computedScore(): number {
    const v = this.inputValue;
    if (v <= 0) return 0;
    const t = this.target;
    switch (t.kind) {
      case 'number': return v * t.value;
      case 'exact':  return v * 41;
      case 'double':
      case 'triple': return v;
      case 'bull':   return v * 25;
    }
  }

  get inputLabel(): string {
    const t = this.target;
    switch (t.kind) {
      case 'number': return `Hits on ${t.value}`;
      case 'exact':  return 'Players who scored exactly 41';
      case 'double': return 'Total score from doubles';
      case 'triple': return 'Total score from triples';
      case 'bull':   return 'Number of bull hits';
    }
  }

  get inputHint(): string {
    const t = this.target;
    switch (t.kind) {
      case 'number': return `Single = 1 hit, Double = 2 hits, Triple = 3 hits  (× ${(t as any).value} pts each)`;
      case 'exact':  return 'Each player who hit 41 exact scores 41 pts';
      case 'double': return 'Enter the total score (e.g. D20 + D17 = 40 + 34 = 74)';
      case 'triple': return 'Enter the total score (e.g. T19 + T5 = 57 + 15 = 72)';
      case 'bull':   return 'Each hit = 25 pts (single = 25, double bull = 50)';
    }
  }
}
