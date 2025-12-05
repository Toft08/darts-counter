import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class GameService {

  // ----- X01 GAME -----
  startScore: number = 501;
  currentScore: number = 501;
  legs: number = 1;

  initX01(startScore: number, legs: number) {
    this.startScore = startScore;
    this.currentScore = startScore;
    this.legs = legs;
  }

  subtract(score: number) {
    if (score <= this.currentScore) {
      this.currentScore -= score;
    }

    if (this.currentScore === 0) {
      return true; // win
    }
    return false;
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
