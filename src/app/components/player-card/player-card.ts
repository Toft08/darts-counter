import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GameService } from '../../services/game';
import { DartsInputComponent } from '../darts-input/darts-input';

@Component({
    selector: 'app-player-card',
    templateUrl: './player-card.html',
    styleUrls: ['./player-card.scss'],
    standalone: true,
    imports: [CommonModule, FormsModule]
})
export class PlayerCardComponent {
    @Input() playerName: string = '';
    @Input() score: number = 0;
    @Input() isActive: boolean = false;
    @Input() lastDarts: [number, number, number] = [0, 0, 0];
    @Input() legsWon?: number;
    @Input() target?: number;
    @Input() dartsThrown?: number;
    @Input() checkouts?: number;
    @Input() failed?: boolean = false;
    @Input() dartsInputRef?: DartsInputComponent;

    constructor(public game: GameService) {}

    getDartDisplay(dartNum: number): string {
        if (this.isActive) {
            // Show live darts for active player
            const value = dartNum === 1 ? this.game.dart1 : 
                          dartNum === 2 ? this.game.dart2 : 
                          this.game.dart3;
            return value === 0 ? '-' : value.toString();
        } else {
            // Show last darts for inactive players
            const value = this.lastDarts?.[dartNum - 1] ?? 0;
            return value === 0 ? '-' : value.toString();
        }
    }
    
    getVisitScore(): string {
        if (!this.isActive || !this.dartsInputRef) return '-';
        return this.dartsInputRef.visitScore || '-';
    }
}
