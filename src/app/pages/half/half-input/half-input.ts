import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HalfTarget } from '../half';
import { DartByDartInputComponent } from '../../../components/dart-by-dart-input/dart-by-dart-input';
import { DartboardConfig, STANDARD_CONFIG } from '../../../models/dartboard-config.model';
import { DartThrow } from '../../../models/dart-throw.model';

@Component({
  selector: 'app-half-input',
  templateUrl: './half-input.html',
  styleUrls: ['./half-input.scss'],
  standalone: true,
  imports: [CommonModule, DartByDartInputComponent],
})
export class HalfInputComponent {
  @Input() target!: HalfTarget;
  @Input() dartsThrown: number = 0;
  @Output() dartScored = new EventEmitter<number>();

  readonly standardConfig: DartboardConfig = STANDARD_CONFIG;

  readonly doubleConfig: DartboardConfig = {
    allowedSegments: 'all',
    allowDouble: true,
    allowTriple: false,
    allowBull: true,
    allowDoubleBull: true,
  };

  readonly tripleConfig: DartboardConfig = {
    allowedSegments: 'all',
    allowDouble: false,
    allowTriple: true,
    allowBull: false,
    allowDoubleBull: false,
  };

  // ── Number target (19, 18, 17, 20) ───────────────
  get numberValue(): number {
    return (this.target as { kind: 'number'; value: number }).value;
  }

  hitNumber(multiplier: number) {
    this.emit(this.numberValue * multiplier);
  }

  // ── Double / Triple / 41 exact – forwarded from dart-by-dart grid ────
  onGridDart(dart: DartThrow) {
    this.emit(dart.score);
  }

  // ── Bull target ───────────────────────────────────
  hitBull(value: number) {
    this.emit(value);
  }

  // ── Shared ────────────────────────────────────────
  miss() {
    this.emit(0);
  }

  private emit(score: number) {
    this.dartScored.emit(score);
  }
}
