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
  currentDart: number = 1; // Which dart in the round (1, 2, or 3)
  roundScore: number = 0; // Total score for current round

  setInputMode(mode: 'dart-by-dart' | 'per-turn') {
    this.inputMode = mode;
    this.resetRound();
  }

  resetRound() {
    this.dart1 = 0;
    this.dart2 = 0;
    this.dart3 = 0;
    this.currentDart = 1;
    this.roundScore = 0;
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
    
    if (this.currentDart === 1) {
      this.dart1 = dartScore;
    } else if (this.currentDart === 2) {
      this.dart2 = dartScore;
    } else if (this.currentDart === 3) {
      this.dart3 = dartScore;
    }

    this.roundScore += dartScore;

    // Check if finished (score = 0)
    if (newScore === 0) {
      this.resetRound();
      return { valid: true, bust: false, finished: true, newScore: 0 };
    }

    // Move to next dart or reset round
    if (this.currentDart === 3) {
      this.resetRound();
    } else {
      this.currentDart++;
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
