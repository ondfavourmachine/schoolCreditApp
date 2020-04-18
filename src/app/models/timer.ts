export class Timer {
  time: number;
  element: HTMLElement;
  interval: any;
  constructor(time, element) {
    this.time = time;
    this.element = element;
    this.displayTimeLeft(this.time);
    this.startCounter();
  }

  startCounter() {
    this.clearTimer();
    const now = Date.now();
    const then = now + this.time * 1000;
    this.interval = setInterval(() => {
      const secondsLeft = Math.round((then - Date.now()) / 1000);
      // check if we should stop
      if (secondsLeft < 1) {
        clearInterval(this.interval);
        this.dispatchEvent();
      }
      this.displayTimeLeft(secondsLeft);
    }, 1000);
  }

  displayTimeLeft(timeInSeconds) {
    this.element.innerHTML = ` 
      <strong>${timeInSeconds}</strong>
      <small style="display: inline-block; padding: 0px">seconds</small>
    `;
  }

  dispatchEvent() {
    const event = new Event("timeHasElapsed", { bubbles: true });
    this.element.dispatchEvent(event);
    this.element.innerHTML = null;
  }

  clearTimer() {
    clearInterval(this.interval);
  }
}
