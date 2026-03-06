import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GameService } from '../../services/game';
import { DartboardConfig, STANDARD_CONFIG } from '../../models/dartboard-config.model';
import { DartThrow, makeDartThrow } from '../../models/dart-throw.model';

@Component({
  selector: 'app-dart-by-dart-input',
  templateUrl: './dart-by-dart-input.html',
  styleUrls: ['./dart-by-dart-input.scss'],
  standalone: true,
  imports: [CommonModule],
})
export class DartByDartInputComponent implements OnChanges {
  /** Controls which segments and multipliers are active for the current game mode. */
  @Input() config: DartboardConfig = STANDARD_CONFIG;
  /** When set to 2 or 3, that multiplier is pre-selected and cannot be toggled off. */
  @Input() initialMultiplier: 1 | 2 | 3 = 1;

  /** Emits whenever a dart is registered (miss counts too). */
  @Output() dartThrown = new EventEmitter<DartThrow>();
  /** Emits the undone throw so the game page can add its score back. */
  @Output() undoDart = new EventEmitter<DartThrow>();

  selectedMultiplier: 1 | 2 | 3 = 1;
  readonly numbers = [20, 19, 18, 17, 16, 15, 14, 13, 12, 11, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1];

  constructor(public game: GameService) {}

  ngOnChanges(changes: SimpleChanges) {
    if (changes['initialMultiplier'] || changes['config']) {
      this.selectedMultiplier = this.initialMultiplier;
    }
  }

  isSegmentAllowed(n: number): boolean {
    if (this.config.allowedSegments === 'all') return true;
    return (this.config.allowedSegments as number[]).includes(n);
  }

  selectMultiplier(mult: 1 | 2 | 3) {
    // Cannot toggle off a locked initial multiplier
    if (this.selectedMultiplier === mult && mult === this.initialMultiplier) return;
    this.selectedMultiplier = this.selectedMultiplier === mult ? this.initialMultiplier : mult;
  }

  selectNumber(segment: number) {
    let dart: DartThrow;

    if (segment === 0) {
      // Miss
      dart = makeDartThrow(0, 1);
    } else if (segment === 25) {
      if (!this.config.allowBull) return;
      if (this.selectedMultiplier === 3) return; // No triple bull in standard darts
      const mult: 1 | 2 = this.selectedMultiplier === 2 ? 2 : 1;
      if (mult === 2 && !this.config.allowDoubleBull) return;
      dart = makeDartThrow(25, mult);
    } else {
      if (!this.isSegmentAllowed(segment)) return;
      const mult = this.selectedMultiplier;
      if (mult === 2 && !this.config.allowDouble) return;
      if (mult === 3 && !this.config.allowTriple) return;
      dart = makeDartThrow(segment, mult);
    }

    this.dartThrown.emit(dart);
    this.selectedMultiplier = this.initialMultiplier;
  }

  undoLastDart() {
    const undone = this.game.undoLastThrow();
    if (!undone) return;
    this.undoDart.emit(undone);
  }
}
