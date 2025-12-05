import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GameService } from '../../services/game';

@Component({
    selector: 'app-darts-input',
    templateUrl: './darts-input.html',
    standalone: true,
    imports: [CommonModule, FormsModule]
})
export class DartsInputComponent {
    @Input() currentScore: number = 0;
    @Output() onDartSubmit = new EventEmitter<number>();

    // Dart by dart mode
    dartNumber: number = 0;
    dartMultiplier: number = 1;

  // Per turn mode
    turnScore: number = 0;

    constructor(public game: GameService) {}

    submitDartByNumber() {
        const dartScore = this.dartNumber * this.dartMultiplier;
        this.onDartSubmit.emit(dartScore);
    
        // Reset for next dart
        this.dartNumber = 0;
        this.dartMultiplier = 1;
    }

    submitTurn() {
        this.onDartSubmit.emit(this.turnScore);
        this.turnScore = 0;
    }
}
