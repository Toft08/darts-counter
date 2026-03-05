import { Component, Input, Output, EventEmitter, OnChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HalfTarget } from '../half';

@Component({
  selector: 'app-half-input',
  templateUrl: './half-input.html',
  styleUrls: ['./half-input.scss'],
  standalone: true,
  imports: [CommonModule],
})
export class HalfInputComponent implements OnChanges {
  @Input() target!: HalfTarget;
  @Input() dartsThrown: number = 0; // 0, 1, or 2 – which dart we're on
  @Output() dartScored = new EventEmitter<number>();

  // For the 41-exact standard grid
  selectedMultiplier: number = 1;
  numbers = [20, 19, 18, 17, 16, 15, 14, 13, 12, 11, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1];

  ngOnChanges() {
    // Reset multiplier whenever target or dart changes
    this.selectedMultiplier = 1;
  }

  // ── Number target (19, 18, 17, 20) ───────────────
  get numberValue(): number {
    return (this.target as { kind: 'number'; value: number }).value;
  }

  hitNumber(multiplier: number) {
    const value = this.numberValue * multiplier;
    this.emit(value);
  }

  // ── Double / Triple target ────────────────────────
  hitMultiple(num: number, kind: 'double' | 'triple') {
    const mult = kind === 'double' ? 2 : 3;
    this.emit(num * mult);
  }

  // ── 41 exact – standard grid ─────────────────────
  toggleMultiplier(mult: number) {
    this.selectedMultiplier = this.selectedMultiplier === mult ? 1 : mult;
  }

  hitStandard(num: number) {
    if (num === 25) {
      // Bull in standard grid: S=25, D=50, no triple
      if (this.selectedMultiplier === 3) return;
      this.emit(this.selectedMultiplier === 2 ? 50 : 25);
    } else {
      this.emit(num * this.selectedMultiplier);
    }
    this.selectedMultiplier = 1;
  }

  // ── Bull target ───────────────────────────────────
  hitBull(value: number) {
    this.emit(value); // 0, 25, or 50
  }

  // ── Shared ────────────────────────────────────────
  miss() {
    this.emit(0);
  }

  private emit(score: number) {
    this.dartScored.emit(score);
  }
}
