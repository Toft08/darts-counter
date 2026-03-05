import { Component, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GameService } from '../../services/game';
import { DartboardConfig, STANDARD_CONFIG } from '../../models/dartboard-config.model';
import { DartThrow } from '../../models/dart-throw.model';
import { DartByDartInputComponent } from '../dart-by-dart-input/dart-by-dart-input';
import { PerTurnInputComponent } from '../per-turn-input/per-turn-input';

@Component({
    selector: 'app-darts-input',
    templateUrl: './darts-input.html',
    styleUrls: ['./darts-input.scss'],
    standalone: true,
    imports: [CommonModule, DartByDartInputComponent, PerTurnInputComponent]
})
export class DartsInputComponent {
    /** Controls which segments/multipliers are active; defaults to the full dartboard. */
    @Input() config: DartboardConfig = STANDARD_CONFIG;

    /** Emits a DartThrow whenever a dart is registered or a per-turn visit is submitted. */
    @Output() dartThrown = new EventEmitter<DartThrow>();
    /** Emits the last throw that was undone so the game page can restore the score. */
    @Output() undoDart = new EventEmitter<DartThrow>();

    @ViewChild(PerTurnInputComponent) private perTurnInput?: PerTurnInputComponent;

    constructor(public game: GameService) {}

    /** Exposed for player-card compatibility (shows live per-turn entry). */
    get visitScore(): string {
        return this.perTurnInput?.visitScore ?? '';
    }
}
