import { FUNCTIONS } from "./functions";

(() => {
  "use strict";

  kintone.events.on("app.record.index.show", (): void => {
    FUNCTIONS.createButton();
  });
})();
