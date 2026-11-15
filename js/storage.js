"use strict";
(() => {
  const storage = {
    failed: false,
    read(key, fallback) {
      try {
        const value = localStorage.getItem(key);
        return value === null ? fallback : JSON.parse(value);
      } catch (error) {
        if (!(error instanceof SyntaxError)) storage.failed = true;
        return fallback;
      }
    },
    write(key, value) {
      try {
        localStorage.setItem(key, JSON.stringify(value));
        return true;
      } catch {
        storage.failed = true;
        return false;
      }
    }
  };
  window.AutoParts.storage = storage;
})();
