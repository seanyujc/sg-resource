/** @type {import('@ts-jest/dist/types').InitialOptionsTsJest} */
const config = {
  rootDir: ".",
  preset: "ts-jest",
  testEnvironment: "node",
  testRegex: ".spec.ts$",
};

module.exports = config;
