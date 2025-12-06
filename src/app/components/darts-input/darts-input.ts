import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GameService } from '../../services/game';

@Component({
    selector: 'app-darts-input',
    templateUrl: './darts-input.html',
    styleUrls: ['./darts-input.scss'],
    standalone: true,
    imports: [CommonModule, FormsModule]
})
export class DartsInputComponent {
    @Input() currentScore: number = 0;
    @Output() onDartSubmit = new EventEmitter<number>();

    // Dart by dart mode - button layout
    selectedMultiplier: number = 1; // 1=single, 2=double, 3=triple, 25=bull, 50=double bull
    bullMode: 'single' | 'double' = 'single'; // Track which bull mode
    dart1Value: number | null = null;
    dart2Value: number | null = null;
    dart3Value: number | null = null;

    // Per visit mode
    visitScore: string = '';
    showUndoConfirm: boolean = false;

    numbers = [20, 19, 18, 17, 16, 15, 14, 13, 12, 11, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1];

    constructor(public game: GameService) {}

    selectMultiplier(mult: number) {
        // Toggle off if clicking the same multiplier
        if (this.selectedMultiplier === mult) {
            this.selectedMultiplier = 1;
        } else {
            this.selectedMultiplier = mult;
        }
    }

    toggleBull() {
        if (this.bullMode === 'single') {
            this.bullMode = 'double';
            this.selectedMultiplier = 50;
        } else {
            this.bullMode = 'single';
            this.selectedMultiplier = 25;
        }
    }

    undoLastDart() {
        const undoneValue = this.game.undoLastThrow();
        
        if (undoneValue === null) {
            return;
        }
        
        // Clear the display for the undone dart
        const dartInRound = this.game.getCurrentDartInRound();
        if (dartInRound === 1) {
            this.dart1Value = null;
        } else if (dartInRound === 2) {
            this.dart2Value = null;
        } else if (dartInRound === 3) {
            this.dart3Value = null;
        }
        
        // Emit negative value to signal undo (add back to score)
        this.onDartSubmit.emit(-undoneValue);
    }

    selectNumber(num: number) {
        let dartScore = 0;
        
        if (num === 0) {
            // Miss
            dartScore = 0;
        } else if (this.selectedMultiplier === 25) {
            // Bull - 25 for single, 50 for double
            dartScore = 25;
        } else if (this.selectedMultiplier === 50) {
            // Double bull
            dartScore = 50;
        } else {
            // Regular scoring
            dartScore = num * this.selectedMultiplier;
        }

        // Store dart value for display
        const dartInRound = this.game.getCurrentDartInRound();
        if (dartInRound === 1) {
            this.dart1Value = dartScore;
        } else if (dartInRound === 2) {
            this.dart2Value = dartScore;
        } else if (dartInRound === 3) {
            this.dart3Value = dartScore;
        }

        // Emit the score
        this.onDartSubmit.emit(dartScore);

        // Reset multiplier to single for next dart
        this.selectedMultiplier = 1;
        this.bullMode = 'single';

        // Reset display when starting new round
        if (this.game.getCurrentDartInRound() === 1) {
            this.dart1Value = null;
            this.dart2Value = null;
            this.dart3Value = null;
        }
    }

    getDartDisplay(dartNum: number): string {
        const value = dartNum === 1 ? this.dart1Value : dartNum === 2 ? this.dart2Value : this.dart3Value;
        if (value === null) return '-';
        return value.toString();
    }

    // Per Visit Mode
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
            // If there's input, clear it
            this.clearVisitScore();
        } else if (this.showUndoConfirm) {
            // If confirmation is showing and clicked again, perform undo
            this.undoLastVisit();
            this.showUndoConfirm = false;
        } else {
            // Show confirmation
            this.showUndoConfirm = true;
        }
    }

    undoLastVisit() {
        // Undo last 3 darts in per-visit mode and sum their values
        let totalUndone = 0;
        for (let i = 0; i < 3; i++) {
            const undoneValue = this.game.undoLastThrow();
            if (undoneValue === null) break;
            totalUndone += undoneValue;
        }
        // Emit negative total to add back to score
        // Use a flag to indicate this is per-visit undo (for dart count)
        this.onDartSubmit.emit(-totalUndone - 0.001); // Add tiny offset to distinguish from dart-by-dart
    }

    submitVisit() {
        const score = parseInt(this.visitScore) || 0;
        if (score > 180) {
            alert('Maximum score per visit is 180');
            return;
        }
        this.onDartSubmit.emit(score);
        this.visitScore = '';
    }
}
