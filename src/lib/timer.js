export function Timer(callback, delay) {
  let timerId,
    start,
    remaining = delay;

  this.pause = () => {
    window.clearTimeout(timerId);
    remaining -= new Date() - start;
  };

  this.cancel = () => {
    window.clearTimeout(timerId);
  };

  this.resume = () => {
    if (remaining >= 0) {
      start = new Date();
      window.clearTimeout(timerId);
      timerId = window.setTimeout(callback, remaining);
    }
  };

  this.resume();
}
