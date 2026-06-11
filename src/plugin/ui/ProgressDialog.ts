import NProgress from "nprogress";

export class ProgressManager {
  start() {
    NProgress.configure({
      showSpinner: true,
      trickle: true,
    });

    NProgress.start();
  }

  setProgress(percent: number) {
    NProgress.set(percent);
  }

  done() {
    NProgress.done();
  }
}
