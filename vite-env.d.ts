/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_KEY: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

// Augment NodeJS.ProcessEnv to strongly type API_KEY
// This assumes @types/node is present or process uses NodeJS.ProcessEnv, which is standard.
declare namespace NodeJS {
  interface ProcessEnv {
    readonly API_KEY: string;
  }
}
