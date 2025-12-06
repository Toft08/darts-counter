import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class GameService {

  // ----- DART TRACKING (shared across all games) -----
  inputMode: 'dart-by-dart' | 'per-turn' = 'dart-by-dart'; // How user enters scores
  dart1: number = 0;
  dart2: number = 0;
  dart3: number = 0;
  totalThrows: number = 0; // Total number of throws (keeps incrementing)
  roundScore: number = 0; // Total score for current round
  throwHistory: number[] = []; // Track all throws for undo functionality

  getCurrentDartInRound(): number {
    // Returns 1, 2, or 3 based on total throws
    return (this.totalThrows % 3) + 1;
  }

  setInputMode(mode: 'dart-by-dart' | 'per-turn') {
    this.inputMode = mode;
    this.resetRound();
  }

  resetRound() {
    this.dart1 = 0;
    this.dart2 = 0;
    this.dart3 = 0;
    this.roundScore = 0;
    // Don't reset totalThrows or throwHistory - they keep incrementing
  }

  submitDart(dartScore: number, currentScore: number): { valid: boolean; bust: boolean; finished: boolean; newScore: number } {
    // Validate dart score
    if (dartScore < 0 || dartScore > 180) {
      return { valid: false, bust: false, finished: false, newScore: currentScore };
    }

    // Check for bust
    if (dartScore > currentScore) {
      this.resetRound();
      return { valid: true, bust: true, finished: false, newScore: currentScore };
    }

    // Store dart and update score
    const newScore = currentScore - dartScore;
    const dartInRound = this.getCurrentDartInRound();
    
    if (dartInRound === 1) {
      this.dart1 = dartScore;
    } else if (dartInRound === 2) {
      this.dart2 = dartScore;
    } else if (dartInRound === 3) {
      this.dart3 = dartScore;
    }
    
    this.throwHistory.push(dartScore);
    this.totalThrows++;
    this.roundScore += dartScore;

    // Check if finished (score = 0)
    if (newScore === 0) {
      this.resetRound();
      return { valid: true, bust: false, finished: true, newScore: 0 };
    }

    // Move to next dart or reset round
    if (this.getCurrentDartInRound() === 1) {
      // Just completed dart 3, reset for next round
      this.resetRound();
    }

    return { valid: true, bust: false, finished: false, newScore: newScore };
  }

  submitTurn(turnScore: number, currentScore: number): { valid: boolean; bust: boolean; finished: boolean; newScore: number } {
    // Validate turn score (max 180 for 3 darts)
    if (turnScore < 0 || turnScore > 180) {
      return { valid: false, bust: false, finished: false, newScore: currentScore };
    }

    // Check for bust
    if (turnScore > currentScore) {
      this.resetRound();
      return { valid: true, bust: true, finished: false, newScore: currentScore };
    }

    // Update score
    const newScore = currentScore - turnScore;
    this.roundScore = turnScore;

    // Check if finished (score = 0)
    if (newScore === 0) {
      this.resetRound();
      return { valid: true, bust: false, finished: true, newScore: 0 };
    }

    this.resetRound();
    return { valid: true, bust: false, finished: false, newScore: newScore };
  }

  getRoundTotal(): number {
    return this.dart1 + this.dart2 + this.dart3;
  }

  undoLastThrow(): number | null {
    if (this.throwHistory.length === 0) {
      return null;
    }
    
    const lastThrow = this.throwHistory.pop()!;
    this.totalThrows--;
    
    // Update dart values for display
    const dartInRound = this.getCurrentDartInRound();
    if (dartInRound === 1) {
      this.dart1 = 0;
    } else if (dartInRound === 2) {
      this.dart2 = 0;
    } else if (dartInRound === 3) {
      this.dart3 = 0;
    }
    
    this.roundScore -= lastThrow;
    return lastThrow;
  }

  // ----- X01 GAME -----
  startScore: number = 501;
  currentScore: number = 501;
  legs: number = 1;

  initX01(startScore: number, legs: number) {
    this.startScore = startScore;
    this.currentScore = startScore;
    this.legs = legs;
    this.resetRound();
  }

  // ----- CHECKOUT TRAINER -----
  checkoutStart: number = 40;
  checkoutCurrent: number = 40;
  throws: number = 0;

  initCheckout(start: number) {
    this.checkoutStart = start;
    this.checkoutCurrent = start;
    this.throws = 0;
  }

  throw(score: number) {
    this.throws++;

    if (score <= this.checkoutCurrent) {
      this.checkoutCurrent -= score;
    }

    // success!
    if (this.checkoutCurrent === 0) {
      this.checkoutStart++;
      this.initCheckout(this.checkoutStart);
      return "success";
    }

    // fail
    if (this.throws >= 9) {
      this.initCheckout(this.checkoutStart);
      return "reset";
    }

    return "continue";
  }
}
