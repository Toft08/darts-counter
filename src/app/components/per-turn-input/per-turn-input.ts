import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GameService } from '../../services/game';
import { DartThrow, makeSyntheticThrow } from '../../models/dart-throw.model';

@Component({
  selector: 'app-per-turn-input',
  templateUrl: './per-turn-input.html',
  styleUrls: ['./per-turn-input.scss'],
  standalone: true,
  imports: [CommonModule],
})
export class PerTurnInputComponent {
  /**
   * Emits a synthetic DartThrow (segment = -1) representing the full 3-dart visit score.
   * The receiving game page calls game.submitTurn() and handles scoring.
   */
  @Output() dartThrown = new EventEmitter<DartThrow>();
  /** Emits the undone synthetic throw so the game page can add its score back. */
  @Output() undoDart = new EventEmitter<DartThrow>();

  visitScore: string = '';
  showUndoConfirm: boolean = false;

  constructor(public game: GameService) {}

  appendNumber(num: string) {
    if (this.visitScore.length < 3) {
      this.visitScore += num;
    }
  }

  clearVisitScore() {
    this.visitScore = '';
    this.showUndoConfirm = false;
  }

  clearOrUndo() {
    if (this.visitScore) {
      this.clearVisitScore();
    } else if (this.showUndoConfirm) {
      this.undoLastVisit();
      this.showUndoConfirm = false;
    } else {
      this.showUndoConfirm = true;
    }
  }

  private undoLastVisit() {
    // Per-turn stores one synthetic entry per visit in throwHistory
    const undone = this.game.undoLastThrow();
    if (!undone) return;
    this.undoDart.emit(undone);
  }

  submitVisit() {
    const score = parseInt(this.visitScore) || 0;
    if (score > 180) {
      alert('Maximum score per visit is 180');
      return;
    }
    this.dartThrown.emit(makeSyntheticThrow(score));
    this.visitScore = '';
  }
}
