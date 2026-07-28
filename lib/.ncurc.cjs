"use strict";

module.exports = {
  reject: [
    // Until package is ESM-only
    "type-fest",

    // Until typescript-eslint supports @7
    "typescript",

    // Preference to avoid updating?
    "prettier",
  ],
};
