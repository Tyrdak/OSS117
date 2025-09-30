/** @type {import('jest').Config} */
export default {
  testEnvironment: "jsdom",
  transform: {
    "^.+\\.(t|j)sx?$": ["ts-jest", { tsconfig: "tsconfig.jest.json" }],
  },
  moduleNameMapper: {
    "\\.(css|less|scss|sass)$": "identity-obj-proxy",
    "\\.(svg|png|jpg|jpeg|gif|webp|avif)$": "<rootDir>/test/__mocks__/fileMock.js",
  },
  setupFilesAfterEnv: ["<rootDir>/test/setupTests.ts"],
  testMatch: ["**/?(*.)+(spec|test).(ts|tsx)"],
  testPathIgnorePatterns: ["/node_modules/", "/dist/"],

  // Couverture
  collectCoverage: true,
  collectCoverageFrom: [
    "<rootDir>/src/**/*.{ts,tsx}",
    "!<rootDir>/src/**/__tests__/**",
    "!**/*.d.ts",
    "!<rootDir>/src/app/lib/supabaseClient.ts",
  ],
  coverageDirectory: "coverage",

  // Seuil minimum spécifique au Dashboard (plusieurs clés pour matcher les chemins)
  coverageThreshold: {
    "src/app/application/dashboard.tsx": { branches: 80, functions: 80, lines: 80, statements: 80 },
    "<rootDir>/src/app/application/dashboard.tsx": { branches: 80, functions: 80, lines: 80, statements: 80 },
    "**/src/app/application/dashboard.tsx": { branches: 80, functions: 80, lines: 80, statements: 80 },
  },
};
